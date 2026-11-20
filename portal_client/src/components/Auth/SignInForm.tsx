'use client';

import { useMemo } from 'react';
import { useForm } from '@tanstack/react-form';
import { useTranslations } from 'next-intl';
import { Lock, Mail } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputPassword } from '@/components/ui/input-password';
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

    const form = useForm({
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
                <form.Field name="email">
                    {(field) => {
                        const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;

                        return (
                            <Field data-invalid={isInvalid || undefined}>
                                <FieldLabel htmlFor="signin-email">
                                    {t('emailLabel')}
                                </FieldLabel>
                                <Input
                                    id="signin-email"
                                    name={field.name}
                                    type="email"
                                    autoComplete="email"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    aria-invalid={isInvalid}
                                    placeholder={t('emailPlaceholder')}
                                    startIcon={<Mail />}
                                />
                                {isInvalid && (
                                    <FieldError
                                        errors={field.state.meta.errors}
                                    />
                                )}
                            </Field>
                        );
                    }}
                </form.Field>

                <form.Field name="password">
                    {(field) => {
                        const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;

                        return (
                            <Field
                                data-invalid={isInvalid || undefined}
                                className="mt-2"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <FieldLabel htmlFor="signin-password">
                                        {t('passwordLabel')}
                                    </FieldLabel>
                                    <Link
                                        href="/signin"
                                        className="text-primary-light shrink-0 text-xs font-medium tracking-wide hover:underline"
                                    >
                                        {t('forgotPassword')}
                                    </Link>
                                </div>
                                <InputPassword
                                    id="signin-password"
                                    name={field.name}
                                    autoComplete="current-password"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    aria-invalid={isInvalid}
                                    placeholder={t('passwordPlaceholder')}
                                    showPasswordLabel={t('showPassword')}
                                    hidePasswordLabel={t('hidePassword')}
                                />
                                {isInvalid && (
                                    <FieldError
                                        errors={field.state.meta.errors}
                                    />
                                )}
                            </Field>
                        );
                    }}
                </form.Field>

                <form.Field name="remember">
                    {(field) => (
                        <Field orientation="horizontal" className="pt-1">
                            <Checkbox
                                id="signin-remember"
                                name={field.name}
                                checked={field.state.value}
                                onCheckedChange={(checked) =>
                                    field.handleChange(checked === true)
                                }
                                onBlur={field.handleBlur}
                            />
                            <FieldLabel
                                htmlFor="signin-remember"
                                className="cursor-pointer"
                            >
                                {t('rememberDevice')}
                            </FieldLabel>
                        </Field>
                    )}
                </form.Field>

                <div className="mt-8">
                    <form.Subscribe
                        selector={(state) => [
                            state.canSubmit,
                            state.isSubmitting,
                        ]}
                    >
                        {([canSubmit, isSubmitting]) => (
                            <Button
                                type="submit"
                                size="lg"
                                disabled={!canSubmit}
                                className="bg-primary-light hover:bg-primary-light/90 h-auto w-full gap-2 rounded-xl px-6 py-4 text-sm font-medium whitespace-normal text-white shadow-md"
                            >
                                <Lock className="size-4 shrink-0" aria-hidden />
                                {isSubmitting ? t('submitting') : t('submit')}
                            </Button>
                        )}
                    </form.Subscribe>
                </div>
            </FieldGroup>
        </form>
    );
}

export default SignInForm;
