import { IsISO8601, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSlotDto {
    @IsNotEmpty()
    @IsISO8601({ strict: true })
    startTime: string;

    @IsNotEmpty()
    @IsISO8601({ strict: true })
    endTime: string;

    @IsNumber()
    counselorId: number;
}
