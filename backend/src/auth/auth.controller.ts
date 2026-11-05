import {
    Body,
    Controller,
    Cookies,
    HttpCode,
    HttpStatus,
    Param,
    ParseEnumPipe,
    Post,
    Res,
    UnauthorizedException,
    ValidationPipe,
} from '@nestjs/common';
import { EmptyBodyDto, SignInDto, type SignUpDto } from './dto/auth.dto.js';
import { AuthService } from './auth.service.js';
import { UserType } from './enums/user-type.enum.js';
import { SignUpValidationPipe } from './pipes/user-signup.pipe.js';
import { Public, RequiredUserTypes } from './decorators/auth.decorator.js';
import type { Response } from 'express';

@RequiredUserTypes()
@Public()
@Controller('auth')
export class AuthController {
    constructor(private readonly auth_service: AuthService) {}

    @Post('sign-in')
    @HttpCode(HttpStatus.OK)
    async signIn(
        @Body(
            new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
        )
        body: SignInDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<{ access_token: string }> {
        const { id, user_type } = await this.auth_service.signIn(
            body.email,
            body.password,
        );

        const { access_token, refresh_token } =
            await this.auth_service.issueJwtTokenPair(id, user_type);

        this.auth_service.setRefreshTokenCookie(res, refresh_token);

        return { access_token };
    }

    @Post('sign-up/:user_type')
    async signUp(
        @Body(new SignUpValidationPipe()) body: SignUpDto,
        @Param('user_type', new ParseEnumPipe(UserType)) user_type: UserType,
        @Res({ passthrough: true }) res: Response,
    ): Promise<{ access_token: string }> {
        const id = await this.auth_service.signUp(body, user_type);

        const { access_token, refresh_token } =
            await this.auth_service.issueJwtTokenPair(id, user_type);

        this.auth_service.setRefreshTokenCookie(res, refresh_token);

        return { access_token };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshAccessToken(
        @Body(
            new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
        )
        _body: EmptyBodyDto,
        @Res({ passthrough: true }) res: Response,
        @Cookies('refreshToken') refreshToken?: string,
    ): Promise<{ access_token: string }> {
        if (!refreshToken) {
            throw new UnauthorizedException();
        }

        const { access_token, refresh_token } =
            await this.auth_service.refreshAccessToken(refreshToken);

        this.auth_service.setRefreshTokenCookie(res, refresh_token);

        return { access_token };
    }
}
