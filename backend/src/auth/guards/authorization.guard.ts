import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { USER_TYPE_KEY } from '../decorators/auth.decorator.js';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RequestUserObject } from '../dto/auth.dto.js';
import { UserType } from '../enums/user-type.enum.js';

@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const allowed_user_types: UserType[] | string[] =
            this.reflector.getAllAndOverride(USER_TYPE_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);

        // no decorator used
        if (!allowed_user_types) {
            throw new ForbiddenException();
        }

        if (allowed_user_types.length == 0) {
            return true;
        }

        const request = context
            .switchToHttp()
            .getRequest<Request & RequestUserObject>();

        const user_type = request.user.user_type;
        if (allowed_user_types.find((type) => type == user_type)) {
            return true;
        } else {
            throw new ForbiddenException();
        }
    }
}
