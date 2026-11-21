import { TRPCError } from '@trpc/server';
import { getTranslations } from 'next-intl/server';
import { localizedInput } from '@/trpc/localized-input';
import { authSignIn, ApiUnauthorizedError } from '@/lib/api/auth';
import { setAuthCookies } from '@/lib/api/auth/cookies';
import { createSignInSchema, signInInputSchema } from '@/validation/sign-in';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';

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

            const t = await getTranslations({ locale: ctx.locale, namespace: 'signInPage' });

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
});
