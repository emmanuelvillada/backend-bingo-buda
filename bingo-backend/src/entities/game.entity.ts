import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum GameStatus {
    WAITING = 'waiting',
    ACTIVE = 'active',
    COMPLETED = 'completed',
}

@Entity('games')
export class Game {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('jsonb')
    bingoCard: number[][];

    @Column({
        type: 'enum',
        enum: GameStatus,
        default: GameStatus.WAITING,
    })
    status: GameStatus;

    @Column('int', { array: true, default: [] })
    calledNumbers: number[];

    @ManyToOne(() => User, (user) => user.games)
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}
