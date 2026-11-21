'use client';

import { useMutation } from '@tanstack/react-query';
import { TRPCClientError } from '@trpc/client';
import { useTranslations } from 'next-intl';
import { Lock, Mail } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { AppForm, useAppForm } from '@/components/form';
import { FieldGroup } from '@/components/ui/field';
import { useTRPC } from '@/trpc/client';
import { signInDefaultValues, useSignInSchema } from '@/validation/sign-in';

function SignInForm() {
    const t = useTranslations('signInPage');
    const formSchema = useSignInSchema();
    const router = useRouter();
    const trpc = useTRPC();

    const signInMutation = useMutation(trpc.auth.signIn.mutationOptions());

    const form = useAppForm({
        defaultValues: signInDefaultValues,
        validators: {
            onSubmit: formSchema,
            onSubmitAsync: async ({ value }) => {
                try {
                    await signInMutation.mutateAsync(value);
                    return null;
                } catch (error) {
                    return {
                        form: error instanceof TRPCClientError ? error.message : t('genericError'),
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
                            label={t('emailLabel')}
                            type="email"
                            autoComplete="email"
                            placeholder={t('emailPlaceholder')}
                            startIcon={<Mail />}
                        />
                    )}
                </form.AppField>

                <form.AppField name="password">
                    {(field) => (
                        <field.PasswordField
                            id="signin-password"
                            className="mt-2"
                            label={t('passwordLabel')}
                            labelAction={
                                <Link
                                    href="/signin"
                                    className="text-primary-light shrink-0 text-xs font-medium tracking-wide hover:underline"
                                >
                                    {t('forgotPassword')}
                                </Link>
                            }
                            autoComplete="current-password"
                            placeholder={t('passwordPlaceholder')}
                            showPasswordLabel={t('showPassword')}
                            hidePasswordLabel={t('hidePassword')}
                        />
                    )}
                </form.AppField>

                <form.AppField name="remember">
                    {(field) => (
                        <field.CheckboxField
                            id="signin-remember"
                            className="pt-1"
                            label={t('rememberDevice')}
                        />
                    )}
                </form.AppField>

                <div className="mt-8">
                    <form.SubmitButton
                        size="lg"
                        submittingLabel={t('submitting')}
                        className="bg-primary-light hover:bg-primary-light/90 h-auto w-full gap-2 rounded-xl px-6 py-4 text-sm font-medium whitespace-normal text-white shadow-md"
                    >
                        <Lock className="size-4 shrink-0" aria-hidden />
                        {t('submit')}
                    </form.SubmitButton>
                </div>
            </FieldGroup>
        </AppForm>
    );
}

export default SignInForm;
