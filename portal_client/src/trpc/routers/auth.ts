import { signInInputSchema } from '@/validation/sign-in';
import { baseProcedure, createTRPCRouter } from '../init';

export const authRouter = createTRPCRouter({
    signIn: baseProcedure.input(signInInputSchema).mutation(() => {
        return { ok: true as const };
    }),
});
