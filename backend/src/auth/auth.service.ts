import {
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { hash, verify } from 'argon2';
import { PrismaService } from '../prisma/prisma.service.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { CreateCounselorDto } from '../users/dto/counselor-user.dto.js';
import { CreatePatientDto } from '../users/dto/patient-user.dto.js';
import { CreateInternalDto } from '../users/dto/internal-user.dto.js';
import { UserType } from './enums/user-type.enum.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
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
