import { IsNotEmpty, IsString, Length } from 'class-validator'

export class AuthDto {
    @IsNotEmpty({message: 'Username is required'})
    @IsString({message: 'Username must be a string'})
    @Length(6, 24, {message: 'Username must contain more than 6 and less than 24 characters'})
    username: string

    @IsNotEmpty({message: 'Password is required'})
    @IsString()
    @Length(6, 24, {message: 'Password must contain more than 6 and less than 24 characters'})
    password: string
}

export type ResponseAuthDto = {
    id: string
    username: string
    accessToken: string
}