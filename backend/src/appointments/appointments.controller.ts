import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseEnumPipe,
    ParseIntPipe,
    Post,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service.js';
import { RequiredUserTypes } from '../auth/decorators/auth.decorator.js';
import { UserType } from '../users/enums/user-type.enum.js';
import { StrictValidationPipe } from '../common/pipes/strict-validation.pipe.js';
import { CreateAppointmentDto } from './dto/create-appointments.dto.js';
import { DeleteAppointmentDto } from './dto/delete-appointment.dto.js';
import { EmptyBodyDto } from '../common/dto/empty.dto.js';
import { AppointmentAccessUserType } from './enum/user-types.enum.js';

@Controller('appointments')
export class AppointmentsController {
    constructor(private readonly appointmentsService: AppointmentsService) {}

    @RequiredUserTypes(UserType.PATIENT)
    @Post()
    async createAppointment(
        @Body(StrictValidationPipe) body: CreateAppointmentDto,
    ) {
        const appointement = await this.appointmentsService.createAppointment(
            body.slotId,
            body.counselorId,
            body.patientId,
        );

        return { appointement };
    }

    @RequiredUserTypes(UserType.COUNSELOR, UserType.PATIENT)
    @Delete(':appointmentId')
    async deleteAppointment(
        @Param('appointmentId', ParseIntPipe) appointmentId: number,
        @Body(StrictValidationPipe) body?: DeleteAppointmentDto,
    ) {
        const appointement = await this.appointmentsService.deleteAppointment(
            appointmentId,
            body?.cancelingReason,
        );

        return { appointement };
    }

    @Get(':userType/:userId')
    async getUserAppointments(
        @Param('userType', new ParseEnumPipe(AppointmentAccessUserType))
        userType: AppointmentAccessUserType,
        @Param('userId', ParseIntPipe) userId: number,
        @Body(StrictValidationPipe) _body: EmptyBodyDto,
    ) {
        const userAppointments =
            await this.appointmentsService.getUserAppointments(
                userType,
                userId,
            );

        return { userAppointments };
    }
}
