import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST'],
    },
}) // Permite conexiones CORS
export class BingoGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private lobbyTimers: Map<string, NodeJS.Timeout> = new Map();
    private countdowns: Map<string, number> = new Map(); // Tiempo restante por lobby en segundos
    private connectedClients = new Map<string, Socket>();

    handleConnection(client: Socket) {
        console.log('Nuevo cliente conectado:', client.id);
    }

    handleDisconnect(client: Socket) {
        console.log('Cliente desconectado:', client.id);
        this.connectedClients.delete(client.id);

        // Notificar al lobby de la desconexión
        for (const [lobbyId, socket] of this.connectedClients) {
            if (socket === client) {
                this.server
                    .to(lobbyId)
                    .emit('player-disconnected', { id: client.id });
                break;
            }
        }
    }

    notifyPlayerJoined(lobbyId: string, player: { id: string; name: string }) {
        this.server.to(lobbyId).emit('player-joined', player);
    }

    notifyGameStart(lobbyId: string) {
        this.server.to(lobbyId).emit('game-start');
    }

    notifyWinner(lobbyId: string, winner: { id: string; name: string }) {
        this.server.to(lobbyId).emit('game-winner', winner);
    }

    // Enviar nueva balota a todos los jugadores
    sendNewBallot(lobbyId: string, ballot: number) {
        this.server.to(lobbyId).emit('new-ballot', ballot);
    }

    // Notificar descalificación
    notifyDisqualification(
        lobbyId: string,
        player: { id: string; name: string },
    ) {
        this.server.to(lobbyId).emit('player-disqualified', player);
    }

    @SubscribeMessage('join-lobby')
    handleJoinLobby(
        client: Socket,
        @MessageBody()
        data: { lobbyId: string; player: { id: string; name: string } },
    ) {
        console.log('Join Lobby Event Received:', data); // Add this line
        if (!data.lobbyId || !data.player) return;

        client.join(data.lobbyId);
        this.connectedClients.set(client.id, client);
        this.notifyPlayerJoined(data.lobbyId, data.player);

        if (!this.lobbyTimers.has(data.lobbyId)) {
            this.startCountdown(data.lobbyId);
        }
    }

    @SubscribeMessage('request-game-state')
    handleRequestGameState(
        client: Socket,
        @MessageBody() data: { lobbyId: string },
    ) {
        const state = {
            lobbyId: data.lobbyId,
            timeLeft: this.countdowns.get(data.lobbyId) || 0,
        };
        this.server.to(client.id).emit('game-state', state);
    }
    private startCountdown(lobbyId: string) {
        let timeLeft = 60;
        this.countdowns.set(lobbyId, timeLeft);

        const timer = setInterval(() => {
            timeLeft -= 1;
            this.countdowns.set(lobbyId, timeLeft);

            this.server.to(lobbyId).emit('time-left', timeLeft);

            if (timeLeft <= 0) {
                clearInterval(timer);
                this.removeInactiveLobby(lobbyId);
                this.server.to(lobbyId).emit('game-start');
            }
        }, 1000);

        this.lobbyTimers.set(lobbyId, timer);
    }

    private removeInactiveLobby(lobbyId: string) {
        this.lobbyTimers.delete(lobbyId);
        this.countdowns.delete(lobbyId);
        this.server.to(lobbyId).emit('lobby-closed');
        console.log(`Lobby ${lobbyId} eliminado por inactividad`);
    }
}
