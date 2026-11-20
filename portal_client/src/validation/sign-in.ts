import { z } from 'zod';

type SignInValidationMessages = {
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordMin: string;
};

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
    });
}

type SignInValues = z.infer<ReturnType<typeof createSignInSchema>>;

const signInDefaultValues: SignInValues = {
    email: '',
    password: '',
    remember: true,
};

export { createSignInSchema, signInDefaultValues };
export type { SignInValues, SignInValidationMessages };
