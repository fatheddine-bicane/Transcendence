import {
    IsEnum,
    IsIn,
    IsNotEmpty,
    IsString,
} from 'class-validator';

import { counselors_approved_status } from '../../generated/prisma/enums.js';

export class ReviewCounselorDto {
    @IsEnum(counselors_approved_status)
    @IsIn([
        counselors_approved_status.APPROVED,
        counselors_approved_status.REJECTED,
    ])
    status: counselors_approved_status;

    @IsString()
    @IsNotEmpty()
    feedback: string;
}