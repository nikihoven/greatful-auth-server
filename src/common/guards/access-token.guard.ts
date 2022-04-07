import { AuthGuard } from '@nestjs/passport'
import { ForbiddenException } from '@nestjs/common'
import { JsonWebTokenError } from 'jsonwebtoken'

export class AccessTokenGuard extends AuthGuard('jwt') {
    constructor() {
        super()
    }

    handleRequest(err: any, user: any, info: any, context: any, status: any) {
        if (info instanceof JsonWebTokenError) {
            throw new ForbiddenException()
        }

        return super.handleRequest(err, user, info, context, status)
    }
}