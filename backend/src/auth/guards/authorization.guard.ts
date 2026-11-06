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
        const allowedUserTypes: UserType[] | string[] =
            this.reflector.getAllAndOverride(USER_TYPE_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);

        // no decorator used
        if (!allowedUserTypes) {
            throw new ForbiddenException();
        }

        if (allowedUserTypes.length == 0) {
            return true;
        }

        const request = context
            .switchToHttp()
            .getRequest<Request & RequestUserObject>();

        const userType = request.user.userType;
        if (allowedUserTypes.find((type) => type == userType)) {
            return true;
        } else {
            throw new ForbiddenException();
        }
    }
}
