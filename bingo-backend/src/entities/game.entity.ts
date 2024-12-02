import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
import { GameParticipant } from './game_participant.entity';
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

    @Column({ type: 'int', array: true, default: [] })
    calledNumbers: number[];

    @Column({
        type: 'enum',
        enum: GameStatus,
        default: GameStatus.WAITING,
    })
    status: GameStatus;

    @OneToMany(() => GameParticipant, (participant) => participant.game, {
        eager: true,
    })
    participants: GameParticipant[];

    @ManyToOne(() => User, { nullable: true })
    winner: User;

    @CreateDateColumn()
    createdAt: Date;
}
