import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class RefreshTokenSchedule {
    constructor(private readonly prisma: PrismaService) {}

    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async cleanExpiredRefreshTokens() {
        const curent_time = new Date();

        await this.prisma.refresh_tokens.deleteMany({
            where: { expires_at: { lt: curent_time } },
        });
    }
}
