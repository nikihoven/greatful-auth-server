export type JwtPayload = {
    username: string
    id: string
}

export type JwtPayloadWithRt = JwtPayload & {refreshToken: string}