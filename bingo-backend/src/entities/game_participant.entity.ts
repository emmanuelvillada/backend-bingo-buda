import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
import { Game } from './game.entity';
import { User } from './user.entity';

@Entity('game_participants')
export class GameParticipant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.participations)
    user: User;

    @ManyToOne(() => Game, (game) => game.participants)
    game: Game;

    @Column({
        type: 'enum',
        enum: ['active', 'disqualified', 'winner'],
        default: 'active',
    })
    status: string;

    @CreateDateColumn()
    joinedAt: Date;
}
