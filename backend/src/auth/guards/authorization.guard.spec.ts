import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { USER_TYPE_KEY } from '../decorators/auth.decorator.js';
import { UserType } from '../enums/user-type.enum.js';
import { AuthorizationGuard } from './authorization.guard.js';

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

describe('AuthorizationGuard', () => {
    let guard: AuthorizationGuard;
    let reflector: Reflector;

    beforeEach(() => {
        reflector = {
            getAllAndOverride: vi.fn(),
        } as unknown as Reflector;
        guard = new AuthorizationGuard(reflector);
    });

    it('forbids access when RequiredUserTypes is missing', () => {
        vi.mocked(reflector.getAllAndOverride).mockReturnValue(undefined);

        expect(() =>
            guard.canActivate(
                createExecutionContext({
                    user: { id: 1, userType: UserType.PATIENT },
                }),
            ),
        ).toThrow(ForbiddenException);
        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
            USER_TYPE_KEY,
            [expect.anything(), expect.anything()],
        );
    });

    it('allows any authenticated user when RequiredUserTypes has no args', () => {
        vi.mocked(reflector.getAllAndOverride).mockReturnValue([]);

        expect(
            guard.canActivate(
                createExecutionContext({
                    user: { id: 1, userType: UserType.INTERNAL },
                }),
            ),
        ).toBe(true);
    });

    it('allows users whose type is listed', () => {
        vi.mocked(reflector.getAllAndOverride).mockReturnValue([
            UserType.INTERNAL,
            UserType.COUNSELOR,
        ]);

        expect(
            guard.canActivate(
                createExecutionContext({
                    user: { id: 7, userType: UserType.COUNSELOR },
                }),
            ),
        ).toBe(true);
    });

    it('forbids users whose type is not listed', () => {
        vi.mocked(reflector.getAllAndOverride).mockReturnValue([
            UserType.INTERNAL,
        ]);

        expect(() =>
            guard.canActivate(
                createExecutionContext({
                    user: { id: 3, userType: UserType.PATIENT },
                }),
            ),
        ).toThrow(ForbiddenException);
    });
});
