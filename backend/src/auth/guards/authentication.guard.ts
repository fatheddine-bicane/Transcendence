import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PUBLIC_ROUTE_KEY } from '../decorators/auth.decorator.js';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { RequestUserObject } from '../dto/auth.dto.js';

@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwt_service: JwtService,
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const is_public_route = this.reflector.getAllAndOverride(
            PUBLIC_ROUTE_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (is_public_route) return true;

        const request = context
            .switchToHttp()
            .getRequest<Request & RequestUserObject>();

        const auth_header = request.headers.authorization;
        if (!auth_header) {
            throw new UnauthorizedException();
        }

        const [type, access_token] = auth_header.split(' ');
        if (type !== 'Bearer' || !access_token) {
            throw new UnauthorizedException();
        }

        try {
            this.jwt_service.verify(access_token);
            //insert minimal user object into the request
            const token = this.jwt_service.decode(access_token);
            request['user'] = {
                id: token.subject,
                user_type: token.user_type,
            };
            return true;
        } catch (error) {
            // ERROR_LOG
            console.error('[AuthenticationGuard]: ', error);

            throw new UnauthorizedException();
        }
    }
}
