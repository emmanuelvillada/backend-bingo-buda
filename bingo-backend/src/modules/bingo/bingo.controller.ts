import { Controller, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { BingoService } from './bingo.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('bingo')
export class BingoController {
    // eslint-disable-next-line prettier/prettier
    constructor(private readonly bingoService: BingoService) { }

    @Post('join-room/:roomCode')
    async joinGameByRoomCode(@Param('roomCode') roomCode: string, @Req() req) {
        const userId = req.user.userId;
        const game = await this.bingoService.findGameByRoomCode(roomCode);
        return await this.bingoService.joinGame(game.id, userId);
    }

    @Post('create')
    async createGame(@Body('userId') userId: string) {
        return await this.bingoService.createGame(userId);
    }

    @Post('start/:gameId')
    async startGame(@Param('gameId') gameId: string) {
        return await this.bingoService.startGame(gameId);
    }

    @Post('ballot/:gameId')
    async generateBallot(@Param('gameId') gameId: string) {
        return await this.bingoService.generateBallot(gameId);
    }
}
