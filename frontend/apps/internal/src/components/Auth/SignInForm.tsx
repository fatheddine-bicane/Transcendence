'use client';

import { useMutation } from '@tanstack/react-query';
import { TRPCClientError } from '@trpc/client';
import { Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppForm, useAppForm } from '@repo/ui/components/form';
import { FieldGroup } from '@repo/ui/components/ui/field';
import { useTRPC } from '@/trpc/client';
import { signInDefaultValues, signInSchema } from '@/validation/sign-in';

const GENERIC_ERROR = 'Something went wrong. Please try again.';

function SignInForm() {
    const router = useRouter();
    const trpc = useTRPC();
    const signInMutation = useMutation(trpc.auth.signIn.mutationOptions());

    const form = useAppForm({
        defaultValues: signInDefaultValues,
        validators: {
            onSubmit: signInSchema,
            onSubmitAsync: async ({ value }) => {
                try {
                    await signInMutation.mutateAsync(value);
                    return null;
                } catch (error) {
                    return {
                        form: error instanceof TRPCClientError ? error.message : GENERIC_ERROR,
                    };
                }
            },
        },
        onSubmit: async () => {
            router.push('/dashboard');
        },
    });

    return (
        <AppForm form={form}>
            <FieldGroup className="mt-5 gap-1.5">
                <form.FormSubmitError className="mb-2" />

                <form.AppField name="email">
                    {(field) => (
                        <field.TextField
                            id="signin-email"
                            label="Work email"
                            type="email"
                            autoComplete="email"
                            placeholder="internal1@example.com"
                            startIcon={<Mail />}
                        />
                    )}
                </form.AppField>

                <form.AppField name="password">
                    {(field) => (
                        <field.PasswordField
                            id="signin-password"
                            className="mt-2"
                            label="Password"
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            showPasswordLabel="Show password"
                            hidePasswordLabel="Hide password"
                        />
                    )}
                </form.AppField>

                <form.AppField name="remember">
                    {(field) => (
                        <field.CheckboxField
                            id="signin-remember"
                            className="pt-1"
                            label="Keep me signed in on this device"
                        />
                    )}
                </form.AppField>

                <div className="mt-8">
                    <form.SubmitButton
                        size="lg"
                        submittingLabel="Signing in…"
                        className="bg-primary-light hover:bg-primary-light/90 h-auto w-full gap-2 rounded-xl px-6 py-4 text-sm font-medium whitespace-normal text-white shadow-md"
                    >
                        <Lock className="size-4 shrink-0" aria-hidden />
                        Sign in
                    </form.SubmitButton>
                </div>
            </FieldGroup>
        </AppForm>
    );
}

export default SignInForm;
