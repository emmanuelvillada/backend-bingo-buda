import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

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

    @Column('array')
    games: string[];
}
