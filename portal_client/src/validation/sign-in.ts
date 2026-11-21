import { z } from 'zod';

type SignInValidationMessages = {
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordMin: string;
};

const signInInputSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
    remember: z.boolean(),
});

type SignInPayload = z.infer<typeof signInInputSchema>;

function createSignInSchema(messages: SignInValidationMessages) {
    return z.object({
        email: z
            .string()
            .min(1, messages.emailRequired)
            .pipe(z.email(messages.emailInvalid)),
        password: z
            .string()
            .min(1, messages.passwordRequired)
            .min(8, messages.passwordMin),
        remember: z.boolean(),
    }) satisfies z.ZodType<SignInPayload>;
}

const signInDefaultValues: SignInPayload = {
    email: '',
    password: '',
    remember: true,
};

export { createSignInSchema, signInDefaultValues, signInInputSchema };
export type { SignInPayload, SignInValidationMessages };
