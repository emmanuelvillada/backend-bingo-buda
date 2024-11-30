import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        // eslint-disable-next-line prettier/prettier
    ) { }

    async validateGoogleUser(googleUser: {
        googleId: string;
        name: string;
        email: string;
    }) {
        let user = await this.userRepository.findOne({
            where: { email: googleUser.email },
        });

        if (!user) {
            user = this.userRepository.create({
                googleId: googleUser.googleId,
                name: googleUser.name,
                email: googleUser.email,
            });
            await this.userRepository.save(user);
        }

        return user;
    }

    generateJwt(user: User) {
        const payload = {
            sub: user.id,
            name: user.name,
            email: user.email,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        };
    }
}
