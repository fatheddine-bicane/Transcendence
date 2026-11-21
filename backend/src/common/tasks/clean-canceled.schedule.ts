import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class CleanCanceledSchedule {
    constructor(private readonly prisma: PrismaService) {}

    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async cleanCanceledSlotsAndAppointments(targetDate: Date = new Date()) {
        // delete all appointments whose slots end time has passed
        await this.prisma.appointments.deleteMany({
            where: {
                slots: {
                    end_time: { lte: targetDate },
                },
            },
        });

        // delete all slots whose end time has passed
        await this.prisma.slots.deleteMany({
            where: {
                end_time: { lte: targetDate },
            },
        });
    }
}
