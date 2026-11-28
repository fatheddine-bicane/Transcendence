import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
    authSignIn,
    ApiUnauthorizedError,
    isInternalAccessToken,
} from '@/lib/api/auth';
import { clearAuthCookies, setAccessTokenCookie, setAuthCookies } from '@repo/api/auth/cookies';
import { signInSchema } from '@/validation/sign-in';
import { authenticatedProcedure, baseProcedure, createTRPCRouter } from '@/trpc/init';

const INVALID_CREDENTIALS = 'Invalid email or password.';
const GENERIC_ERROR = 'Something went wrong. Please try again.';

export const authRouter = createTRPCRouter({
    signIn: baseProcedure.input(signInSchema).mutation(async ({ input }) => {
        const { data, error } = await authSignIn(input.email, input.password);

        if (error) {
            if (error instanceof ApiUnauthorizedError) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: INVALID_CREDENTIALS,
                });
            }

            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: GENERIC_ERROR,
            });
        }

        if (!isInternalAccessToken(data.accessToken)) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: INVALID_CREDENTIALS,
            });
        }

        await setAuthCookies(data);
        return { ok: true as const };
    }),

    setAccessToken: authenticatedProcedure
        .input(z.object({ token: z.string().min(1) }))
        .mutation(async ({ input }) => {
            if (!isInternalAccessToken(input.token)) {
                await clearAuthCookies();
                throw new TRPCError({ code: 'UNAUTHORIZED' });
            }

            await setAccessTokenCookie(input.token);
            return { ok: true as const };
        }),

    signOut: baseProcedure.mutation(async () => {
        await clearAuthCookies();
        return { ok: true as const };
    }),
});
