'use client';

import { type SubmitEvent } from 'react';
import { useTranslations } from 'next-intl';
import { ClipboardList, Lock, Mail, Stethoscope } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { InputPassword } from '@/components/ui/input-password';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

function SignInForm() {
    const t = useTranslations('signInPage');

    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="relative flex flex-col gap-3 overflow-hidden rounded-3xl bg-white p-6 shadow-xl sm:px-8 sm:py-12"
        >
            <div
                className="bg-primary-lighter/70 pointer-events-none absolute -inset-e-24 -top-24 size-80 rounded-full blur-3xl"
                aria-hidden
            />

            <div className="relative flex flex-col gap-2">
                <h1 className="font-jakarta text-input text-[1.875rem] leading-9.5 font-semibold tracking-tight">
                    {t('title')}
                </h1>
                <p className="text-foreground text-base leading-6">
                    {t('description')}
                </p>
            </div>

            <div className="relative mt-8 flex flex-col gap-1.5">
                <Label htmlFor="signin-email">{t('emailLabel')}</Label>
                <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder={t('emailPlaceholder')}
                    startIcon={<Mail />}
                />
            </div>

            <div className="relative mt-2 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="signin-password">
                        {t('passwordLabel')}
                    </Label>
                    <Link
                        href="/signin"
                        className="text-primary-light shrink-0 text-xs font-medium tracking-wide hover:underline"
                    >
                        {t('forgotPassword')}
                    </Link>
                </div>
                <InputPassword
                    id="signin-password"
                    name="password"
                    autoComplete="current-password"
                    required
                    placeholder={t('passwordPlaceholder')}
                    showPasswordLabel={t('showPassword')}
                    hidePasswordLabel={t('hidePassword')}
                />
            </div>

            <Label
                htmlFor="signin-remember"
                className="relative flex cursor-pointer items-center gap-2.5 pt-1"
            >
                <Checkbox id="signin-remember" name="remember" defaultChecked />
                {t('rememberDevice')}
            </Label>

            <div className="relative mt-8">
                <button
                    type="submit"
                    className={cn(
                        buttonVariants({ size: 'lg' }),
                        'bg-primary-light hover:bg-primary-light/90 h-auto w-full gap-2 rounded-xl px-6 py-4 text-sm font-medium whitespace-normal text-white shadow-md',
                    )}
                >
                    <Lock className="size-4 shrink-0" aria-hidden />
                    {t('submit')}
                </button>
            </div>

            <div className="border-border/20 relative mt-1 flex flex-col gap-3 border-t pt-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <Link
                    href="/psychologists"
                    className="text-primary-light flex flex-1 items-start gap-1 text-sm leading-5 font-medium hover:underline"
                >
                    <ClipboardList
                        className="mt-0.5 size-3.5 shrink-0"
                        aria-hidden
                    />
                    <span>{t('matchingLink')}</span>
                </Link>
                <Link
                    href="/for-professionals"
                    className="text-secondary flex flex-1 items-start gap-1 text-sm leading-5 font-medium hover:underline sm:justify-end"
                >
                    <Stethoscope
                        className="mt-0.5 size-3.5 shrink-0"
                        aria-hidden
                    />
                    <span>{t('counselorLink')}</span>
                </Link>
            </div>
        </form>
    );
}

export default SignInForm;
