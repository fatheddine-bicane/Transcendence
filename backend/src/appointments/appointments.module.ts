import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service.js';
import { AppointmentsController } from './appointments.controller.js';

@Module({
    controllers: [AppointmentsController],
    providers: [AppointmentsService],
})
export class AppointmentsModule {}
