import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BingoController } from './bingo.controller';
import { BingoService } from './bingo.service';
import { Game } from '../../entities/game.entity';
import { GameParticipant } from '../../entities/game_participant.entity';
import { Ballot } from '../../entities/ballot.entity';
import { User } from '../../entities/user.entity';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { BingoGateway } from './bingo.gateway';

@Module({
    imports: [TypeOrmModule.forFeature([Game, GameParticipant, Ballot, User])],
    controllers: [BingoController], // Controladores del módulo
    providers: [BingoService, JwtStrategy, BingoGateway], // Servicios y estrategias
})
// eslint-disable-next-line prettier/prettier
export class BingoModule { }
