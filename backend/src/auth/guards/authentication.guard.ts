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
        private readonly jwtService: JwtService,
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const isPublicRoute = this.reflector.getAllAndOverride(
            PUBLIC_ROUTE_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (isPublicRoute) return true;

        const request = context
            .switchToHttp()
            .getRequest<Request & RequestUserObject>();

        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw new UnauthorizedException();
        }

        const [type, accessToken] = authHeader.split(' ');
        if (type !== 'Bearer' || !accessToken) {
            throw new UnauthorizedException();
        }

        try {
            this.jwtService.verify(accessToken);
            //insert minimal user object into the request
            const token = this.jwtService.decode(accessToken);
            request['user'] = {
                id: token.subject,
                userType: token.user_type,
            };
            return true;
        } catch (error) {
            // ERROR_LOG
            console.error('[AuthenticationGuard]: ', error);

            throw new UnauthorizedException();
        }
    }
}
