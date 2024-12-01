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

@Injectable()
export class BingoService {
    constructor(
        @InjectRepository(Game)
        private readonly gameRepository: Repository<Game>,
        @InjectRepository(GameParticipant)
        private readonly participantRepository: Repository<GameParticipant>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Ballot)
        private readonly ballotRepository: Repository<Ballot>,
        // eslint-disable-next-line prettier/prettier
    ) { }

    async createGame(userId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) throw new NotFoundException('User not found');

        // Genera un código de sala único
        const roomCode = this.generateRoomCode();

        const game = this.gameRepository.create({
            roomCode,
            status: GameStatus.WAITING,
        });
        await this.gameRepository.save(game);

        const participant = this.participantRepository.create({
            user,
            game,
            status: 'active',
        });
        await this.participantRepository.save(participant);

        return { roomCode, gameId: game.id }; // Devuelve el código de sala y el ID del juego
    }

    private generateRoomCode(): string {
        // Genera un código alfanumérico único (puedes ajustar la longitud si es necesario)
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    async joinGame(gameId: string, userId: string) {
        const game = await this.gameRepository.findOne({
            where: { id: gameId },
        });
        if (!game) throw new NotFoundException('Game not found');
        if (game.status !== GameStatus.WAITING)
            throw new BadRequestException('Game is not open for new players');

        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) throw new NotFoundException('User not found');

        const existingParticipant = await this.participantRepository.findOne({
            where: { game: { id: gameId }, user: { id: userId } },
        });
        if (existingParticipant)
            throw new BadRequestException('User is already in the game');

        const participant = this.participantRepository.create({
            user,
            game,
            status: 'active',
        });
        return await this.participantRepository.save(participant);
    }

    //function to find the game id with room code
    async findGameByRoomCode(roomCode: string) {
        const game = await this.gameRepository.findOne({
            where: { roomCode },
        });
        if (!game) throw new NotFoundException('Game not found');
        return game;
    }
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

        return { number: newNumber };
    }

    async startGame(gameId: string) {
        const game = await this.gameRepository.findOne({
            where: { id: gameId },
        });
        if (!game) throw new NotFoundException('Game not found');
        if (game.status !== GameStatus.WAITING)
            throw new BadRequestException('Game is not in a waiting state');

        game.status = GameStatus.ACTIVE;
        await this.gameRepository.save(game);
        return game;
    }

    async endGame(gameId: string) {
        const game = await this.gameRepository.findOne({
            where: { id: gameId },
        });
        if (!game) throw new NotFoundException('Game not found');
        game.status = GameStatus.COMPLETED;
        return await this.gameRepository.save(game);
    }
}
