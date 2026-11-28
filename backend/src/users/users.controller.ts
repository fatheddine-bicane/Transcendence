import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    ValidationPipe,
} from '@nestjs/common';

import { UsersService } from './users.service.js';
import { ReviewCounselorDto } from './dto/review-counselor.dto.js';
import { RequiredUserTypes } from '../auth/decorators/auth.decorator.js';
import { UserType } from '../auth/enums/user-type.enum.js';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('counselors/pending')
    @RequiredUserTypes(UserType.INTERNAL)
    getPendingCounselors() {
        return this.usersService.getPendingCounselors();
    }

    @Get('counselors/:id')
    @RequiredUserTypes(UserType.INTERNAL)
    getCounselor(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.getCounselor(id);
    }

    @Patch('counselors/:id/review')
    @RequiredUserTypes(UserType.INTERNAL)
    reviewCounselor(
        @Param('id', ParseIntPipe) id: number,
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
        body: ReviewCounselorDto,
    ) {
        return this.usersService.reviewCounselor(id, body.status, body.feedback);
    }
}
