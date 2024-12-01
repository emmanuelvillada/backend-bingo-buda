import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Game } from './game.entity';

@Entity('ballots')
export class Ballot {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('int')
    number: number;

    @ManyToOne(() => Game, (game) => game.calledNumbers)
    game: Game;
}
