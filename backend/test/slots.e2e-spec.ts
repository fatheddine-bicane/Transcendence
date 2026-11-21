import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { SlotsModule } from '../src/slots/slots.module.js';
import { AuthModule } from '../src/auth/auth.module.js';
import { AuthenticationGuard } from '../src/auth/guards/authentication.guard.js';
import { AuthorizationGuard } from '../src/auth/guards/authorization.guard.js';
import { UserType } from '../src/users/enums/user-type.enum.js';
import { slot_state } from '../src/generated/prisma/enums.js';
import { ERROR_MESSAGES } from '../src/common/constants/error-messages.js';

describe('Slots (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    // =========================================================================
    // DYNAMIC DATE UTILITIES
    // =========================================================================
    // Dynamic generation decouples tests from calendar time drift and ensures
    // mathematical determinism through epoch arithmetic.
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

    function createOverlappingRange(
        baseRange: { startTime: string; endTime: string },
        shiftMinutes = 30,
        durationMinutes = 60,
    ) {
        const start = new Date(
            new Date(baseRange.startTime).getTime() + shiftMinutes * 60 * 1000,
        );
        const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
        return {
            startTime: start.toISOString(),
            endTime: end.toISOString(),
        };
    }

    // Helper: Register a user and retrieve their access token and optional counselor ID
    async function createTestUser(
        userType: UserType,
        email: string,
    ): Promise<{ accessToken: string; userId: number; counselorId?: number }> {
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
            include: { counselors: true },
        });

        if (!user) {
            throw new Error(`Failed to create test user with email ${email}`);
        }

        return {
            accessToken,
            userId: user.id,
            counselorId: user.counselors?.id,
        };
    }

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                PrismaModule,
                AuthModule,
                SlotsModule,
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
        // Clean up database tables in order of relational dependencies
        await prisma.appointments.deleteMany({});
        await prisma.slots.deleteMany({});
        await prisma.users.deleteMany({});
        await prisma.refresh_tokens.deleteMany({});
    });

    // =========================================================================
    // 1. END-TO-END SLOTS JOURNEY
    // =========================================================================
    describe('E2E Slots Journey', () => {
        it('should complete the entire slot lifecycle: create -> list -> update -> delete -> verify cancellation', async () => {
            // Step 1: Counselor onboarding and authentication
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-journey@service.com',
            );
            const counselorId = counselor.counselorId!;
            const token = counselor.accessToken;

            // Step 2: Counselor creates a new available slot using dynamic date
            const initialSlot = createTimeRange(24, 60);
            const createPayload = {
                ...initialSlot,
                counselorId,
            };

            const createRes = await request(app.getHttpServer())
                .post('/slots')
                .set('Authorization', `Bearer ${token}`)
                .send(createPayload)
                .expect(HttpStatus.CREATED);

            expect(createRes.body).toHaveProperty('slot');
            expect(createRes.body.slot).toMatchObject({
                slotId: expect.any(Number),
                startTime: initialSlot.startTime,
                endTime: initialSlot.endTime,
            });
            const slotId: number = createRes.body.slot.slotId;

            // Step 3: Fetch active slots for this counselor
            const listRes = await request(app.getHttpServer())
                .get('/slots')
                .query({ counselorId })
                .set('Authorization', `Bearer ${token}`)
                .expect(HttpStatus.OK);

            expect(listRes.body).toHaveProperty('couselorSlots');
            expect(listRes.body.couselorSlots).toEqual([
                {
                    slotId,
                    startTime: initialSlot.startTime,
                    endTime: initialSlot.endTime,
                },
            ]);

            // Step 4: Counselor updates slot to a new non-conflicting timeframe
            const updatedSlot = createTimeRange(28, 60);
            const updatePayload = {
                slotId,
                ...updatedSlot,
                counselorId,
            };

            const updateRes = await request(app.getHttpServer())
                .put('/slots')
                .set('Authorization', `Bearer ${token}`)
                .send(updatePayload)
                .expect(HttpStatus.OK);

            expect(updateRes.body.slot).toMatchObject({
                slotId,
                startTime: updatedSlot.startTime,
                endTime: updatedSlot.endTime,
            });

            // Step 5: Counselor cancels / deletes the slot
            const deleteRes = await request(app.getHttpServer())
                .delete(`/slots/${slotId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(HttpStatus.OK);

            expect(deleteRes.body).toEqual({
                slot: { slotId },
            });

            // Step 6: Verify in DB that state is CANCELED (soft delete)
            const dbSlot = await prisma.slots.findUnique({
                where: { id: slotId },
            });
            expect(dbSlot?.slot_state).toBe(slot_state.CANCELED);

            // Step 7: Verify that GET /slots excludes canceled slots
            const finalListRes = await request(app.getHttpServer())
                .get('/slots')
                .query({ counselorId })
                .set('Authorization', `Bearer ${token}`)
                .expect(HttpStatus.OK);

            expect(finalListRes.body.couselorSlots).toEqual([]);
        });
    });

    // =========================================================================
    // 2. AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)
    // =========================================================================
    describe('Authentication and RBAC Guards', () => {
        it('should return 401 Unauthorized when Authorization header is missing', async () => {
            const timeRange = createTimeRange(24, 60);
            await request(app.getHttpServer())
                .post('/slots')
                .send({
                    ...timeRange,
                    counselorId: 1,
                })
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('should return 401 Unauthorized when token is invalid or malformed', async () => {
            const timeRange = createTimeRange(24, 60);
            await request(app.getHttpServer())
                .post('/slots')
                .set('Authorization', 'Bearer invalid.token.string')
                .send({
                    ...timeRange,
                    counselorId: 1,
                })
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('should return 403 Forbidden when a Patient attempts to POST /slots', async () => {
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient@service.com',
            );
            const timeRange = createTimeRange(24, 60);

            await request(app.getHttpServer())
                .post('/slots')
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .send({
                    ...timeRange,
                    counselorId: 1,
                })
                .expect(HttpStatus.FORBIDDEN);
        });

        it('should return 403 Forbidden when a Patient attempts to PUT /slots', async () => {
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient2@service.com',
            );
            const timeRange = createTimeRange(24, 60);

            await request(app.getHttpServer())
                .put('/slots')
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .send({
                    slotId: 1,
                    ...timeRange,
                    counselorId: 1,
                })
                .expect(HttpStatus.FORBIDDEN);
        });

        it('should return 403 Forbidden when a Patient attempts to DELETE /slots/:id', async () => {
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient3@service.com',
            );

            await request(app.getHttpServer())
                .delete('/slots/1')
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .expect(HttpStatus.FORBIDDEN);
        });

        it('should allow a Patient to call GET /slots (allowed for any authenticated user)', async () => {
            const patient = await createTestUser(
                UserType.PATIENT,
                'patient4@service.com',
            );

            const res = await request(app.getHttpServer())
                .get('/slots')
                .query({ counselorId: 999 })
                .set('Authorization', `Bearer ${patient.accessToken}`)
                .expect(HttpStatus.OK);

            expect(res.body).toEqual({ couselorSlots: [] });
        });
    });

    // =========================================================================
    // 3. POST /slots (CREATE)
    // =========================================================================
    describe('POST /slots', () => {
        it('should create a slot successfully with valid 1-hour duration', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-create@service.com',
            );
            const timeRange = createTimeRange(24, 60);

            const payload = {
                ...timeRange,
                counselorId: counselor.counselorId!,
            };

            const res = await request(app.getHttpServer())
                .post('/slots')
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .send(payload)
                .expect(HttpStatus.CREATED);

            expect(res.body.slot).toMatchObject({
                slotId: expect.any(Number),
                startTime: timeRange.startTime,
                endTime: timeRange.endTime,
            });
        });

        it('should return 409 Conflict when slot duration is less than 1 hour', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-short@service.com',
            );
            const shortRange = createTimeRange(24, 30); // 30 minutes duration

            const payload = {
                ...shortRange,
                counselorId: counselor.counselorId!,
            };

            const res = await request(app.getHttpServer())
                .post('/slots')
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .send(payload)
                .expect(HttpStatus.CONFLICT);

            expect(res.body.message).toBe(ERROR_MESSAGES.SLOT.INVALID_DURATION);
        });

        it('should return 409 Conflict when the time range collides with an existing slot', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-collide@service.com',
            );
            const baseSlot = createTimeRange(24, 60);

            // Create initial slot
            await request(app.getHttpServer())
                .post('/slots')
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .send({
                    ...baseSlot,
                    counselorId: counselor.counselorId!,
                })
                .expect(HttpStatus.CREATED);

            // Create overlapping slot shifted by 30 minutes
            const overlappingSlot = createOverlappingRange(baseSlot, 30, 60);

            const res = await request(app.getHttpServer())
                .post('/slots')
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .send({
                    ...overlappingSlot,
                    counselorId: counselor.counselorId!,
                })
                .expect(HttpStatus.CONFLICT);

            expect(res.body.message).toBe(ERROR_MESSAGES.SLOT.TIME_CONFLICT);
        });

        it('should return 400 Bad Request when counselor does not exist (FK constraint)', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-nofk@service.com',
            );
            const timeRange = createTimeRange(24, 60);

            const res = await request(app.getHttpServer())
                .post('/slots')
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .send({
                    ...timeRange,
                    counselorId: 999999,
                })
                .expect(HttpStatus.BAD_REQUEST);

            expect(res.body.message).toBe(ERROR_MESSAGES.DB.FOREIGN_KEY_FAILED);
        });

        it('should return 400 Bad Request when body has missing or invalid date fields', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-badfields@service.com',
            );
            const timeRange = createTimeRange(24, 60);

            await request(app.getHttpServer())
                .post('/slots')
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .send({
                    startTime: 'not-a-valid-date',
                    endTime: timeRange.endTime,
                    counselorId: counselor.counselorId!,
                })
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should return 400 Bad Request on unknown properties (StrictValidationPipe)', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-extra@service.com',
            );
            const timeRange = createTimeRange(24, 60);

            await request(app.getHttpServer())
                .post('/slots')
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .send({
                    ...timeRange,
                    counselorId: counselor.counselorId!,
                    unexpectedField: 'illegal',
                })
                .expect(HttpStatus.BAD_REQUEST);
        });
    });

    // =========================================================================
    // 4. PUT /slots (UPDATE)
    // =========================================================================
    describe('PUT /slots', () => {
        it('should update an existing slot successfully', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-update@service.com',
            );
            const initialSlot = createTimeRange(24, 60);

            // Create initial slot
            const createRes = await request(app.getHttpServer())
                .post('/slots')
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .send({
                    ...initialSlot,
                    counselorId: counselor.counselorId!,
                })
                .expect(HttpStatus.CREATED);

            const slotId = createRes.body.slot.slotId;

            // Update to a new non-conflicting time slot
            const updatedSlot = createTimeRange(30, 60);
            const updateRes = await request(app.getHttpServer())
                .put('/slots')
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .send({
                    slotId,
                    ...updatedSlot,
                    counselorId: counselor.counselorId!,
                })
                .expect(HttpStatus.OK);

            expect(updateRes.body.slot).toMatchObject({
                slotId,
                startTime: updatedSlot.startTime,
                endTime: updatedSlot.endTime,
            });
        });

        it('should return 404 Not Found when updating non-existent slotId', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-updatenotfound@service.com',
            );
            const timeRange = createTimeRange(24, 60);

            const res = await request(app.getHttpServer())
                .put('/slots')
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .send({
                    slotId: 999999,
                    ...timeRange,
                    counselorId: counselor.counselorId!,
                })
                .expect(HttpStatus.NOT_FOUND);

            expect(res.body.message).toBe(ERROR_MESSAGES.DB.NOT_FOUND());
        });

        it('should return 409 Conflict when updating slot to a time overlapping another slot', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-updatecollide@service.com',
            );

            // Slot A
            const slotA = createTimeRange(24, 60);
            const slotARes = await request(app.getHttpServer())
                .post('/slots')
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .send({
                    ...slotA,
                    counselorId: counselor.counselorId!,
                })
                .expect(HttpStatus.CREATED);

            // Slot B (non-overlapping initially)
            const slotB = createTimeRange(30, 60);
            await request(app.getHttpServer())
                .post('/slots')
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .send({
                    ...slotB,
                    counselorId: counselor.counselorId!,
                })
                .expect(HttpStatus.CREATED);

            // Try to update Slot A to overlap with Slot B
            const overlappingSlotB = createOverlappingRange(slotB, 30, 60);

            const res = await request(app.getHttpServer())
                .put('/slots')
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .send({
                    slotId: slotARes.body.slot.slotId,
                    ...overlappingSlotB,
                    counselorId: counselor.counselorId!,
                })
                .expect(HttpStatus.CONFLICT);

            expect(res.body.message).toBe(ERROR_MESSAGES.SLOT.TIME_CONFLICT);
        });

        it('should return 409 Conflict when updated duration is less than 1 hour', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-updateshort@service.com',
            );
            const initialSlot = createTimeRange(24, 60);

            const createRes = await request(app.getHttpServer())
                .post('/slots')
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .send({
                    ...initialSlot,
                    counselorId: counselor.counselorId!,
                })
                .expect(HttpStatus.CREATED);

            const shortSlot = createTimeRange(30, 20); // 20 minutes
            const res = await request(app.getHttpServer())
                .put('/slots')
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .send({
                    slotId: createRes.body.slot.slotId,
                    ...shortSlot,
                    counselorId: counselor.counselorId!,
                })
                .expect(HttpStatus.CONFLICT);

            expect(res.body.message).toBe(ERROR_MESSAGES.SLOT.INVALID_DURATION);
        });
    });

    // =========================================================================
    // 5. DELETE /slots/:slotId (CANCEL)
    // =========================================================================
    describe('DELETE /slots/:slotId', () => {
        it('should soft-delete (cancel) an existing slot', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-del@service.com',
            );
            const slot = createTimeRange(24, 60);

            const createRes = await request(app.getHttpServer())
                .post('/slots')
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .send({
                    ...slot,
                    counselorId: counselor.counselorId!,
                })
                .expect(HttpStatus.CREATED);

            const slotId = createRes.body.slot.slotId;

            const deleteRes = await request(app.getHttpServer())
                .delete(`/slots/${slotId}`)
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .expect(HttpStatus.OK);

            expect(deleteRes.body).toEqual({
                slot: { slotId },
            });

            const dbSlot = await prisma.slots.findUnique({
                where: { id: slotId },
            });
            expect(dbSlot?.slot_state).toBe(slot_state.CANCELED);
        });

        it('should return 404 Not Found when deleting a non-existent slot', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-delnotfound@service.com',
            );

            const res = await request(app.getHttpServer())
                .delete('/slots/999999')
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .expect(HttpStatus.NOT_FOUND);

            expect(res.body.message).toBe(ERROR_MESSAGES.DB.NOT_FOUND());
        });

        it('should return 400 Bad Request when slotId is not a valid integer', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-delbadid@service.com',
            );

            await request(app.getHttpServer())
                .delete('/slots/invalid-id')
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should return 400 Bad Request when request body is not empty (EmptyBodyDto)', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-delbody@service.com',
            );

            await request(app.getHttpServer())
                .delete('/slots/1')
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .send({ unexpected: 'body-content' })
                .expect(HttpStatus.BAD_REQUEST);
        });
    });

    // =========================================================================
    // 6. GET /slots (LIST COUNSELOR SLOTS)
    // =========================================================================
    describe('GET /slots', () => {
        it('should return only LIVE slots for the specified counselor', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-get@service.com',
            );
            const counselorId = counselor.counselorId!;

            // Create Slot 1 (LIVE)
            const slot1 = createTimeRange(24, 60);
            const slot1Res = await request(app.getHttpServer())
                .post('/slots')
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .send({
                    ...slot1,
                    counselorId,
                })
                .expect(HttpStatus.CREATED);

            // Create Slot 2 (LIVE then CANCELED)
            const slot2 = createTimeRange(28, 60);
            const slot2Res = await request(app.getHttpServer())
                .post('/slots')
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .send({
                    ...slot2,
                    counselorId,
                })
                .expect(HttpStatus.CREATED);

            // Cancel Slot 2
            await request(app.getHttpServer())
                .delete(`/slots/${slot2Res.body.slot.slotId}`)
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .expect(HttpStatus.OK);

            // Query slots
            const res = await request(app.getHttpServer())
                .get('/slots')
                .query({ counselorId })
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .expect(HttpStatus.OK);

            expect(res.body.couselorSlots).toHaveLength(1);
            expect(res.body.couselorSlots[0]).toMatchObject({
                slotId: slot1Res.body.slot.slotId,
                startTime: slot1.startTime,
                endTime: slot1.endTime,
            });
        });

        it('should return empty list if counselor has no slots', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-noslots@service.com',
            );

            const res = await request(app.getHttpServer())
                .get('/slots')
                .query({ counselorId: counselor.counselorId! })
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .expect(HttpStatus.OK);

            expect(res.body.couselorSlots).toEqual([]);
        });

        it('should return 400 Bad Request when counselorId query parameter is missing', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-missingquery@service.com',
            );

            await request(app.getHttpServer())
                .get('/slots')
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should return 400 Bad Request when counselorId query parameter is not numeric', async () => {
            const counselor = await createTestUser(
                UserType.COUNSELOR,
                'counselor-nanquery@service.com',
            );

            await request(app.getHttpServer())
                .get('/slots')
                .query({ counselorId: 'abc' })
                .set('Authorization', `Bearer ${counselor.accessToken}`)
                .expect(HttpStatus.BAD_REQUEST);
        });
    });
});
