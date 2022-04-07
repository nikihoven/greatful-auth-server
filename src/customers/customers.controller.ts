import { Controller, Get, HttpException, UseGuards } from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'
import { AccessTokenGuard } from '../common/guards'

@Controller('customers')
export class CustomersController {
    constructor(private prisma: PrismaService) {}

    @UseGuards(AccessTokenGuard)
    @Get()
    async getAll() {
        const customers = await this.prisma.user.findMany({
            select: {
                id: true,
                username: true,
                createdAt: true
            }
        })
            .catch(() => {
                throw new HttpException('Prisma server error', 520)
            })

        return {
            customers
        }
    }
}
