import {
    BadRequestException,
    ConflictException,
    HttpException,
    Injectable,
    UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { hash, verify } from 'argon2'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { Response } from 'express'

import { PrismaService } from '../prisma/prisma.service'
import { AuthDto, ResponseAuthDto } from './dtos'

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwtService: JwtService, private config: ConfigService) {}

    async signup(dto: AuthDto, res: Response) {
        const {username, password} = dto

        const passHash = await hash(password)

        const user = await this.prisma.user.create({
            data: {
                username,
                passHash
            }
        }).catch(e => {
            if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new ConflictException({...e.meta})
            }

            throw new HttpException('Prisma server error', 520)
        })

        const accessToken = await this.tokenWorker(user.id, user.username, res)

        const responseData: ResponseAuthDto = {
            id: user.id,
            username: user.username,
            accessToken
        }

        return responseData
    }

    async login(dto: AuthDto, res: Response) {
        const {username, password} = dto

        const user = await this.prisma.user.findUnique({
            where: {
                username
            }
        }).catch(() => {
            throw new HttpException('Prisma server error', 520)
        })

        if (!user) {
            throw new BadRequestException('Incorrect username or password')
        }

        const matchPassword = await verify(user.passHash, password)

        if (!matchPassword) {
            throw new BadRequestException('Incorrect username or password')
        }

        const accessToken = await this.tokenWorker(user.id, user.username, res)

        const responseData: ResponseAuthDto = {
            id: user.id,
            username: user.username,
            accessToken
        }

        return responseData
    }

    async refresh(res: Response, id: string, token: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                id
            }
        }).catch(() => {
            throw new HttpException('Prisma server error', 520)
        })

        if (!user || user.refreshToken !== token) {
            throw new UnauthorizedException()
        }

        const accessToken = await this.tokenWorker(user.id, user.username, res)

        const responseData: ResponseAuthDto = {
            id: user.id,
            username: user.username,
            accessToken
        }

        return responseData
    }

    async logout(res: Response, id: string) {
        await this.prisma.user.updateMany({
            where: {
                id,
                refreshToken: {
                    not: null
                }
            },
            data: {
                refreshToken: null
            }
        }).catch(() => {
            throw new HttpException('Prisma server error', 520)
        })

        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        })

        return true
    }

    async generateTokens(id: string, username: string) {
        const JwtPayload = {id, username}

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(JwtPayload, {
                secret: this.config.get('ACCESS_TOKEN_SECRET'),
                expiresIn: '15m'
            }),
            this.jwtService.signAsync(JwtPayload, {
                secret: this.config.get('REFRESH_TOKEN_SECRET'),
                expiresIn: '7d'
            })
        ])

        return {accessToken, refreshToken}
    }

    async uploadRefreshToken(id: string, refreshToken: string) {
        await this.prisma.user.update({
            where: {
                id
            },
            data: {
                refreshToken
            }
        }).catch(() => {
            throw new HttpException('Prisma server error', 520)
        })
    }

    async tokenWorker(id: string, username: string, res: Response) {
        const {accessToken, refreshToken} = await this.generateTokens(id, username)

        await this.uploadRefreshToken(id, refreshToken)

        res.cookie('token', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        })

        return accessToken
    }
}