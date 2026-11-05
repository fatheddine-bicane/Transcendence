import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { SIGNUP_DTO_MAP } from '../dto/auth.dto.js';
import { validate } from 'class-validator';
import { UserType } from '../enums/user-type.enum.js';

@Injectable()
export class SignUpValidationPipe implements PipeTransform {
    async transform(value: any) {
        if (!value || typeof value !== 'object' || !value.type) {
            throw new BadRequestException('Missing payload type discriminator');
        }

        const targetDtoClass = SIGNUP_DTO_MAP[value.type as UserType];
        if (!targetDtoClass) {
            throw new BadRequestException(
                `Unsupported dto type: ${value.type}`,
            );
        }

        const objectInstance = plainToInstance(targetDtoClass, value);

        const errors = await validate(objectInstance, {
            whitelist: true,
            forbidNonWhitelisted: true,
        });

        if (errors.length > 0) {
            const errorMessages = errors.flatMap((err) =>
                Object.values(err.constraints || {}),
            );
            throw new BadRequestException(errorMessages);
        }

        return objectInstance;
    }
}
