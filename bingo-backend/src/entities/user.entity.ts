import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
} from 'typeorm';
import { GameParticipant } from './game_participant.entity';
import { BingoCard } from './bingocard.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    googleId: string;

    @Column({ default: 0 })
    points: number;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => GameParticipant, (participant) => participant.user)
    participations: GameParticipant[];

    @OneToMany(() => BingoCard, (bingoCard) => bingoCard.owner)
    bingoCards: BingoCard[];
}
