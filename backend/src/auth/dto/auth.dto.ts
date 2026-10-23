import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class SignInDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export type JWTPair = {
    access_token: string;
    refresh_token: string;
};
