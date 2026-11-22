import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { counselors_approved_status } from '../generated/prisma/enums.js';

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async reviewCounselor(
        counselorId: number,
        status: counselors_approved_status,
        feedback: string,
    ) {
        if (
            status !== counselors_approved_status.APPROVED &&
            status !== counselors_approved_status.REJECTED
        ) {
            throw new BadRequestException('Invalid review status');
        }
        if (!feedback?.trim()) {
            throw new BadRequestException('Feedback is required');
        }
        const result = await this.prisma.counselors.updateMany({
            where: {
                id: counselorId,
                status: counselors_approved_status.PENDING,
            },
            data: {
                status,
                feedback: feedback.trim(),
            },
        });
        if (result.count === 0) {
            const counselor = await this.prisma.counselors.findUnique({
                where: { id: counselorId },
            });

            if (!counselor) {
                throw new NotFoundException('Counselor not found');
            }

            throw new ConflictException(
                'Counselor has already been reviewed',
            );
        }

        return {
            message: 'Counselor reviewed successfully',
            counselorId,
            status,
            feedback: feedback.trim(),
        };
    }
}