import { PartialType } from '@nestjs/mapped-types';
import { CreateSlotDto } from './create-slot.dto.js';
import { IsISO8601, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateSlotDto extends PartialType(CreateSlotDto) {
    @IsNumber()
    slotId: number;

    @IsNotEmpty()
    @IsISO8601({ strict: true })
    startTime: string;

    @IsNotEmpty()
    @IsISO8601({ strict: true })
    endTime: string;

    @IsNumber()
    counselorId: number;
}
