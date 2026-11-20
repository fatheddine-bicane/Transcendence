'use client';

import { useState, type SubmitEvent } from 'react';
import { useTranslations } from 'next-intl';
import {
    ClipboardList,
    Eye,
    EyeOff,
    KeyRound,
    Lock,
    Mail,
    Stethoscope,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function SignInForm() {
    const t = useTranslations('signInPage');
    const [showPassword, setShowPassword] = useState(false);

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
                <label
                    htmlFor="signin-email"
                    className="text-input text-sm font-medium"
                >
                    {t('emailLabel')}
                </label>
                <div className="relative">
                    <Mail
                        className="text-muted-foreground pointer-events-none absolute inset-s-4 top-1/2 size-4 -translate-y-1/2"
                        aria-hidden
                    />
                    <input
                        id="signin-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder={t('emailPlaceholder')}
                        className="bg-accent text-input placeholder:text-popover-foreground/70 focus-visible:ring-primary-light/30 w-full rounded-xl py-4 ps-11 pe-4 text-base outline-none focus-visible:ring-3"
                    />
                </div>
            </div>

            <div className="relative mt-2 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3">
                    <label
                        htmlFor="signin-password"
                        className="text-input text-sm font-medium"
                    >
                        {t('passwordLabel')}
                    </label>
                    <Link
                        href="/signin"
                        className="text-primary-light shrink-0 text-xs font-medium tracking-wide hover:underline"
                    >
                        {t('forgotPassword')}
                    </Link>
                </div>
                <div className="relative">
                    <KeyRound
                        className="text-muted-foreground pointer-events-none absolute inset-s-4 top-1/2 size-4 -translate-y-1/2"
                        aria-hidden
                    />
                    <input
                        id="signin-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        placeholder={t('passwordPlaceholder')}
                        className="bg-accent text-input placeholder:text-popover-foreground/70 focus-visible:ring-primary-light/30 w-full rounded-xl py-4 ps-11 pe-12 text-base outline-none focus-visible:ring-3"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="text-muted-foreground hover:text-input absolute inset-e-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 transition-colors"
                        aria-label={
                            showPassword ? t('hidePassword') : t('showPassword')
                        }
                    >
                        {showPassword ? (
                            <EyeOff className="size-4" aria-hidden />
                        ) : (
                            <Eye className="size-4" aria-hidden />
                        )}
                    </button>
                </div>
            </div>

            <label className="text-foreground relative flex cursor-pointer items-center gap-2.5 pt-1 text-sm">
                <input
                    type="checkbox"
                    name="remember"
                    defaultChecked
                    className="border-border text-primary-light focus-visible:ring-primary-light/30 size-4 rounded-[2.5px] accent-[#1d6033]"
                />
                {t('rememberDevice')}
            </label>

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
