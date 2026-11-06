import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthModule } from '../src/auth/auth.module.js';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { hash } from 'argon2';
import { UserType } from '../src/auth/enums/user-type.enum.js';

describe('Auth', () => {
    let authController: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                PrismaModule,
                AuthModule,
                JwtModule.register({
                    global: true,
                    secret: process.env.JWT_SECRET_KEY || 'secret-key-test',
                    signOptions: { expiresIn: '15m' },
                }),
            ],
        }).compile();

        prisma = moduleRef.get(PrismaService);
        authController = moduleRef.createNestApplication();
        await authController.init();
    });

    afterAll(async () => {
        await authController.close();
    });

    beforeEach(async () => {
        await prisma.users.deleteMany({});
        await prisma.refresh_tokens.deleteMany({});
    });

    // TEST: /auth/sign-in
    // -------------------------------------------------------
    async function signIn(obj: any) {
        const email = 'test-email@service.com';
        const plainPassword = 'Testing@2026';
        const hashedPassword = await hash(plainPassword);

        await prisma.users.create({
            data: {
                first_name: 'testFirstName',
                last_name: 'testLastName',
                email,
                hashed_password: hashedPassword,
                ...obj,
            },
        });

        const response = await request(authController.getHttpServer())
            .post('/auth/sign-in')
            .send({ email, password: plainPassword })
            .expect(HttpStatus.OK);

        const cookies = response.headers['set-cookie'];
        expect(cookies).toBeDefined();
        expect(cookies[0]).toContain('refreshToken=');
        expect(cookies[0]).toContain('HttpOnly');

        expect(response.body).toEqual({
            accessToken: expect.any(String),
        });
    }

    it('should successfully sign in an internal user', async () => {
        await signIn({ internals: { create: {} } });
    });

    it('should successfully sign in a counselor user', async () => {
        await signIn({ counselors: { create: {} } });
    });

    it('should successfully sign in a patient user', async () => {
        await signIn({ patients: { create: {} } });
    });
    // -------------------------------------------------------

    // TEST: /auth/sign-up/:user_type
    // -------------------------------------------------------
    async function signUp(userType: UserType) {
        const requestPayload = {
            type: userType,
            firstName: 'testFirstName',
            lastName: 'testLastName',
            email: 'test-email@service.com',
            password: 'TestPassword@2026',
        };

        const response = await request(authController.getHttpServer())
            .post(`/auth/sign-up/${userType}`)
            .send(requestPayload)
            .expect(HttpStatus.CREATED);

        const cookies = response.headers['set-cookie'];
        expect(cookies).toBeDefined();
        expect(cookies[0]).toContain('refreshToken=');
        expect(cookies[0]).toContain('HttpOnly');

        expect(response.body).toEqual({
            accessToken: expect.any(String),
        });
    }

    it('should successfully sign up an internal user', async () => {
        await signUp(UserType.INTERNAL);
    });

    it('should successfully sign up a counselor user', async () => {
        await signUp(UserType.COUNSELOR);
    });

    it('should successfully sign up a patient user', async () => {
        await signUp(UserType.PATIENT);
    });

    // -------------------------------------------------------

    // TEST: /auth/refresh
    // -------------------------------------------------------
    it('should successfully create a new access refresh pair of tokens', async () => {
        const email = 'test-email@service.com';
        const plainPassword = 'Testing@2026';
        const hashedPassword = await hash(plainPassword);

        // create the user
        await prisma.users.create({
            data: {
                first_name: 'testFirstName',
                last_name: 'testLastName',
                email,
                hashed_password: hashedPassword,
                patients: { create: {} },
            },
        });

        // singIn and get the refresh token
        const { headers } = await request(authController.getHttpServer())
            .post('/auth/sign-in')
            .send({ email, password: plainPassword });
        let signInCookies = headers['set-cookie'] as any as string[];
        let refreshToken = signInCookies
            .find((cookie) => cookie.startsWith('refreshToken='))
            ?.split(';')[0]
            .split('=')[1];

        // act and assert the refresh endpoint
        const response = await request(authController.getHttpServer())
            .post('/auth/refresh')
            .set('Cookie', `refreshToken=${refreshToken}`)
            .expect(HttpStatus.OK);

        const cookies = response.headers['set-cookie'];
        expect(cookies).toBeDefined();
        expect(cookies[0]).toContain('refreshToken=');
        expect(cookies[0]).toContain('HttpOnly');

        expect(response.body).toEqual({
            accessToken: expect.any(String),
        });
    });
    // -------------------------------------------------------
});
