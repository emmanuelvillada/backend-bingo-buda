import { Controller, Post, Param, UseGuards, Req, Get } from '@nestjs/common';
import { BingoService } from './bingo.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('bingo')
export class BingoController {
    // eslint-disable-next-line prettier/prettier
    constructor(private readonly bingoService: BingoService) { }

    // Generar una nueva balota
    @Post('ballot/:gameId')
    async generateBallot(@Param('gameId') gameId: string) {
        return await this.bingoService.generateBallot(gameId);
    }

    // Unirse o crear un lobby
    @Post('lobby/join')
    async joinLobby(@Req() req) {
        const userId = req.user.userId; // Obtener el userId del JWT
        if (!userId) {
            throw new Error('User ID or name not provided');
        }
        return await this.bingoService.handleLobby(userId);
    }

    // Obtener detalles del lobby
    @Get('lobby/:lobbyId')
    async getLobby(@Param('lobbyId') lobbyId: string) {
        return await this.bingoService.getLobby(lobbyId);
    }

    // Forzar el inicio del juego
    @Post('game/start/:lobbyId')
    async startGame(@Param('lobbyId') lobbyId: string) {
        return await this.bingoService.startGame(lobbyId);
    }

    @Get('game/:gameId')
    async getGameDetails(@Param('gameId') gameId: string) {
        return await this.bingoService.getGameDetails(gameId);
    }
    @Post('game/:gameId/claim')
    async claimBingo(@Param('gameId') gameId: string, @Req() req) {
        const userId = req.user.userId; // Obtener el ID del usuario autenticado
        return await this.bingoService.claimBingo(gameId, userId);
    }
}
