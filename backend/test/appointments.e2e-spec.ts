import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { SlotsModule } from '../src/slots/slots.module.js';
import { AppointmentsModule } from '../src/appointments/appointments.module.js';
import { AuthModule } from '../src/auth/auth.module.js';
import { AuthenticationGuard } from '../src/auth/guards/authentication.guard.js';
import { AuthorizationGuard } from '../src/auth/guards/authorization.guard.js';
import { UserType } from '../src/users/enums/user-type.enum.js';
import {
    appointment_state,
    slot_state,
} from '../src/generated/prisma/enums.js';
import { ERROR_MESSAGES } from '../src/common/constants/error-messages.js';
import { AppointmentAccessUserType } from '../src/appointments/enum/user-types.enum.js';

describe('Appointments (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    // =========================================================================
    // DYNAMIC DATE UTILITIES
    // =========================================================================
    function getFutureDate(offsetHours: number): Date {
        const date = new Date(Date.now() + offsetHours * 60 * 60 * 1000);
        date.setMinutes(0, 0, 0);
        return date;
    }

    function createTimeRange(startOffsetHours: number, durationMinutes = 60) {
        const start = getFutureDate(startOffsetHours);
        const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
        return {
            startTime: start.toISOString(),
            endTime: end.toISOString(),
        };
    }

    // =========================================================================
    // TEST ENTITY FACTORIES
    // =========================================================================
    async function createTestUser(
        userType: UserType,
        email: string,
    ): Promise<{
        accessToken: string;
        userId: number;
        counselorId?: number;
        patientId?: number;
    }> {
        const payload = {
            type: userType,
            firstName: 'TestFirst',
            lastName: 'TestLast',
            email,
            password: 'TestPassword@2026',
        };

        const res = await request(app.getHttpServer())
            .post(`/auth/sign-up/${userType}`)
            .send(payload)
            .expect(HttpStatus.CREATED);

        const accessToken: string = res.body.accessToken;

        const user = await prisma.users.findUnique({
            where: { email },
            include: { counselors: true, patients: true },
        });

        if (!user) {
            throw new Error(`Failed to create test user with email ${email}`);
        }

        return {
            accessToken,
            userId: user.id,
            counselorId: user.counselors?.id,
            patientId: user.patients?.id,
        };
    }

    // Helper: Create an open LIVE slot for a counselor
    async function createLiveSlot(
        counselorToken: string,
        counselorId: number,
        offsetHours = 24,
    ): Promise<{ slotId: number; startTime: string; endTime: string }> {
        const timeRange = createTimeRange(offsetHours, 60);

        const res = await request(app.getHttpServer())
            .post('/slots')
            .set('Authorization', `Bearer ${counselorToken}`)
            .send({
                ...timeRange,
                counselorId,
            })
            .expect(HttpStatus.CREATED);

        return {
            slotId: res.body.slot.slotId,
            startTime: timeRange.startTime,
            endTime: timeRange.endTime,
        };
    }

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                PrismaModule,
                AuthModule,
                SlotsModule,
                AppointmentsModule,
                JwtModule.register({
                    global: true,
                    secret: process.env.JWT_SECRET_KEY || 'secret-key-test',
                    signOptions: { expiresIn: '15m' },
                }),
            ],
            providers: [
                { provide: APP_GUARD, useClass: AuthenticationGuard },
                { provide: APP_GUARD, useClass: AuthorizationGuard },
            ],
        }).compile();

        prisma = moduleRef.get(PrismaService);
        app = moduleRef.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        // Enforce strict relational dependency order when clearing state
        await prisma.appointments.deleteMany({});
        await prisma.slots.deleteMany({});
        await prisma.users.deleteMany({});
        await prisma.refresh_tokens.deleteMany({});
    });

    // =========================================================================
    // 1. END-TO-END APPOINTMENTS JOURNEY
    // =========================================================================
    describe('E2E Appointments Journey', () => {
        it('should complete the entire appointment lifecycle: slot creation -> patient booking -> dual listing -> cancellation -> verification', async () => {
            // Step 1: Onboard a Counselor and a Patient
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'journey-counselor@service.com',
            );
            const patient = await createTestUser(
                UserType.PATIENT,
                'journey-patient@service.com',
            );

            const counselorId = counselor.counselorId!;
            const patientId = patient.patientId!;

            // Step 2: Counselor publishes an available LIVE slot
            const slot = await createLiveSlot(
                counselor.accessToken,
                counselorId,
                24,
            );

            // Step 3: Patient books an appointment for this slot
            const bookPayload = {
                slotId: slot.slotId,
                counselorId,
                patientId,
            };

            const bookRes = await request(app.getHttpServer())
                .post('/appointments')
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .send(bookPayload)
                .expect(HttpStatus.CREATED);

            expect(bookRes.body).toHaveProperty('appointement');
            expect(bookRes.body.appointement).toMatchObject({
                appointmentId: expect.any(Number),
            });
            const appointmentId: number =
                bookRes.body.appointement.appointmentId;

            // Step 4: Verify in DB that slot transitioned to BOOKED
            const bookedSlot = await prisma.slots.findUnique({
                where: { id: slot.slotId },
            });
            expect(bookedSlot?.slot_state).toBe(slot_state.BOOKED);

            // Step 5: Verify booking collision (same slot cannot be booked again)
            const secondPatient = await createTestUser(
                UserType.PATIENT,
                'journey-patient2@service.com',
            );
            await request(app.getHttpServer())
                .post('/appointments')
                .set('Authorization', `Bearer ${secondPatient.accessToken}`)
                .send({
                    slotId: slot.slotId,
                    counselorId,
                    patientId: secondPatient.patientId!,
                })
                .expect(HttpStatus.CONFLICT);

            // Step 6: Patient views their pending appointments
            const patientAppointmentsRes = await request(app.getHttpServer())
                .get(
                    `/appointments/${AppointmentAccessUserType.PATIENT}/${patientId}`,
                )
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .expect(HttpStatus.OK);

            expect(patientAppointmentsRes.body.userAppointments).toHaveLength(
                1,
            );
            expect(patientAppointmentsRes.body.userAppointments[0]).toEqual({
                id: appointmentId,
                startTime: slot.startTime,
                endTime: slot.endTime,
                couselorId: counselorId,
                patientId,
            });

            // Step 7: Counselor views their schedule and sees the appointment
            const counselorAppointmentsRes = await request(app.getHttpServer())
                .get(
                    `/appointments/${AppointmentAccessUserType.COUNSELOR}/${counselorId}`,
                )
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .expect(HttpStatus.OK);

            expect(counselorAppointmentsRes.body.userAppointments).toHaveLength(
                1,
            );
            expect(counselorAppointmentsRes.body.userAppointments[0].id).toBe(
                appointmentId,
            );

            // Step 8: Patient cancels the appointment with a reason
            const deleteRes = await request(app.getHttpServer())
                .delete(`/appointments/${appointmentId}`)
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .send({ cancelingReason: 'Schedule conflict' })
                .expect(HttpStatus.OK);

            expect(deleteRes.body).toEqual({
                appointement: { appointmentId },
            });

            // Step 9: Verify state in DB is CANCELED with recorded reason
            const dbAppointment = await prisma.appointments.findUnique({
                where: { id: appointmentId },
            });
            expect(dbAppointment?.state).toBe(appointment_state.CANCELED);
            expect(dbAppointment?.canceling_reason).toBe('Schedule conflict');

            // Step 10: Verify canceled appointments are excluded from active list
            const finalPatientRes = await request(app.getHttpServer())
                .get(
                    `/appointments/${AppointmentAccessUserType.PATIENT}/${patientId}`,
                )
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .expect(HttpStatus.OK);

            expect(finalPatientRes.body.userAppointments).toEqual([]);
        });
    });

    // =========================================================================
    // 2. AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)
    // =========================================================================
    describe('Authentication and RBAC Guards', () => {
        it('should return 401 Unauthorized when Authorization header is missing', async () => {
            await request(app.getHttpServer())
                .post('/appointments')
                .send({
                    slotId: 1,
                    counselorId: 1,
                    patientId: 1,
                })
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('should return 401 Unauthorized when Bearer token is invalid or malformed', async () => {
            await request(app.getHttpServer())
                .post('/appointments')
                .set('Authorization', 'Bearer invalid.token.payload')
                .send({
                    slotId: 1,
                    counselorId: 1,
                    patientId: 1,
                })
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('should return 403 Forbidden when a Counselor attempts to book an appointment (PATIENT only)', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-attempt@service.com',
            );

            await request(app.getHttpServer())
                .post('/appointments')
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .send({
                    slotId: 1,
                    counselorId: counselor.counselorId!,
                    patientId: 1,
                })
                .expect(HttpStatus.FORBIDDEN);
        });

        it('should return 403 Forbidden when an Internal user attempts to delete an appointment', async () => {
            const internal = await createTestUser(
                UserType.INTERNAL,
                'internal@service.com',
            );

            await request(app.getHttpServer())
                .delete('/appointments/1')
                .set('Authorization', `Bearer ${internal.accessToken}`)
                .expect(HttpStatus.FORBIDDEN);
        });

        it('should allow both Counselor and Patient to access DELETE /appointments/:id', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-delauth@service.com',
            );
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient-delauth@service.com',
            );
            const slot = await createLiveSlot(
                counselor.accessToken,
                counselor.counselorId!,
                24,
            );

            // Create appointment
            const bookRes = await request(app.getHttpServer())
                .post('/appointments')
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .send({
                    slotId: slot.slotId,
                    counselorId: counselor.counselorId!,
                    patientId: patient.patientId!,
                })
                .expect(HttpStatus.CREATED);

            const appointmentId = bookRes.body.appointement.appointmentId;

            // Counselor deletes it
            await request(app.getHttpServer())
                .delete(`/appointments/${appointmentId}`)
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .expect(HttpStatus.OK);
        });
    });

    // =========================================================================
    // 3. POST /appointments (BOOKING)
    // =========================================================================
    describe('POST /appointments', () => {
        it('should successfully book a live slot', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-book@service.com',
            );
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient-book@service.com',
            );
            const slot = await createLiveSlot(
                counselor.accessToken,
                counselor.counselorId!,
                24,
            );

            const res = await request(app.getHttpServer())
                .post('/appointments')
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .send({
                    slotId: slot.slotId,
                    counselorId: counselor.counselorId!,
                    patientId: patient.patientId!,
                })
                .expect(HttpStatus.CREATED);

            expect(res.body.appointement).toMatchObject({
                appointmentId: expect.any(Number),
            });
        });

        it('should return 404 Not Found when slotId does not exist', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-noslot@service.com',
            );
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient-noslot@service.com',
            );

            const res = await request(app.getHttpServer())
                .post('/appointments')
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .send({
                    slotId: 999999,
                    counselorId: counselor.counselorId!,
                    patientId: patient.patientId!,
                })
                .expect(HttpStatus.NOT_FOUND);

            expect(res.body.message).toBe(ERROR_MESSAGES.SLOT.NOT_FOUND);
        });

        it('should return 409 Conflict when attempting to book a slot that is already BOOKED', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-booked@service.com',
            );
            const patient1 = await createTestUser(
                UserType.PATIENT,
                'patient1-booked@service.com',
            );
            const patient2 = await createTestUser(
                UserType.PATIENT,
                'patient2-booked@service.com',
            );
            const slot = await createLiveSlot(
                counselor.accessToken,
                counselor.counselorId!,
                24,
            );

            // First booking
            await request(app.getHttpServer())
                .post('/appointments')
                .set('Authorization', `Bearer ${patient1.accessToken}`)
                .send({
                    slotId: slot.slotId,
                    counselorId: counselor.counselorId!,
                    patientId: patient1.patientId!,
                })
                .expect(HttpStatus.CREATED);

            // Second booking on the same slot
            const res = await request(app.getHttpServer())
                .post('/appointments')
                .set('Authorization', `Bearer ${patient2.accessToken}`)
                .send({
                    slotId: slot.slotId,
                    counselorId: counselor.counselorId!,
                    patientId: patient2.patientId!,
                })
                .expect(HttpStatus.CONFLICT);

            expect(res.body.message).toBe(ERROR_MESSAGES.SLOT.NOT_AVAILABLE);
        });

        it('should return 409 Conflict when attempting to book a CANCELED slot', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-cancelslot@service.com',
            );
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient-cancelslot@service.com',
            );
            const slot = await createLiveSlot(
                counselor.accessToken,
                counselor.counselorId!,
                24,
            );

            // Cancel the slot
            await request(app.getHttpServer())
                .delete(`/slots/${slot.slotId}`)
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .expect(HttpStatus.OK);

            // Attempt to book canceled slot
            const res = await request(app.getHttpServer())
                .post('/appointments')
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .send({
                    slotId: slot.slotId,
                    counselorId: counselor.counselorId!,
                    patientId: patient.patientId!,
                })
                .expect(HttpStatus.CONFLICT);

            expect(res.body.message).toBe(ERROR_MESSAGES.SLOT.NOT_AVAILABLE);
        });

        it('should return 400 Bad Request when counselorId does not exist (FK constraint)', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-fkc@service.com',
            );
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient-fkc@service.com',
            );
            const slot = await createLiveSlot(
                counselor.accessToken,
                counselor.counselorId!,
                24,
            );

            const res = await request(app.getHttpServer())
                .post('/appointments')
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .send({
                    slotId: slot.slotId,
                    counselorId: 999999,
                    patientId: patient.patientId!,
                })
                .expect(HttpStatus.BAD_REQUEST);

            expect(res.body.message).toBe(ERROR_MESSAGES.DB.FOREIGN_KEY_FAILED);
        });

        it('should return 400 Bad Request when patientId does not exist (FK constraint)', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-fkp@service.com',
            );
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient-fkp@service.com',
            );
            const slot = await createLiveSlot(
                counselor.accessToken,
                counselor.counselorId!,
                24,
            );

            const res = await request(app.getHttpServer())
                .post('/appointments')
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .send({
                    slotId: slot.slotId,
                    counselorId: counselor.counselorId!,
                    patientId: 999999,
                })
                .expect(HttpStatus.BAD_REQUEST);

            expect(res.body.message).toBe(ERROR_MESSAGES.DB.FOREIGN_KEY_FAILED);
        });

        it('should return 400 Bad Request when payload is missing required fields', async () => {
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient-missing@service.com',
            );

            await request(app.getHttpServer())
                .post('/appointments')
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .send({
                    slotId: 1,
                    // missing counselorId and patientId
                })
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should return 400 Bad Request when body has unexpected properties (StrictValidationPipe)', async () => {
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient-strict@service.com',
            );

            await request(app.getHttpServer())
                .post('/appointments')
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .send({
                    slotId: 1,
                    counselorId: 1,
                    patientId: patient.patientId!,
                    extraProp: 'forbidden',
                })
                .expect(HttpStatus.BAD_REQUEST);
        });
    });

    // =========================================================================
    // 4. DELETE /appointments/:appointmentId (CANCEL)
    // =========================================================================
    describe('DELETE /appointments/:appointmentId', () => {
        it('should cancel an appointment with a canceling reason', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-cancelr@service.com',
            );
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient-cancelr@service.com',
            );
            const slot = await createLiveSlot(
                counselor.accessToken,
                counselor.counselorId!,
                24,
            );

            const bookRes = await request(app.getHttpServer())
                .post('/appointments')
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .send({
                    slotId: slot.slotId,
                    counselorId: counselor.counselorId!,
                    patientId: patient.patientId!,
                })
                .expect(HttpStatus.CREATED);

            const appointmentId = bookRes.body.appointement.appointmentId;

            const res = await request(app.getHttpServer())
                .delete(`/appointments/${appointmentId}`)
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .send({ cancelingReason: 'Personal emergency' })
                .expect(HttpStatus.OK);

            expect(res.body).toEqual({
                appointement: { appointmentId },
            });

            const updated = await prisma.appointments.findUnique({
                where: { id: appointmentId },
            });
            expect(updated?.state).toBe(appointment_state.CANCELED);
            expect(updated?.canceling_reason).toBe('Personal emergency');
        });

        it('should cancel an appointment without providing a canceling reason', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-cancelnr@service.com',
            );
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient-cancelnr@service.com',
            );
            const slot = await createLiveSlot(
                counselor.accessToken,
                counselor.counselorId!,
                24,
            );

            const bookRes = await request(app.getHttpServer())
                .post('/appointments')
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .send({
                    slotId: slot.slotId,
                    counselorId: counselor.counselorId!,
                    patientId: patient.patientId!,
                })
                .expect(HttpStatus.CREATED);

            const appointmentId = bookRes.body.appointement.appointmentId;

            const res = await request(app.getHttpServer())
                .delete(`/appointments/${appointmentId}`)
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .send({})
                .expect(HttpStatus.OK);

            expect(res.body).toEqual({
                appointement: { appointmentId },
            });

            const updated = await prisma.appointments.findUnique({
                where: { id: appointmentId },
            });
            expect(updated?.state).toBe(appointment_state.CANCELED);
            expect(updated?.canceling_reason).toBeNull();
        });

        it('should cancel an appointment when no request body is sent at all', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-cancelnobody@service.com',
            );
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient-cancelnobody@service.com',
            );
            const slot = await createLiveSlot(
                counselor.accessToken,
                counselor.counselorId!,
                24,
            );

            const bookRes = await request(app.getHttpServer())
                .post('/appointments')
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .send({
                    slotId: slot.slotId,
                    counselorId: counselor.counselorId!,
                    patientId: patient.patientId!,
                })
                .expect(HttpStatus.CREATED);

            const appointmentId = bookRes.body.appointement.appointmentId;

            const res = await request(app.getHttpServer())
                .delete(`/appointments/${appointmentId}`)
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .expect(HttpStatus.OK);

            expect(res.body).toEqual({
                appointement: { appointmentId },
            });

            const updated = await prisma.appointments.findUnique({
                where: { id: appointmentId },
            });
            expect(updated?.state).toBe(appointment_state.CANCELED);
            expect(updated?.canceling_reason).toBeNull();
        });

        it('should return 404 Not Found when canceling a non-existent appointment', async () => {
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient-cancel404@service.com',
            );

            const res = await request(app.getHttpServer())
                .delete('/appointments/999999')
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .send({})
                .expect(HttpStatus.NOT_FOUND);

            expect(res.body.message).toBe(ERROR_MESSAGES.DB.NOT_FOUND());
        });

        it('should return 400 Bad Request when appointmentId is not numeric', async () => {
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient-badid@service.com',
            );

            await request(app.getHttpServer())
                .delete('/appointments/invalid-id')
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should return 400 Bad Request when cancelingReason exceeds 200 characters', async () => {
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient-longreason@service.com',
            );

            await request(app.getHttpServer())
                .delete('/appointments/1')
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .send({ cancelingReason: 'A'.repeat(201) })
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should return 400 Bad Request when unrecognized body parameters are provided', async () => {
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient-extrafield@service.com',
            );

            await request(app.getHttpServer())
                .delete('/appointments/1')
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .send({ extra: 'field' })
                .expect(HttpStatus.BAD_REQUEST);
        });
    });

    // =========================================================================
    // 5. GET /appointments/:userType/:userId (LIST USER APPOINTMENTS)
    // =========================================================================
    describe('GET /appointments/:userType/:userId', () => {
        it('should return only PENDING appointments for a Patient', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-getp@service.com',
            );
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient-getp@service.com',
            );

            const slot1 = await createLiveSlot(
                counselor.accessToken,
                counselor.counselorId!,
                24,
            );
            const slot2 = await createLiveSlot(
                counselor.accessToken,
                counselor.counselorId!,
                28,
            );

            // Book Appointment 1 (remains PENDING)
            const appt1Res = await request(app.getHttpServer())
                .post('/appointments')
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .send({
                    slotId: slot1.slotId,
                    counselorId: counselor.counselorId!,
                    patientId: patient.patientId!,
                })
                .expect(HttpStatus.CREATED);

            // Book Appointment 2 (will be CANCELED)
            const appt2Res = await request(app.getHttpServer())
                .post('/appointments')
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .send({
                    slotId: slot2.slotId,
                    counselorId: counselor.counselorId!,
                    patientId: patient.patientId!,
                })
                .expect(HttpStatus.CREATED);

            // Cancel Appointment 2
            await request(app.getHttpServer())
                .delete(
                    `/appointments/${appt2Res.body.appointement.appointmentId}`,
                )
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .expect(HttpStatus.OK);

            // Query Patient appointments
            const res = await request(app.getHttpServer())
                .get(
                    `/appointments/${AppointmentAccessUserType.PATIENT}/${patient.patientId!}`,
                )
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .expect(HttpStatus.OK);

            expect(res.body.userAppointments).toHaveLength(1);
            expect(res.body.userAppointments[0]).toEqual({
                id: appt1Res.body.appointement.appointmentId,
                startTime: slot1.startTime,
                endTime: slot1.endTime,
                couselorId: counselor.counselorId!,
                patientId: patient.patientId!,
            });
        });

        it('should return only PENDING appointments for a Counselor', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-getc@service.com',
            );
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient-getc@service.com',
            );

            const slot = await createLiveSlot(
                counselor.accessToken,
                counselor.counselorId!,
                24,
            );

            const bookRes = await request(app.getHttpServer())
                .post('/appointments')
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .send({
                    slotId: slot.slotId,
                    counselorId: counselor.counselorId!,
                    patientId: patient.patientId!,
                })
                .expect(HttpStatus.CREATED);

            const res = await request(app.getHttpServer())
                .get(
                    `/appointments/${AppointmentAccessUserType.COUNSELOR}/${counselor.counselorId!}`,
                )
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .expect(HttpStatus.OK);

            expect(res.body.userAppointments).toHaveLength(1);
            expect(res.body.userAppointments[0].id).toBe(
                bookRes.body.appointement.appointmentId,
            );
        });

        it('should return an empty array if the user has no pending appointments', async () => {
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient-empty@service.com',
            );

            const res = await request(app.getHttpServer())
                .get(
                    `/appointments/${AppointmentAccessUserType.PATIENT}/${patient.patientId!}`,
                )
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .expect(HttpStatus.OK);

            expect(res.body.userAppointments).toEqual([]);
        });

        it('should return 400 Bad Request when userType parameter is not a valid enum value', async () => {
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient-invalidtype@service.com',
            );

            await request(app.getHttpServer())
                .get(`/appointments/INVALID_ROLE/${patient.patientId!}`)
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should return 400 Bad Request when userId parameter is not numeric', async () => {
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient-badparamid@service.com',
            );

            await request(app.getHttpServer())
                .get(
                    `/appointments/${AppointmentAccessUserType.PATIENT}/not-a-number`,
                )
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .expect(HttpStatus.BAD_REQUEST);
        });
    });
});
