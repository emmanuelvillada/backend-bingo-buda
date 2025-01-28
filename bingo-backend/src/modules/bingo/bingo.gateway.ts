import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface user {
    id: string;
    name: string;
}
@WebSocketGateway({
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST'],
    },
}) // Permite conexiones CORS
export class BingoGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    //Notify all players that a new player has joined the lobby
    @SubscribeMessage('join')
    notifyPlayerJoined(lobbyId: string, user: user) {
        console.log(`User ${user.name} has joined the lobby ${lobbyId}`);
        this.server
            .to(lobbyId)
            .emit(`New player joined the lobby ${user.id}  in lobby `, lobbyId);
    }

    //Notify all players that the game has started
    @SubscribeMessage('start')
    notifyGameStart(lobbyId: string) {
        console.log(`Game started in lobby ${lobbyId}`);
        this.server.to(lobbyId).emit('Game started');
    }

    //Notify all players that the game has ended
    @SubscribeMessage('end')
    notifyGameEnded(lobbyId: string) {
        console.log(`Game ended in lobby ${lobbyId}`);
        this.server.to(lobbyId).emit('Game ended');
    }

    //Notify all players that a new ballot has been generated
    @SubscribeMessage('ballot')
    notifyBallotGenerated(gameId: string, newNumber: number) {
        console.log(`Ballot generated in lobby ${gameId}: ${newNumber}`);
        this.server.to(gameId).emit('Ballot generated', newNumber);
    }

    //Notify all players that a player has won
    @SubscribeMessage('win')
    notifyWinner(gameId: string, user: user) {
        console.log(`Player ${user.name} has won in lobby ${gameId}`);
        this.server.to(gameId).emit('Winner', user);
    }
}
