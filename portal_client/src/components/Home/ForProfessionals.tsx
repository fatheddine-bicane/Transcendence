import { getTranslations } from 'next-intl/server';
import {
    ArrowRight,
    Banknote,
    BrainCircuit,
    CalendarClock,
    ClipboardCheck,
    type LucideIcon,
    Shield,
    TrendingUp,
    Video,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Feature = {
    titleKey:
        'feature1Title' | 'feature2Title' | 'feature3Title' | 'feature4Title';
    descriptionKey:
        | 'feature1Description'
        | 'feature2Description'
        | 'feature3Description'
        | 'feature4Description';
    icon: LucideIcon;
};

const features: Feature[] = [
    {
        titleKey: 'feature1Title',
        descriptionKey: 'feature1Description',
        icon: Banknote,
    },
    {
        titleKey: 'feature2Title',
        descriptionKey: 'feature2Description',
        icon: CalendarClock,
    },
    {
        titleKey: 'feature3Title',
        descriptionKey: 'feature3Description',
        icon: Shield,
    },
    {
        titleKey: 'feature4Title',
        descriptionKey: 'feature4Description',
        icon: ClipboardCheck,
    },
];

function ApplyCta({ label }: { label: string }) {
    return (
        <Link
            href="/for-professionals"
            className={cn(
                buttonVariants({ size: 'lg' }),
                'bg-secondary hover:bg-secondary/90 h-auto w-full max-w-full gap-2 rounded-xl px-5 py-3 text-center text-sm font-semibold whitespace-normal text-white shadow-md sm:w-auto sm:px-7 sm:py-3.5 sm:text-base sm:whitespace-nowrap',
            )}
        >
            {label}
            <ArrowRight
                className="icon-forward size-3.5 shrink-0"
                aria-hidden
            />
        </Link>
    );
}

async function ForProfessionals() {
    const t = await getTranslations('homePage.forProfessionals');

    return (
        <section
            id="for-professionals"
            className="bg-secondary-lighter/50 w-full scroll-mt-24 py-16 lg:py-24"
        >
            <div className="max-w-8xl mx-auto px-4 md:px-6 lg:px-8">
                <div className="rounded-3xl bg-white p-6 shadow-md sm:p-8 lg:p-14">
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
                        <div className="flex min-w-0 flex-col gap-6 lg:col-span-7">
                            <p className="text-secondary bg-secondary-soft inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[0.6875rem] font-semibold tracking-wider uppercase">
                                <BrainCircuit
                                    className="size-3.5 shrink-0"
                                    aria-hidden
                                />
                                {t('badge')}
                            </p>

                            <h2 className="font-jakarta text-input text-3xl font-semibold tracking-tight lg:text-4xl lg:leading-11">
                                {t('title')}
                            </h2>

                            <p className="text-foreground text-base leading-7 lg:text-lg">
                                {t('description')}
                            </p>

                            <ul className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-4">
                                {features.map(
                                    ({
                                        titleKey,
                                        descriptionKey,
                                        icon: Icon,
                                    }) => (
                                        <li
                                            key={titleKey}
                                            className="flex items-start gap-3"
                                        >
                                            <Icon
                                                className="text-secondary mt-1 size-5 shrink-0"
                                                aria-hidden
                                            />
                                            <div className="min-w-0">
                                                <p className="text-input text-lg font-semibold">
                                                    {t(titleKey)}
                                                </p>
                                                <p className="text-foreground text-sm leading-5">
                                                    {t(descriptionKey)}
                                                </p>
                                            </div>
                                        </li>
                                    ),
                                )}
                            </ul>

                            <div className="hidden pt-2 lg:block">
                                <ApplyCta label={t('cta')} />
                            </div>
                        </div>

                        <div className="flex justify-center lg:col-span-5">
                            <aside className="bg-background flex w-full max-w-sm flex-col gap-4 rounded-3xl p-6 shadow-sm">
                                <div className="flex items-center justify-between gap-3 pb-1">
                                    <p className="text-input text-lg font-semibold">
                                        {t('dashboardTitle')}
                                    </p>
                                    <span className="text-primary-deep bg-primary-lighter rounded-full px-2 py-0.5 text-xs font-medium tracking-wide">
                                        {t('livePlatform')}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between rounded-2xl bg-white p-4">
                                    <div>
                                        <p className="text-foreground text-[0.6875rem] font-semibold tracking-wider uppercase">
                                            {t('earningsLabel')}
                                        </p>
                                        <p className="font-jakarta text-primary-light text-xl font-semibold">
                                            {t('earningsValue')}
                                        </p>
                                    </div>
                                    <TrendingUp
                                        className="text-primary-light size-6 shrink-0"
                                        aria-hidden
                                    />
                                </div>

                                <div className="flex items-center justify-between rounded-2xl bg-white p-4">
                                    <div>
                                        <p className="text-foreground text-[0.6875rem] font-semibold tracking-wider uppercase">
                                            {t('consultationsLabel')}
                                        </p>
                                        <p className="font-jakarta text-secondary text-xl font-semibold">
                                            {t('consultationsValue')}
                                        </p>
                                    </div>
                                    <Video
                                        className="text-secondary size-6 shrink-0"
                                        aria-hidden
                                    />
                                </div>

                                <blockquote className="flex flex-col gap-1 rounded-2xl bg-white p-3">
                                    <p className="text-foreground text-sm leading-5 italic">
                                        {t('quote')}
                                    </p>
                                    <footer className="text-input text-xs font-semibold tracking-wide">
                                        {t('quoteAuthor')}
                                    </footer>
                                </blockquote>
                            </aside>
                        </div>

                        <div className="min-w-0 lg:hidden">
                            <ApplyCta label={t('cta')} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ForProfessionals;
