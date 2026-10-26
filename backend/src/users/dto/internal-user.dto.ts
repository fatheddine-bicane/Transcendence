import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './base-user.dto.js';
import { UserType } from '../../auth/enums/user-type.enum.js';
import { Allow } from 'class-validator';

export class CreateInternalDto extends CreateUserDto {
    @Allow()
    type: [UserType.INTERNAL];
}

export class UpdateInternalDto extends PartialType(CreateInternalDto) {}
