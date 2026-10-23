import {
    ArgumentMetadata,
    BadRequestException,
    Injectable,
    PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { SIGNUP_DTO_MAP } from '../dto/auth.dto.js';
import { validate } from 'class-validator';
import { UserType } from '../enums/user-type.enum.js';

@Injectable()
export class SignUpValidationPipe implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata) {
        if (!value || typeof value !== 'object' || !value.type) {
            throw new BadRequestException('Missing payload type discriminator');
        }

        const target_dto_class = SIGNUP_DTO_MAP[value.type as UserType];
        if (!target_dto_class) {
            throw new BadRequestException(
                `Unsupported dto type: ${value.type}`,
            );
        }

        const object_instance = plainToInstance(target_dto_class, value);

        const errors = await validate(object_instance, {
            whitelist: true,
            forbidNonWhitelisted: true,
        });

        if (errors.length > 0) {
            // TODO:?? flatMap
            const errorMessages = errors.flatMap((err) =>
                Object.values(err.constraints || {}),
            );
            throw new BadRequestException(errorMessages);
        }

        return object_instance;
    }
}
