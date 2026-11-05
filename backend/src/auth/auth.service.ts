import {
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { CreateCounselorDto } from '../users/dto/counselor-user.dto.js';
import { CreatePatientDto } from '../users/dto/patient-user.dto.js';
import { CreateInternalDto } from '../users/dto/internal-user.dto.js';
import { UserType } from './enums/user-type.enum.js';
import { refresh_token_status } from '../generated/prisma/enums.js';
import { JWTPair } from './dto/auth.dto.js';
import { UUID } from 'node:crypto';
import { Response } from 'express';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async signIn(
        email: string,
        password: string,
    ): Promise<{ id: number; userType: UserType }> {
        const user = await this.prisma.users.findUnique({
            where: { email },
            select: {
                id: true,
                hashed_password: true,

                internals: true,
                counselors: true,
                patients: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException();
        }

        // OAuth account dont have a password
        if (!user.hashed_password) {
            throw new UnauthorizedException();
        }

        const match = await verify(user.hashed_password, password);
        if (!match) {
            throw new UnauthorizedException();
        }

        if (user.internals) {
            return { id: user.id, userType: UserType.INTERNAL };
        } else if (user.patients) {
            return { id: user.id, userType: UserType.PATIENT };
        } else {
            return { id: user.id, userType: UserType.COUNSELOR };
        }
    }

    async signUp(
        data: CreateInternalDto | CreateCounselorDto | CreatePatientDto,
        userType: UserType,
    ): Promise<number> {
        try {
            const user = await this.prisma.users.create({
                data: {
                    first_name: data.firstName,
                    last_name: data.lastName,
                    email: data.email,
                    hashed_password: await hash(data.password),
                    ...this.createUserRelation(userType),
                },
                select: { id: true },
            });

            return user.id;
        } catch (error) {
            // ERROR_LOG
            console.error('[AuthService -> signUp]: ', error);

            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new UnauthorizedException('Email already in use');
            } else {
                throw new InternalServerErrorException();
            }
        }
    }

    async refreshAccessToken(refreshTokenEncoded: string): Promise<JWTPair> {
        try {
            this.jwtService.verify(refreshTokenEncoded);
        } catch {
            throw new UnauthorizedException();
        }

        const refreshToken = this.jwtService.decode(refreshTokenEncoded);

        const refreshTokenRecord = await this.prisma.refresh_tokens.findUnique({
            where: {
                jti: refreshToken.jti,
            },
            select: {
                family: true,
                status: true,
            },
        });

        if (
            !refreshTokenRecord ||
            refreshTokenRecord.status == refresh_token_status.REVOKED
        ) {
            throw new UnauthorizedException();
        } else if (refreshTokenRecord.status == refresh_token_status.USED) {
            await this.prisma.refresh_tokens.updateMany({
                where: { family: refreshTokenRecord.family },
                data: { status: refresh_token_status.REVOKED },
            });

            throw new UnauthorizedException();
        }

        const family = refreshTokenRecord.family as UUID;
        const { subject, userType } = refreshToken;
        const jwtPair = await this.issueJwtTokenPair(subject, userType, family);

        await this.prisma.refresh_tokens.update({
            where: { jti: refreshToken.jti },
            data: { status: refresh_token_status.USED },
        });

        return jwtPair;
    }

    async issueJwtTokenPair(
        id: number,
        userType: UserType,
        family: UUID = crypto.randomUUID(),
    ): Promise<JWTPair> {
        const accessTokePayload = { user_type: userType };
        const accessToken = await this.jwtService.signAsync(accessTokePayload, {
            subject: String(id),
        });

        const expirationDate = Math.floor(Date.now() / 1000 + 60 * 60 * 24 * 7);
        const refreshTokenPayload = { family, user_type: userType };
        const jwtId = crypto.randomUUID();
        const refreshToken = await this.jwtService.signAsync(
            refreshTokenPayload,
            {
                jwtid: jwtId,
                expiresIn: expirationDate,
                subject: String(id),
            },
        );

        await this.prisma.refresh_tokens.create({
            data: {
                jti: jwtId,
                family,
                expires_at: new Date(expirationDate * 1000),
            },
        });

        return { accessToken, refreshToken };
    }

    setRefreshTokenCookie(res: Response, refreshToken: string) {
        const expirationDate = Math.floor(Date.now() / 1000 + 60 * 60 * 24 * 7);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/auth/refresh',
            maxAge: expirationDate,
        });
    }

    private createUserRelation(user_type: UserType) {
        switch (user_type) {
            case UserType.INTERNAL:
                return { internals: { create: {} } };

            case UserType.COUNSELOR:
                return { counselors: { create: {} } };

            case UserType.PATIENT:
                return { patients: { create: {} } };
        }
    }
}
