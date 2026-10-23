import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { CreateInternalDto } from '../../users/dto/internal-user.dto.js';
import { CreateCounselorDto } from '../../users/dto/counselor-user.dto.js';
import { CreatePatientDto } from '../../users/dto/patient-user.dto.js';
import { Record } from '@prisma/client/runtime/client';
import { UserType } from '../enums/user-type.enum.js';
import { Type } from '@nestjs/common';

export class SignInDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class RefreshAccessTokenDto {
    @IsString()
    @IsNotEmpty()
    refresh_token: string;
}

export type JWTPair = {
    access_token: string;
    refresh_token: string;
};

export type SignUpDto =
    CreateInternalDto | CreateCounselorDto | CreatePatientDto;

export const SIGNUP_DTO_MAP: Record<UserType, Type<SignUpDto>> = {
    [UserType.INTERNAL]: CreateInternalDto,
    [UserType.COUNSELOR]: CreateCounselorDto,
    [UserType.PATIENT]: CreatePatientDto,
};

export type RequestUserObject = {
    user: {
        id: number;
        user_type: UserType;
    };
};
