import { TRPCError } from '@trpc/server';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';
import { authSignIn, ApiUnauthorizedError } from '@/lib/api/auth';
import { clearAuthCookies, setAccessTokenCookie, setAuthCookies } from '@repo/api/auth/cookies';
import { createSignInSchema, signInInputSchema } from '@/validation/sign-in';
import { authenticatedProcedure, baseProcedure, createTRPCRouter } from '@/trpc/init';
import { localizedInput } from '@/trpc/localized-input';

export const authRouter = createTRPCRouter({
    signIn: baseProcedure
        .use(localizedInput(createSignInSchema))
        .input(signInInputSchema)
        .mutation(async ({ ctx, input }) => {
            const { data, error } = await authSignIn(input.email, input.password);

            if (!error) {
                await setAuthCookies(data);
                return { ok: true };
            }

            const t = await getTranslations({
                locale: ctx.locale,
                namespace: 'signInPage',
            });

            if (error instanceof ApiUnauthorizedError) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: t('invalidCredentials'),
                });
            }

            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: t('genericError'),
            });
        }),

    setAccessToken: authenticatedProcedure
        .input(z.object({ token: z.string().min(1) }))
        .mutation(async ({ input }) => {
            await setAccessTokenCookie(input.token);
            return { ok: true as const };
        }),

    signOut: baseProcedure.mutation(async () => {
        await clearAuthCookies();
        return { ok: true as const };
    }),
});
