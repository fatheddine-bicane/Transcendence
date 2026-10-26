import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './auth/guards/authentication.guard.js';
import { AuthorizationGuard } from './auth/guards/authorization.guard.js';
import { ScheduleModule } from '@nestjs/schedule';
import { RefreshTokenSchedule } from './auth/tasks/refresh-tokens.schedule.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
    imports: [
        // Distributed tracing, auto-correlated logs, request/job metrics, error
        // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
        // ObserveModule.forRoot({
        //     appKey: 'YOUR_APP_KEY',
        //     appSecret: 'YOUR_APP_SECRET',
        //     serviceId: 'backend',
        // }),

        // INFO: imported as global for the guard usage to avoid imports in every module that uses the guard
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET_KEY,
            signOptions: { expiresIn: '15m' },
        }),

        // INFO: cron module for task scheduling
        ScheduleModule.forRoot(),

        PrismaModule,
        AuthModule,
        UsersModule,
    ],
    providers: [
        { provide: APP_GUARD, useClass: AuthenticationGuard },
        { provide: APP_GUARD, useClass: AuthorizationGuard },

        RefreshTokenSchedule,
    ],
})
export class AppModule {}
