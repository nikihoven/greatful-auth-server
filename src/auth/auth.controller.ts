import { Body, Controller, Get, Post, Res } from '@nestjs/common'

import { AuthService } from './auth.service'
import { ResponseAuthDto } from './dtos'

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    signup(@Body() dto: ResponseAuthDto, @Res({passthrough: true}) res) {
        return this.authService.signup(dto, res)
    }

    @Post('login')
    login(@Body() dto: ResponseAuthDto, @Res({passthrough: true}) res) {
        return this.authService.login(dto, res)
    }

    @Get('refresh')
    refresh(@Res({passthrough: true}) res) {
        return this.authService.refresh(res)
    }

    @Get('logout')
    logout(@Res({passthrough: true}) res) {
        return this.authService.logout(res)
    }
}