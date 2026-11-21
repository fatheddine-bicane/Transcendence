import { IsNumber } from 'class-validator';

export class CreateAppointmentDto {
    @IsNumber()
    slotId: number;

    @IsNumber()
    counselorId: number;

    @IsNumber()
    patientId: number;
}
