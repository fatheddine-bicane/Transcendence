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
    let auth_controller: INestApplication;
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
        auth_controller = moduleRef.createNestApplication();
        await auth_controller.init();
    });

    afterAll(async () => {
        await auth_controller.close();
    });

    beforeEach(async () => {
        await prisma.users.deleteMany({});
        await prisma.refresh_tokens.deleteMany({});
    });

    // TEST: /auth/sign-in
    // -------------------------------------------------------
    async function signIn(obj: any) {
        const email = 'test-email@service.com';
        const plain_password = 'Testing@2026';
        const hashed_password = await hash(plain_password);

        await prisma.users.create({
            data: {
                first_name: 'testFirstName',
                last_name: 'testLastName',
                email,
                hashed_password,
                ...obj,
            },
        });

        const response = await request(auth_controller.getHttpServer())
            .post('/auth/sign-in')
            .send({ email, password: plain_password })
            .expect(HttpStatus.OK);

        expect(response.body).toEqual({
            access_token: expect.any(String),
            refresh_token: expect.any(String),
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
    async function signUp(user_type: UserType) {
        const request_payload = {
            type: user_type,
            first_name: 'testFirstName',
            last_name: 'testLastName',
            email: 'test-email@service.com',
            password: 'TestPassword@2026',
        };

        const response = await request(auth_controller.getHttpServer())
            .post(`/auth/sign-up/${user_type}`)
            .send(request_payload)
            .expect(HttpStatus.CREATED);

        expect(response.body).toEqual({
            access_token: expect.any(String),
            refresh_token: expect.any(String),
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
        const plain_password = 'Testing@2026';
        const hashed_password = await hash(plain_password);

        // create the user
        await prisma.users.create({
            data: {
                first_name: 'testFirstName',
                last_name: 'testLastName',
                email,
                hashed_password,
                patients: { create: {} },
            },
        });

        // singIn and get the refresh token
        const { body } = await request(auth_controller.getHttpServer())
            .post('/auth/sign-in')
            .send({ email, password: plain_password });
        const { refresh_token } = body;

        // act and assert the refresh endpoint
        const response = await request(auth_controller.getHttpServer())
            .post('/auth/refresh')
            .send({ refresh_token })
            .expect(HttpStatus.OK);

        expect(response.body).toEqual({
            access_token: expect.any(String),
            refresh_token: expect.any(String),
        });
    });
    // -------------------------------------------------------
});
