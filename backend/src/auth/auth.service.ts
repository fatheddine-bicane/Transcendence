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

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt_service: JwtService,
    ) {}

    async signIn(
        email: string,
        password: string,
    ): Promise<{ id: number; user_type: UserType }> {
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
            return { id: user.id, user_type: UserType.INTERNAL };
        } else if (user.patients) {
            return { id: user.id, user_type: UserType.PATIENT };
        } else {
            return { id: user.id, user_type: UserType.COUNSELOR };
        }
    }

    async signUp(
        data: CreateInternalDto | CreateCounselorDto | CreatePatientDto,
        user_type: UserType,
    ): Promise<number> {
        try {
            const user = await this.prisma.users.create({
                data: {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    email: data.email,
                    hashed_password: await hash(data.password),
                    ...this.createUserRelation(user_type),
                },
                select: { id: true },
            });

            return user.id;
        } catch (error) {
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

    async refreshAccessToken(refresh_token_encoded: string): Promise<JWTPair> {
        try {
            this.jwt_service.verify(refresh_token_encoded);
        } catch {
            throw new UnauthorizedException();
        }

        const refresh_token = this.jwt_service.decode(refresh_token_encoded);

        const refresh_token_record =
            await this.prisma.refresh_tokens.findUnique({
                where: {
                    jti: refresh_token.jti,
                },
                select: {
                    family: true,
                    status: true,
                },
            });

        if (
            !refresh_token_record ||
            refresh_token_record.status == refresh_token_status.REVOKED
        ) {
            throw new UnauthorizedException();
        } else if (refresh_token_record.status == refresh_token_status.USED) {
            await this.prisma.refresh_tokens.updateMany({
                where: { family: refresh_token_record.family },
                data: { status: refresh_token_status.REVOKED },
            });

            throw new UnauthorizedException();
        }

        const family = refresh_token_record.family as UUID;
        const { subject, user_type } = refresh_token;
        const jwt_pair = await this.issueJwtTokenPair(
            subject,
            user_type,
            family,
        );

        await this.prisma.refresh_tokens.update({
            where: { jti: refresh_token.jti },
            data: { status: refresh_token_status.USED },
        });

        return jwt_pair;
    }

    async issueJwtTokenPair(
        id: number,
        user_type: UserType,
        family: UUID = crypto.randomUUID(),
    ): Promise<JWTPair> {
        const access_toke_payload = { user_type };
        const access_token = await this.jwt_service.signAsync(
            access_toke_payload,
            { subject: String(id) },
        );

        const expiration_date = Math.floor(
            Date.now() / 1000 + 60 * 60 * 24 * 7,
        );
        const refresh_token_payload = { family, user_type };
        const jwt_id = crypto.randomUUID();
        const refresh_token = await this.jwt_service.signAsync(
            refresh_token_payload,
            {
                jwtid: jwt_id,
                expiresIn: expiration_date,
                subject: String(id),
            },
        );

        await this.prisma.refresh_tokens.create({
            data: {
                jti: jwt_id,
                family,
                expires_at: new Date(expiration_date * 1000),
            },
        });

        return { access_token, refresh_token };
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
