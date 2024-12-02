import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    // eslint-disable-next-line prettier/prettier
    constructor(private authService: AuthService) { }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    //redirect to google for login
    // eslint-disable-next-line prettier/prettier
    googleLogin() { }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleLoginCallback(@Req() req, @Res() res) {
        const { access_token } = this.authService.generateJwt(req.user);

        // Establecer una cookie HTTP-only con el token
        res.cookie('Authentication', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Solo para HTTPS en producción
            sameSite: 'strict', // Evita envío de cookies a dominios cruzados
            maxAge: 3600000, // 1 hora
        });

        res.redirect('http://localhost:3001/home');
    }
    @Get('verify')
    @UseGuards(AuthGuard('jwt'))
    verify(@Req() req) {
        const user = req.user; // Esto proviene del payload del JWT
        return {
            message: 'Authenticated',
            user: {
                id: user.userId,
                name: user.name,
                email: user.email,
            },
        };
    }

    @Get('logout')
    logout(@Res() res) {
        // Limpiar la cookie
        res.clearCookie('Authentication', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        res.redirect('http://localhost:3001/home');
    }
}
