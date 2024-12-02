import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => req?.cookies?.Authentication, // Extraer token de la cookie
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'default-secret', // Clave secreta
        });
    }

    async validate(payload: any) {
        return {
            userId: payload.sub,
            name: payload.name,
            email: payload.email,
        };
    }
}
