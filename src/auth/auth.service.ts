import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'

import { PrismaService } from '../prisma/prisma.service'
import { AuthDto } from './dtos'

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private config: ConfigService) {}

    async signup(dto: AuthDto, res: Response) {

    }

    async login(dto: AuthDto, res: Response) {

    }

    async refresh(res: Response) {

    }

    async logout(res: Response) {

    }
}