import { createSignInSchema, signInInputSchema } from '@/validation/sign-in';
import { baseProcedure, createTRPCRouter } from '../init';
import { localizedInput } from '../localized-input';

export const authRouter = createTRPCRouter({
    signIn: baseProcedure
        .use(localizedInput(createSignInSchema))
        .input(signInInputSchema)
        .mutation(() => {
            return { ok: true as const };
        }),
});
