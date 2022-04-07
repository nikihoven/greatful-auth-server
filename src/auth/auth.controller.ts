import { Controller, Get, Post } from '@nestjs/common'

import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    signup() {
        return this.authService.signup()
    }

    @Post('login')
    login() {
        return this.authService.login()
    }

    @Get('refresh')
    refresh() {
        return this.authService.refresh()
    }

    @Get('logout')
    logout() {
        return this.authService.logout()
    }
}