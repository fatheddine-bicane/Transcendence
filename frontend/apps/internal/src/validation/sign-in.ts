import { z } from 'zod';

const signInSchema = z.object({
    email: z.string().min(1, 'Email is required').pipe(z.email('Enter a valid email')),
    password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters'),
    remember: z.boolean(),
});

type SignInPayload = z.infer<typeof signInSchema>;

const signInDefaultValues: SignInPayload = {
    email: 'internal1@example.com',
    password: 'Password123!',
    remember: true,
};

export { signInDefaultValues, signInSchema };
export type { SignInPayload };
