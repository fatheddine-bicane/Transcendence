import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './base-user.dto.js';
import { UserType } from '../../auth/enums/user-type.enum.js';
import { Allow } from 'class-validator';

export class CreateCounselorDto extends CreateUserDto {
    @Allow()
    type: [UserType.COUNSELOR];
}

export class UpdateCounselorDto extends PartialType(CreateCounselorDto) {}
