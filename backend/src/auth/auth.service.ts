import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { hash, verify } from 'argon2';
import { PrismaService } from '../prisma/prisma.service.js';
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
