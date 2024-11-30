import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    // eslint-disable-next-line prettier/prettier
    constructor(private authService: AuthService) { }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    // eslint-disable-next-line prettier/prettier
    googleLogin() { }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleLoginCallback(@Req() req, @Res() res) {
        const { access_token, user } = this.authService.generateJwt(req.user);

        // Redirigir al frontend con el token
        res.redirect(`http://localhost:3000/login?token=${access_token}`);
    }
}
