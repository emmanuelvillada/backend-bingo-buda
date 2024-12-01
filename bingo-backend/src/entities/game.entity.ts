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

    @Column({
        unique: true,
    })
    roomCode: string; // Código único para la sala

    @Column({ type: 'int', array: true })
    calledNumbers: number[];

    @Column({
        type: 'enum',
        enum: GameStatus,
        default: GameStatus.WAITING,
    })
    status: GameStatus;

    @OneToMany(() => GameParticipant, (participant) => participant.game)
    participants: GameParticipant[];

    @ManyToOne(() => User, { nullable: true })
    winner: User;

    @CreateDateColumn()
    createdAt: Date;
}
