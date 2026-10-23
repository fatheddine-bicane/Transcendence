import {
    Body,
    Controller,
    Post,
    ValidationPipe,
} from '@nestjs/common';
import {
    JWTPair,
    SignInDto,
} from './dto/auth.dto.js';
import { AuthService } from './auth.service.js';
import { UserType } from './enums/user-type.enum.js';

@Controller('auth')
export class AuthController {
    constructor(private readonly auth_service: AuthService) {}

    @Post('sign-in')
    async signIn(
        @Body(
            new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
        )
        body: SignInDto,
    ): Promise<JWTPair> {
        const { id, user_type } = await this.auth_service.signIn(
            body.email,
            body.password,
        );
    }
}
