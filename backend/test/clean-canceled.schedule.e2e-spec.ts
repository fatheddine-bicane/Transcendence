import { Test } from '@nestjs/testing';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { CleanCanceledSchedule } from '../src/common/tasks/clean-canceled.schedule.js';
import {
    appointment_state,
    slot_state,
} from '../src/generated/prisma/enums.js';
import { CronExpression } from '@nestjs/schedule';

describe('CleanCanceledSchedule (e2e)', () => {
    let schedule: CleanCanceledSchedule;
    let prisma: PrismaService;
    let counselorId: number;
    let patientId: number;

    // Relative epoch date generators to guarantee temporal determinism
    function pastDate(offsetHours: number): Date {
        return new Date(Date.now() - offsetHours * 60 * 60 * 1000);
    }

    function futureDate(offsetHours: number): Date {
        return new Date(Date.now() + offsetHours * 60 * 60 * 1000);
    }

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [PrismaModule],
            providers: [CleanCanceledSchedule],
        }).compile();

        schedule = moduleRef.get(CleanCanceledSchedule);
        prisma = moduleRef.get(PrismaService);
    });

    beforeEach(async () => {
        await prisma.appointments.deleteMany({});
        await prisma.slots.deleteMany({});
        await prisma.users.deleteMany({});

        // Provision Counselor and Patient relations
        const counselorUser = await prisma.users.create({
            data: {
                first_name: 'Cron',
                last_name: 'Counselor',
                email: 'cron-counselor@test.com',
                counselors: { create: {} },
            },
            include: { counselors: true },
        });
        counselorId = counselorUser.counselors!.id;

        const patientUser = await prisma.users.create({
            data: {
                first_name: 'Cron',
                last_name: 'Patient',
                email: 'cron-patient@test.com',
                patients: { create: {} },
            },
            include: { patients: true },
        });
        patientId = patientUser.patients!.id;
    });

    describe('Cron Schedule Configuration', () => {
        it('should be configured to run daily at 1:00 AM', () => {
            expect(CronExpression.EVERY_DAY_AT_1AM).toBe('0 01 * * *');
        });
    });

    describe('Slots Purge Logic (Any state where end_time has passed)', () => {
        it('should delete all past slots regardless of state (LIVE, BOOKED, CANCELED, EXPIRED)', async () => {
            const states = [
                slot_state.LIVE,
                slot_state.BOOKED,
                slot_state.CANCELED,
                slot_state.EXPIRED,
            ];

            const createdSlots = await Promise.all(
                states.map((state, index) =>
                    prisma.slots.create({
                        data: {
                            start_time: pastDate(5 + index),
                            end_time: pastDate(4 + index),
                            slot_state: state,
                            counselor_id: counselorId,
                        },
                    }),
                ),
            );

            await schedule.cleanCanceledSlotsAndAppointments();

            const remaining = await prisma.slots.findMany({
                where: {
                    id: { in: createdSlots.map((s) => s.id) },
                },
            });
            expect(remaining).toHaveLength(0);
        });

        it('should NOT delete future slots regardless of state', async () => {
            const states = [
                slot_state.LIVE,
                slot_state.BOOKED,
                slot_state.CANCELED,
                slot_state.EXPIRED,
            ];

            const futureSlots = await Promise.all(
                states.map((state, index) =>
                    prisma.slots.create({
                        data: {
                            start_time: futureDate(1 + index),
                            end_time: futureDate(2 + index),
                            slot_state: state,
                            counselor_id: counselorId,
                        },
                    }),
                ),
            );

            await schedule.cleanCanceledSlotsAndAppointments();

            const remaining = await prisma.slots.findMany({
                where: {
                    id: { in: futureSlots.map((s) => s.id) },
                },
            });
            expect(remaining).toHaveLength(futureSlots.length);
        });
    });

    describe('Appointments Purge Logic (Any state where slot end_time has passed)', () => {
        it('should delete all past appointments regardless of state (PENDING, CANCELED)', async () => {
            const slotA = await prisma.slots.create({
                data: {
                    start_time: pastDate(6),
                    end_time: pastDate(5),
                    slot_state: slot_state.BOOKED,
                    counselor_id: counselorId,
                },
            });
            const apptPending = await prisma.appointments.create({
                data: {
                    slot_id: slotA.id,
                    counselor_id: counselorId,
                    patient_id: patientId,
                    state: appointment_state.PENDING,
                },
            });

            const slotB = await prisma.slots.create({
                data: {
                    start_time: pastDate(4),
                    end_time: pastDate(3),
                    slot_state: slot_state.BOOKED,
                    counselor_id: counselorId,
                },
            });
            const apptCanceled = await prisma.appointments.create({
                data: {
                    slot_id: slotB.id,
                    counselor_id: counselorId,
                    patient_id: patientId,
                    state: appointment_state.CANCELED,
                    canceling_reason: 'Canceled by user',
                },
            });

            await schedule.cleanCanceledSlotsAndAppointments();

            const remainingAppts = await prisma.appointments.findMany({
                where: {
                    id: { in: [apptPending.id, apptCanceled.id] },
                },
            });
            expect(remainingAppts).toHaveLength(0);
        });

        it('should NOT delete future appointments', async () => {
            const futureSlot = await prisma.slots.create({
                data: {
                    start_time: futureDate(2),
                    end_time: futureDate(3),
                    slot_state: slot_state.BOOKED,
                    counselor_id: counselorId,
                },
            });
            const futureAppt = await prisma.appointments.create({
                data: {
                    slot_id: futureSlot.id,
                    counselor_id: counselorId,
                    patient_id: patientId,
                    state: appointment_state.PENDING,
                },
            });

            await schedule.cleanCanceledSlotsAndAppointments();

            const found = await prisma.appointments.findUnique({
                where: { id: futureAppt.id },
            });
            expect(found).not.toBeNull();
            expect(found?.id).toBe(futureAppt.id);
        });
    });

    describe('Relational Foreign Key Order (Children before Parents)', () => {
        it('should cleanly delete both past appointments and their slots together without foreign key violations', async () => {
            const pastSlot = await prisma.slots.create({
                data: {
                    start_time: pastDate(4),
                    end_time: pastDate(3),
                    slot_state: slot_state.BOOKED,
                    counselor_id: counselorId,
                },
            });

            const pastAppt = await prisma.appointments.create({
                data: {
                    slot_id: pastSlot.id,
                    counselor_id: counselorId,
                    patient_id: patientId,
                    state: appointment_state.PENDING,
                },
            });

            // Running the cleanup must delete the appointment first, then the slot
            await schedule.cleanCanceledSlotsAndAppointments();

            const foundAppt = await prisma.appointments.findUnique({
                where: { id: pastAppt.id },
            });
            const foundSlot = await prisma.slots.findUnique({
                where: { id: pastSlot.id },
            });

            expect(foundAppt).toBeNull();
            expect(foundSlot).toBeNull();
        });
    });
});
