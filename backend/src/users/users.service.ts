import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { counselors_approved_status } from '../generated/prisma/enums.js';

const COUNSELOR_USER_SELECT = {
    select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        created_at: true,
    },
} as const;

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async getPendingCounselors() {
        return this.prisma.counselors.findMany({
            where: { status: counselors_approved_status.PENDING },
            include: { users: COUNSELOR_USER_SELECT },
            orderBy: { users: { created_at: 'asc' } },
        });
    }

    async getCounselor(counselorId: number) {
        const counselor = await this.prisma.counselors.findUnique({
            where: { id: counselorId },
            include: { users: COUNSELOR_USER_SELECT },
        });
        if (!counselor) throw new NotFoundException('Counselor not found');
        return counselor;
    }

    async reviewCounselor(
        counselorId: number,
        status: counselors_approved_status,
        feedback: string,
    ) {
        const result = await this.prisma.counselors.updateMany({
            where: { id: counselorId, status: counselors_approved_status.PENDING },
            data: { status, feedback: feedback.trim() },
        });

        if (result.count === 0) {
            const counselor = await this.prisma.counselors.findUnique({
                where: { id: counselorId },
            });
            if (!counselor) throw new NotFoundException('Counselor not found');
            throw new ConflictException('Counselor has already been reviewed');
        }

        return {
            message: 'Counselor reviewed successfully',
            counselorId,
            status,
            feedback: feedback.trim(),
        };
    }
}
