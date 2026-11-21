import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DeleteAppointmentDto {
    @IsOptional()
    @IsString()
    @MaxLength(200)
    cancelingReason?: string;
}
