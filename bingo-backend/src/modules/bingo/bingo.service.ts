/* eslint-disable prettier/prettier */
import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../../entities/game.entity';
import { GameParticipant } from '../../entities/game_participant.entity';
import { User } from '../../entities/user.entity';
import { Ballot } from '../../entities/ballot.entity';
import { GameStatus } from '../../entities/game.entity';
import { BingoGateway } from './bingo.gateway'; // Importa el Gateway para WebSocket

@Injectable()
export class BingoService {
    private lobbyTimers: Map<string, NodeJS.Timeout> = new Map();

    constructor(
        @InjectRepository(Game)
        private readonly gameRepository: Repository<Game>,
        @InjectRepository(GameParticipant)
        private readonly participantRepository: Repository<GameParticipant>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Ballot)
        private readonly ballotRepository: Repository<Ballot>,
        private readonly gateway: BingoGateway, // Inyecta el Gateway
    ) { }

    // Manejar unión al lobby
    async handleLobby(userId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) throw new NotFoundException('User not found');

        // Buscar un lobby existente
        let lobby = await this.gameRepository.findOne({
            where: { status: GameStatus.WAITING },
            relations: ['participants', 'participants.user'],
        });

        if (!lobby) {
            // Crear un nuevo lobby
            lobby = this.gameRepository.create({ status: GameStatus.WAITING });
            await this.gameRepository.save(lobby);

            // Configurar temporizador automático de 60 segundos
            this.lobbyTimers.set(
                lobby.id,
                setTimeout(() => this.startGame(lobby.id), 60000),
            );
        }
        if (!lobby.participants) {
            lobby.participants = [];
        }

        // Verificar si el jugador ya está en el lobby
        const isParticipant = lobby.participants.some(
            (participant) => participant.user.id === userId,
        );

        if (!isParticipant) {
            const participant = this.participantRepository.create({
                user,
                game: lobby,
            });
            await this.participantRepository.save(participant);

            // Notificar a todos los jugadores que un nuevo jugador se unió
            this.gateway.notifyPlayerJoined(lobby.id, {
                id: user.id,
                name: user.name,
            });
        }

        // Tiempo restante para el inicio automático del juego
        const timeLeft = this.getRemainingTime(lobby.id);

        return {
            lobbyId: lobby.id,
            players: lobby.participants.map((p) => ({
                id: p.user.id,
                name: p.user.name,
            })),
            timeLeft,
        };
    }

    // Obtener detalles del lobby
    async getLobby(lobbyId: string) {
        const lobby = await this.gameRepository.findOne({
            where: { id: lobbyId },
            relations: ['participants', 'participants.user'],
        });

        if (!lobby) throw new NotFoundException('Lobby not found');

        const timeLeft = this.getRemainingTime(lobby.id);

        return {
            lobbyId: lobby.id,
            players: lobby.participants.map((p) => ({
                id: p.user.id,
                name: p.user.name,
            })),
            timeLeft,
        };
    }

    // Iniciar el juego manualmente o automáticamente
    async startGame(lobbyId: string) {
        const lobby = await this.gameRepository.findOne({
            where: { id: lobbyId },
            relations: ['participants', 'participants.user'],
        });

        if (!lobby) throw new NotFoundException('Lobby not found');



        // Cambiar el estado del juego a ACTIVO
        lobby.status = GameStatus.ACTIVE;

        // Generar tarjetas de bingo para cada jugador
        for (const participant of lobby.participants) {
            participant.user.bingoCards = this.generateBingoCard();
            await this.userRepository.save(participant.user);
        }

        await this.gameRepository.save(lobby);

        // Notificar a todos los jugadores que el juego comenzó
        this.gateway.notifyGameStart(lobby.id);
        console.log(`Juego iniciado en el lobby ${lobbyId}`);
    }

    // Sacar una balota aleatoria
    async generateBallot(gameId: string) {
        const game = await this.gameRepository.findOne({
            where: { id: gameId },
            relations: ['calledNumbers'],
        });

        if (!game) throw new NotFoundException('Game not found');

        const remainingNumbers = Array.from(
            { length: 75 },
            (_, i) => i + 1,
        ).filter((n) => !game.calledNumbers.includes(n));

        if (remainingNumbers.length === 0)
            throw new BadRequestException('All numbers have been called');

        const newNumber =
            remainingNumbers[
            Math.floor(Math.random() * remainingNumbers.length)
            ];

        game.calledNumbers.push(newNumber);

        const ballot = this.ballotRepository.create({
            number: newNumber,
            game,
        });

        await this.ballotRepository.save(ballot);
        await this.gameRepository.save(game);

        // Notificar a todos los jugadores la nueva balota
        this.gateway.sendNewBallot(game.id, newNumber);

        return { number: newNumber };
    }
    async getGameDetails(gameId: string) {
        const game = await this.gameRepository.findOne({
            where: { id: gameId },
            relations: ['participants', 'participants.user'],
        });

        if (!game) throw new NotFoundException('Game not found');

        return {
            gameId: game.id,
            status: game.status,
            players: game.participants.map((p) => ({
                id: p.user.id,
                name: p.user.name,
            })),
            calledNumbers: game.calledNumbers,
        };
    }
    async claimBingo(gameId: string, userId: string): Promise<{ message: string; winner?: string }> {
        const game = await this.gameRepository.findOne({
            where: { id: gameId },
            relations: ['participants', 'participants.user'],
        });

        if (!game) throw new NotFoundException('Game not found');
        if (game.status !== GameStatus.ACTIVE)
            throw new BadRequestException('Game is not active');

        const participant = game.participants.find((p) => p.user.id === userId);
        if (!participant) throw new NotFoundException('Player not found in this game');

        const bingoCards = participant.user.bingoCards;

        if (!bingoCards || bingoCards.length === 0) {
            throw new NotFoundException('No bingo cards found for this player');
        }

        const bingoCard = bingoCards[0].card; // Suponiendo que 'card' es un número[][]

        // Validar si el bingo es correcto
        const isBingoValid = this.validateBingo(bingoCard, game.calledNumbers);

        if (isBingoValid) {
            game.status = GameStatus.COMPLETED;
            await this.gameRepository.save(game);

            this.gateway.notifyWinner(game.id, {
                id: participant.user.id,
                name: participant.user.name,
            });

            return {
                message: 'Bingo validado. ¡Ganaste!',
                winner: participant.user.name,
            };
        } else {
            throw new BadRequestException('El bingo no es válido');
        }
    }


    // Función auxiliar para validar el bingo
    validateBingo(card: number[][], calledNumbers: number[]): boolean {
        // Ejemplo simplificado: Verifica si alguna fila completa está en los números llamados
        for (const row of card) {
            if (row.every((num) => calledNumbers.includes(num))) {
                return true;
            }
        }

        // Otras validaciones (por ejemplo, columnas o diagonales) se pueden agregar aquí

        return false;
    }


    // Generar tarjeta de bingo
    generateBingoCard() {
        const card = [];
        for (let i = 0; i < 5; i++) {
            card.push(
                Array.from(
                    { length: 5 },
                    () => Math.floor(Math.random() * 75) + 1,
                ),
            );
        }
        return card;
    }

    // Calcular tiempo restante para el inicio automático
    private getRemainingTime(lobbyId: string): number {
        const timer = this.lobbyTimers.get(lobbyId);
        if (!timer) return 0;

        const timeout = timer['_idleStart'] + timer['_idleTimeout'];
        return Math.max(Math.floor((timeout - Date.now()) / 1000), 0);
    }

}
