import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { appointment_state, slot_state } from '../generated/prisma/enums.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { ERROR_MESSAGES } from '../common/constants/error-messages.js';
import { AppointmentAccessUserType } from './enum/user-types.enum.js';
import { UserAppointment } from './interfaces/user-appointments.interface.js';

@Injectable()
export class AppointmentsService {
    constructor(private readonly prisma: PrismaService) {}

    async createAppointment(
        slotId: number,
        counselorId: number,
        patientId: number,
    ) {
        const appointment = await this.prisma.$transaction(async (tx) => {
            const slot = await tx.slots.findUnique({
                where: { id: slotId },
                select: { id: true, slot_state: true },
            });

            if (!slot) {
                throw new NotFoundException(ERROR_MESSAGES.SLOT.NOT_FOUND);
            }

            if (slot.slot_state != slot_state.LIVE) {
                throw new ConflictException(ERROR_MESSAGES.SLOT.NOT_AVAILABLE);
            }

            await tx.slots.update({
                where: { id: slotId },
                data: { slot_state: slot_state.BOOKED },
            });

            try {
                const appointment = await tx.appointments.create({
                    data: {
                        slot_id: slotId,
                        counselor_id: counselorId,
                        patient_id: patientId,
                    },
                    select: { id: true },
                });

                return appointment;
            } catch (error) {
                // ERROR_LOG
                console.error(
                    '[AppointmentsService -> createAppointment]: ',
                    error,
                );

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
        });

        return { appointmentId: appointment.id };
    }

    async deleteAppointment(appointmentId: number, cancelingReason?: string) {
        try {
            const appointment = await this.prisma.appointments.update({
                where: { id: appointmentId },
                data: {
                    state: appointment_state.CANCELED,
                    ...(cancelingReason && {
                        canceling_reason: cancelingReason,
                    }),
                },
                select: { id: true },
            });

            return { appointmentId: appointment.id };
        } catch (error) {
            // ERROR_LOG
            console.error(
                '[AppointmentsService -> deleteAppointment]: ',
                error,
            );

            // trying to delete a non existing record
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code.toUpperCase() === 'P2025'
            ) {
                throw new NotFoundException(ERROR_MESSAGES.DB.NOT_FOUND());
            }
            throw new InternalServerErrorException(
                ERROR_MESSAGES.DB.UNEXPECTED,
            );
        }
    }

    async getUserAppointments(
        userType: AppointmentAccessUserType,
        userId: number,
    ): Promise<UserAppointment[]> {
        const appointments = await this.prisma.appointments.findMany({
            where: {
                AND: [
                    { state: appointment_state.PENDING },
                    {
                        ...((userType ==
                            AppointmentAccessUserType.COUNSELOR && {
                            counselor_id: userId,
                        }) ||
                            (userType == AppointmentAccessUserType.PATIENT && {
                                patient_id: userId,
                            })),
                    },
                ],
            },
            select: {
                id: true,
                counselor_id: true,
                patient_id: true,
                slots: { select: { start_time: true, end_time: true } },
            },
        });

        return appointments.map((appointment) => {
            return new UserAppointment(
                appointment.id,
                appointment.slots.start_time,
                appointment.slots.end_time,
                appointment.counselor_id,
                appointment.patient_id,
            );
        });
    }
}
