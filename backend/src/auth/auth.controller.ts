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
    constructor(private readonly authService: AuthService) {}

    @Post('sign-in')
    @HttpCode(HttpStatus.OK)
    async signIn(
        @Body(
            new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
        )
        body: SignInDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<{ accessToken: string }> {
        const { id, userType } = await this.authService.signIn(
            body.email,
            body.password,
        );

        const { accessToken, refreshToken } =
            await this.authService.issueJwtTokenPair(id, userType);

        this.authService.setRefreshTokenCookie(res, refreshToken);

        return { accessToken };
    }

    @Post('sign-up/:user_type')
    async signUp(
        @Body(new SignUpValidationPipe()) body: SignUpDto,
        @Param('user_type', new ParseEnumPipe(UserType)) userType: UserType,
        @Res({ passthrough: true }) res: Response,
    ): Promise<{ accessToken: string }> {
        const id = await this.authService.signUp(body, userType);

        const { accessToken, refreshToken } =
            await this.authService.issueJwtTokenPair(id, userType);

        this.authService.setRefreshTokenCookie(res, refreshToken);

        return { accessToken };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshAccessToken(
        @Body(
            new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
        )
        _body: EmptyBodyDto,
        @Res({ passthrough: true }) res: Response,
        @Cookies('refreshToken') cookieRefreshToken?: string,
    ): Promise<{ accessToken: string }> {
        if (!cookieRefreshToken) {
            throw new UnauthorizedException();
        }

        const { accessToken, refreshToken } =
            await this.authService.refreshAccessToken(cookieRefreshToken);

        this.authService.setRefreshTokenCookie(res, refreshToken);

        return { accessToken };
    }
}
