import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PUBLIC_ROUTE_KEY } from '../decorators/auth.decorator.js';
import { UserType } from '../enums/user-type.enum.js';
import { AuthenticationGuard } from './authentication.guard.js';

function createExecutionContext(
    request: Record<string, unknown>,
): ExecutionContext {
    return {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
            getRequest: () => request,
        }),
    } as unknown as ExecutionContext;
}

describe('AuthenticationGuard', () => {
    let guard: AuthenticationGuard;
    let reflector: Reflector;
    let jwtService: JwtService;

    beforeEach(() => {
        reflector = {
            getAllAndOverride: vi.fn(),
        } as unknown as Reflector;
        jwtService = {
            verify: vi.fn(),
            decode: vi.fn(),
        } as unknown as JwtService;
        guard = new AuthenticationGuard(reflector, jwtService);
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    it('allows public routes without a token', () => {
        vi.mocked(reflector.getAllAndOverride).mockReturnValue(true);

        expect(guard.canActivate(createExecutionContext({ headers: {} }))).toBe(
            true,
        );
        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
            PUBLIC_ROUTE_KEY,
            [expect.anything(), expect.anything()],
        );
        expect(jwtService.verify).not.toHaveBeenCalled();
    });

    it('rejects requests with no Authorization header', () => {
        vi.mocked(reflector.getAllAndOverride).mockReturnValue(false);

        expect(() =>
            guard.canActivate(createExecutionContext({ headers: {} })),
        ).toThrow(UnauthorizedException);
    });

    it('rejects non-Bearer authorization schemes', () => {
        vi.mocked(reflector.getAllAndOverride).mockReturnValue(false);

        expect(() =>
            guard.canActivate(
                createExecutionContext({
                    headers: { authorization: 'Basic abc' },
                }),
            ),
        ).toThrow(UnauthorizedException);
    });

    it('rejects Bearer headers without a token', () => {
        vi.mocked(reflector.getAllAndOverride).mockReturnValue(false);

        expect(() =>
            guard.canActivate(
                createExecutionContext({
                    headers: { authorization: 'Bearer' },
                }),
            ),
        ).toThrow(UnauthorizedException);
    });

    it('attaches the user and allows valid access tokens', () => {
        vi.mocked(reflector.getAllAndOverride).mockReturnValue(false);
        vi.mocked(jwtService.verify).mockReturnValue(undefined as never);
        vi.mocked(jwtService.decode).mockReturnValue({
            subject: 42,
            user_type: UserType.PATIENT,
        } as never);

        const request: Record<string, unknown> = {
            headers: { authorization: 'Bearer valid-token' },
        };

        expect(guard.canActivate(createExecutionContext(request))).toBe(true);
        expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
        expect(request.user).toEqual({
            id: 42,
            userType: UserType.PATIENT,
        });
    });

    it('rejects invalid or expired tokens', () => {
        vi.mocked(reflector.getAllAndOverride).mockReturnValue(false);
        vi.mocked(jwtService.verify).mockImplementation(() => {
            throw new Error('jwt expired');
        });

        expect(() =>
            guard.canActivate(
                createExecutionContext({
                    headers: { authorization: 'Bearer expired-token' },
                }),
            ),
        ).toThrow(UnauthorizedException);
    });
});
