import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { SlotsService } from './slots.service.js';
import { RequiredUserTypes } from '../auth/decorators/auth.decorator.js';
import { UserType } from '../users/enums/user-type.enum.js';
import { CreateSlotDto } from './dto/create-slot.dto.js';
import { UpdateSlotDto } from './dto/update-slot.dto.js';
import { StrictValidationPipe } from '../common/pipes/strict-validation.pipe.js';
import { EmptyBodyDto } from '../common/dto/empty.dto.js';

@RequiredUserTypes(UserType.COUNSELOR)
@Controller('slots')
export class SlotsController {
    constructor(private readonly slotsService: SlotsService) {}

    @Post()
    async createSlot(@Body(StrictValidationPipe) body: CreateSlotDto) {
        const slot = await this.slotsService.createSlot(body);
        return { slot };
    }

    @Put()
    async updateSlot(@Body(StrictValidationPipe) body: UpdateSlotDto) {
        const slot = await this.slotsService.updateSlot(body);
        return { slot };
    }

    @Delete(':slotId')
    async deleteSlot(
        @Param('slotId', ParseIntPipe) slotId: number,
        @Body(StrictValidationPipe) _body: EmptyBodyDto,
    ) {
        const slot = await this.slotsService.deleteSlot(slotId);
        return { slot };
    }

    @RequiredUserTypes()
    @Get()
    async getCounselorSlots(
        @Query('counselorId', ParseIntPipe) counselorId: number,
    ) {
        const couselorSlots =
            await this.slotsService.getCounselorSlots(counselorId);
        return { couselorSlots };
    }
}
