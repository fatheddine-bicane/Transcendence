import { getTranslations } from 'next-intl/server';
import {
    Asterisk,
    Banknote,
    BriefcaseMedical,
    Database,
    Lock,
    type LucideIcon,
    Shield,
    ShieldCheck,
} from 'lucide-react';
import SignInForm from '@/components/Auth/SignInForm';

type TrustCard = {
    titleKey: 'trust1Title' | 'trust2Title' | 'trust3Title';
    descriptionKey:
        'trust1Description' | 'trust2Description' | 'trust3Description';
    icon: LucideIcon;
    iconWrapClassName: string;
    iconClassName: string;
};

const trustCards: TrustCard[] = [
    {
        titleKey: 'trust1Title',
        descriptionKey: 'trust1Description',
        icon: BriefcaseMedical,
        iconWrapClassName: 'bg-primary-lighter',
        iconClassName: 'text-primary-light',
    },
    {
        titleKey: 'trust2Title',
        descriptionKey: 'trust2Description',
        icon: Banknote,
        iconWrapClassName: 'bg-secondary-lighter',
        iconClassName: 'text-secondary',
    },
    {
        titleKey: 'trust3Title',
        descriptionKey: 'trust3Description',
        icon: Asterisk,
        iconWrapClassName: 'bg-warning-lighter',
        iconClassName: 'text-ternary',
    },
];

export default async function SignIn() {
    const t = await getTranslations('signInPage');

    return (
        <section className="bg-accent w-full py-5 lg:py-10">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 md:gap-10 md:px-6 lg:px-8">
                <div className="bg-background/70 flex flex-col gap-3 rounded-2xl px-4 py-3 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
                    <div className="flex min-w-0 items-start gap-3 sm:items-center">
                        <div className="bg-primary-lighter flex size-9 shrink-0 items-center justify-center rounded-xl">
                            <Shield
                                className="text-primary-light size-4"
                                aria-hidden
                            />
                        </div>
                        <div className="min-w-0">
                            <p className="text-foreground text-[0.6875rem] font-semibold tracking-wider uppercase">
                                {t('ribbonEyebrow')}
                            </p>
                            <p className="text-input text-sm font-semibold">
                                {t('ribbonTitle')}
                            </p>
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-3">
                        <p className="text-foreground flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium tracking-wide shadow-sm">
                            <ShieldCheck
                                className="size-3.5 shrink-0"
                                aria-hidden
                            />
                            {t('cndpBadge')}
                        </p>
                        <p className="text-foreground flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium tracking-wide shadow-sm">
                            <Lock className="size-3.5 shrink-0" aria-hidden />
                            {t('sslBadge')}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-8">
                    <div className="min-w-0 lg:col-span-7">
                        <SignInForm />
                    </div>

                    <aside className="bg-background flex flex-col gap-1.5 rounded-3xl p-6 shadow-sm lg:col-span-5">
                        <div className="flex items-center gap-1.5">
                            <Shield
                                className="text-primary-light size-4.5 shrink-0"
                                aria-hidden
                            />
                            <h2 className="text-input text-lg leading-6.5 font-semibold">
                                {t('confidentialityTitle')}
                            </h2>
                        </div>
                        <p className="text-foreground text-sm leading-5">
                            {t('confidentialityBody')}
                        </p>
                        <p className="text-foreground flex items-center gap-2 pt-2 text-xs font-medium tracking-wide">
                            <Database
                                className="size-3.5 shrink-0"
                                aria-hidden
                            />
                            {t('dataResidency')}
                        </p>
                    </aside>
                </div>

                <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {trustCards.map((card) => (
                        <li
                            key={card.titleKey}
                            className="flex h-full items-start gap-3 rounded-2xl bg-white p-4 shadow-sm"
                        >
                            <div
                                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${card.iconWrapClassName}`}
                            >
                                <card.icon
                                    className={`size-4.5 ${card.iconClassName}`}
                                    aria-hidden
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="text-input text-sm leading-5 font-semibold">
                                    {t(card.titleKey)}
                                </p>
                                <p className="text-foreground text-sm leading-5">
                                    {t(card.descriptionKey)}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
