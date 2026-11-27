import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import type { ValidationTranslator } from './messages';

const signInInputSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
    remember: z.boolean(),
});

type SignInPayload = z.infer<typeof signInInputSchema>;

function createSignInSchema(v: ValidationTranslator) {
    return z.object({
        email: z
            .string()
            .min(1, v('required'))
            .pipe(z.email(v('email'))),
        password: z
            .string()
            .min(1, v('required'))
            .min(8, v('min8')),
        remember: z.boolean(),
    }) satisfies z.ZodType<SignInPayload>;
}

function useSignInSchema() {
    const v = useTranslations('validation');
    return useMemo(() => createSignInSchema(v), [v]);
}

const signInDefaultValues: SignInPayload = {
    email: '',
    password: '',
    remember: true,
};

export {
    createSignInSchema,
    signInDefaultValues,
    signInInputSchema,
    useSignInSchema,
};
export type { SignInPayload };
