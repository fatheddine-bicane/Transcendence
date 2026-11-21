import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { CreateSlotDto } from './dto/create-slot.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { UpdateSlotDto } from './dto/update-slot.dto.js';
import { slot_state } from '../generated/prisma/enums.js';
import { ERROR_MESSAGES } from '../common/constants/error-messages.js';

@Injectable()
export class SlotsService {
    constructor(private readonly prisma: PrismaService) {}

    // WARNING: adapt the problem+json error format

    async createSlot(body: CreateSlotDto) {
        if (!this.isSlotDurationtValid(body.startTime, body.endTime)) {
            throw new ConflictException(ERROR_MESSAGES.SLOT.INVALID_DURATION);
        }
        if (
            await this.doesSlotCollied(
                body.startTime,
                body.endTime,
                body.counselorId,
            )
        ) {
            throw new ConflictException(ERROR_MESSAGES.SLOT.TIME_CONFLICT);
        }

        try {
            const slot = await this.prisma.slots.create({
                data: {
                    start_time: body.startTime,
                    end_time: body.endTime,
                    counselor_id: body.counselorId,
                },
                omit: {
                    counselor_id: true,
                    slot_state: true,
                },
            });

            return {
                slotId: slot.id,
                startTime: slot.start_time,
                endTime: slot.end_time,
            };
        } catch (error) {
            // ERROR_LOG
            console.error('[SlotsService -> createSlot]: ', error);

            // foreign key dosent exists
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code == 'P2003'
            ) {
                throw new BadRequestException(
                    ERROR_MESSAGES.DB.FOREIGN_KEY_FAILED,
                );
            }
            throw new InternalServerErrorException(
                ERROR_MESSAGES.DB.UNEXPECTED,
            );
        }
    }

    async updateSlot(body: UpdateSlotDto) {
        if (!this.isSlotDurationtValid(body.startTime, body.endTime)) {
            throw new ConflictException(ERROR_MESSAGES.SLOT.INVALID_DURATION);
        }
        if (
            await this.doesSlotCollied(
                body.startTime,
                body.endTime,
                body.counselorId,
            )
        ) {
            throw new ConflictException(ERROR_MESSAGES.SLOT.TIME_CONFLICT);
        }

        try {
            const slot = await this.prisma.slots.update({
                where: { id: body.slotId },
                data: {
                    start_time: new Date(body.startTime),
                    end_time: new Date(body.endTime),
                },
                omit: {
                    counselor_id: true,
                    slot_state: true,
                },
            });

            return {
                slotId: slot.id,
                startTime: slot.start_time,
                endTime: slot.end_time,
            };
        } catch (error) {
            // ERROR_LOG
            console.error('[SlotsService -> updateSlot]: ', error);

            // trying to update a non existing record
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code == 'P2025'
            ) {
                throw new NotFoundException(ERROR_MESSAGES.DB.NOT_FOUND());
            }
            throw new InternalServerErrorException(
                ERROR_MESSAGES.DB.UNEXPECTED,
            );
        }
    }

    // INFO: this endpoint does not actually delete the slot record
    // it marks it canceld for later data collecting
    async deleteSlot(id: number) {
        try {
            const slot = await this.prisma.slots.update({
                where: { id },
                data: { slot_state: slot_state.CANCELED },
                select: { id: true },
            });

            return { slotId: slot.id };
        } catch (error) {
            // ERROR_LOG
            console.error('[SlotsService -> deleteSlot]: ', error);

            // trying to delete a non existing record
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code == 'P2025'
            ) {
                throw new NotFoundException(ERROR_MESSAGES.DB.NOT_FOUND());
            }
            throw new InternalServerErrorException(
                ERROR_MESSAGES.DB.UNEXPECTED,
            );
        }
    }

    async getCounselorSlots(couselorId: number) {
        const slots = await this.prisma.slots.findMany({
            where: {
                AND: [
                    { counselor_id: couselorId },
                    { slot_state: slot_state.LIVE },
                ],
            },
            select: {
                id: true,
                start_time: true,
                end_time: true,
            },
        });

        return slots.map((slot) => {
            return {
                slotId: slot.id,
                startTime: slot.start_time,
                endTime: slot.end_time,
            };
        });
    }

    private isSlotDurationtValid(reqStartTime: string, reqEndTime: string) {
        const startTime = Date.parse(reqStartTime);
        const endTime = Date.parse(reqEndTime);
        const minAllowedTime = 1000 * 60 * 60; // one hour in milliseconds

        return startTime + minAllowedTime <= endTime;
    }

    private async doesSlotCollied(
        startTime: string,
        endTime: string,
        couselorId: number,
    ): Promise<boolean> {
        const slot = await this.prisma.slots.findFirst({
            where: {
                AND: [
                    { counselor_id: couselorId },
                    {
                        OR: [
                            {
                                AND: [
                                    { start_time: { lte: startTime } },
                                    { end_time: { gte: startTime } },
                                ],
                            },
                            {
                                AND: [
                                    { start_time: { lte: endTime } },
                                    { end_time: { gte: endTime } },
                                ],
                            },
                        ],
                    },
                ],
            },
            select: { id: true },
        });

        if (!slot) return false;
        return true;
    }
}
