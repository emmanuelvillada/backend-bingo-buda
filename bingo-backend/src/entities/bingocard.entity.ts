import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('bingo_cards')
export class BingoCard {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('jsonb')
    card: number[][];

    @ManyToOne(() => User, (user) => user.bingoCards)
    owner: User;
}
