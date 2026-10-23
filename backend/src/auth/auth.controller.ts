import {
    Body,
    Controller,
    Param,
    ParseEnumPipe,
    Post,
    ValidationPipe,
} from '@nestjs/common';
import {
    JWTPair,
    RefreshAccessTokenDto,
    SignInDto,
    type SignUpDto,
} from './dto/auth.dto.js';
import { AuthService } from './auth.service.js';
import { UserType } from './enums/user-type.enum.js';
import { SignUpValidationPipe } from './pipes/user-signup.pipe.js';

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
        const jwt_pair = await this.auth_service.issueJwtTokenPair(
            id,
            user_type,
        );

        return jwt_pair;
    }

    @Post('sign-up/:user_type')
    async signUp(
        @Body(new SignUpValidationPipe()) body: SignUpDto,
        @Param('user_type', new ParseEnumPipe(UserType)) user_type: UserType,
    ): Promise<JWTPair> {
        const id = await this.auth_service.signUp(body, user_type);
        const jwt_pair = await this.auth_service.issueJwtTokenPair(
            id,
            user_type,
        );

        return jwt_pair;
    }

    @Post('refresh')
    async refreshAccessToken(
        @Body(
            new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
        )
        body: RefreshAccessTokenDto,
    ): Promise<JWTPair> {
        const jwt_pair = await this.auth_service.refreshAccessToken(
            body.refresh_token,
        );

        return jwt_pair;
    }
}
