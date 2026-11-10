import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import {
    ArrowRight,
    BrainCircuit,
    Lock,
    ShieldCheck,
    Video,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

async function Hero() {
    const t = await getTranslations('homePage');

    return (
        <section className="max-w-8xl relative mx-auto flex flex-col items-center justify-center gap-10 overflow-hidden px-4 pt-10 pb-14 md:px-6 lg:flex-row lg:items-center lg:gap-14 lg:px-8 lg:pt-14 lg:pb-24 xl:gap-16">
            <div
                className="bg-primary-lighter/70 pointer-events-none absolute -inset-e-32 -top-32 size-96 rounded-full blur-3xl"
                aria-hidden
            />
            <div
                className="bg-secondary-lighter/80 pointer-events-none absolute -inset-s-20 -bottom-8 size-80 rounded-full blur-3xl"
                aria-hidden
            />

            <div className="relative flex w-full max-w-xl flex-col gap-6 lg:max-w-2xl xl:max-w-3xl">
                <p className="text-primary-light bg-primary-lighter inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.6875rem] font-semibold tracking-wider uppercase shadow-sm">
                    <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
                    {t('badge')}
                </p>

                <div className="flex flex-col gap-6">
                    <h1 className="font-jakarta text-input text-3xl leading-tight font-bold tracking-tight sm:text-4xl lg:text-5xl">
                        {t.rich('title', {
                            highlight: (chunks) => (
                                <span className="text-primary-deep italic">
                                    {chunks}
                                </span>
                            ),
                        })}
                    </h1>

                    <p className="text-foreground max-w-2xl text-base leading-relaxed lg:text-lg lg:leading-7">
                        {t('description')}
                    </p>
                </div>

                <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:gap-3">
                    <Link
                        href="/psychologists"
                        className={cn(
                            buttonVariants({ size: 'lg' }),
                            'h-auto gap-1.5 rounded-xl px-7 py-4 text-base font-semibold shadow-md',
                        )}
                    >
                        {t('findCounselor')}
                        <ArrowRight
                            className="icon-forward size-3.5"
                            aria-hidden
                        />
                    </Link>

                    <Link
                        href="/for-professionals"
                        className={cn(
                            buttonVariants({ size: 'lg' }),
                            'bg-secondary hover:bg-secondary/90 h-auto gap-1.5 rounded-xl px-7 py-4 text-base font-semibold text-white shadow-md',
                        )}
                    >
                        <Lock className="size-4" aria-hidden />
                        {t('joinCounselor')}
                    </Link>
                </div>

                <div className="flex flex-col gap-3 pt-1 text-sm sm:flex-row sm:items-center sm:gap-6">
                    <p className="text-input flex items-center gap-2 font-medium">
                        <span
                            className="bg-primary-light size-2.5 shrink-0 rounded-full"
                            aria-hidden
                        />
                        {t('languages')}
                    </p>
                    <p className="text-foreground flex items-center gap-1.5">
                        <Lock
                            className="text-ternary size-3.5 shrink-0"
                            aria-hidden
                        />
                        {t('discretion')}
                    </p>
                </div>
            </div>

            <div className="relative w-full max-w-119.5 shrink-0 lg:w-119.5 xl:w-140 xl:max-w-140">
                <div className="overflow-hidden rounded-3xl shadow-xl">
                    <Image
                        src="/hero.jpg"
                        alt={t('imageAlt')}
                        width={478}
                        height={400}
                        priority
                        className="h-auto w-full"
                    />
                </div>

                <aside className="absolute inset-s-4 top-4 z-10 flex max-w-60 items-center gap-3 rounded-2xl bg-white p-3 shadow-lg sm:-inset-s-6 sm:-top-5 sm:max-w-64 sm:p-4">
                    <div className="bg-primary-lighter flex size-12 shrink-0 items-center justify-center rounded-xl">
                        <BrainCircuit
                            className="text-primary size-5"
                            aria-hidden
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="text-foreground text-[0.6875rem] font-semibold tracking-[0.06em] uppercase">
                            {t('verifiedTitle')}
                        </p>
                        <p className="font-jakarta text-input mt-0.5 text-xl leading-tight font-semibold">
                            {t.rich('verifiedLicensed', {
                                percent: (chunks) => (
                                    <span>
                                        {chunks}
                                        <br />
                                    </span>
                                ),
                            })}
                        </p>
                        <p className="text-primary-light mt-1 text-sm font-medium">
                            {t('verifiedCertified')}
                        </p>
                    </div>
                </aside>

                <aside className="absolute inset-e-4 bottom-4 z-10 flex max-w-64 flex-col gap-2 rounded-2xl bg-white p-3 shadow-lg sm:inset-e-0 sm:-bottom-6 sm:max-w-65 sm:p-4">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-primary-light bg-primary-lighter rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold tracking-wide">
                            {t('teleRoom')}
                        </span>
                        <span className="text-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide">
                            <span
                                className="bg-primary-light size-2 rounded-full"
                                aria-hidden
                            />
                            {t('encrypted')}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                        <div className="bg-secondary-soft flex size-10 shrink-0 items-center justify-center rounded-full">
                            <Video
                                className="text-secondary size-4"
                                aria-hidden
                            />
                        </div>
                        <div className="min-w-0">
                            <p className="text-input truncate text-base font-semibold">
                                {t('doctorName')}
                            </p>
                            <p className="text-foreground truncate text-sm">
                                {t('doctorRole')}
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}

export default Hero;
