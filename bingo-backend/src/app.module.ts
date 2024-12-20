import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { BingoModule } from './modules/bingo/bingo.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRoot(databaseConfig),
        AuthModule,
        BingoModule,
    ],
    controllers: [],
    providers: [],
})
// eslint-disable-next-line prettier/prettier
export class AppModule { }
