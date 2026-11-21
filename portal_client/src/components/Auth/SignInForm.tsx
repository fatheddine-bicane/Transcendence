'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Lock, Mail } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAppForm } from '@/components/form';
import { FieldGroup } from '@/components/ui/field';
import { createSignInSchema, signInDefaultValues } from '@/validation/sign-in';

function SignInForm() {
    const t = useTranslations('signInPage');

    const formSchema = useMemo(
        () =>
            createSignInSchema({
                emailRequired: t('emailRequired'),
                emailInvalid: t('emailInvalid'),
                passwordRequired: t('passwordRequired'),
                passwordMin: t('passwordMin'),
            }),
        [t],
    );

    const form = useAppForm({
        defaultValues: signInDefaultValues,
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {
            // Auth API wiring comes next.
            console.log(value);
        },
    });

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                form.handleSubmit();
            }}
        >
            <FieldGroup className="mt-5 gap-1.5">
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
                    <form.AppForm>
                        <form.SubmitButton
                            size="lg"
                            submittingLabel={t('submitting')}
                            className="bg-primary-light hover:bg-primary-light/90 h-auto w-full gap-2 rounded-xl px-6 py-4 text-sm font-medium whitespace-normal text-white shadow-md"
                        >
                            <Lock className="size-4 shrink-0" aria-hidden />
                            {t('submit')}
                        </form.SubmitButton>
                    </form.AppForm>
                </div>
            </FieldGroup>
        </form>
    );
}

export default SignInForm;
