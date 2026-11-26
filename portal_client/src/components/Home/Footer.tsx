import { getTranslations } from 'next-intl/server';
import {
    Asterisk,
    Banknote,
    Lock,
    type LucideIcon,
    ShieldCheck,
    ShieldEllipsis,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';

type TrustBadge = {
    labelKey: 'confidential' | 'cndp' | 'secureTeleconsult' | 'madPricing';
    icon: LucideIcon;
};

const trustBadges: TrustBadge[] = [
    { labelKey: 'confidential', icon: ShieldCheck },
    { labelKey: 'cndp', icon: ShieldEllipsis },
    { labelKey: 'secureTeleconsult', icon: Lock },
    { labelKey: 'madPricing', icon: Banknote },
];

async function Footer() {
    const t = await getTranslations('homePage.footer');

    return (
        <footer className="bg-background w-full">
            <div className="bg-warning-lighter w-full py-3">
                <div className="max-w-8xl mx-auto flex flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between md:px-6 lg:px-8">
                    <p className="text-warning-deep flex items-start gap-1.5 text-xs font-medium tracking-wide sm:items-center">
                        <Asterisk
                            className="mt-0.5 size-3.5 shrink-0 sm:mt-0"
                            aria-hidden
                        />
                        <span>
                            {t.rich('emergency', {
                                samu: (chunks) => (
                                    <strong className="font-bold">
                                        {chunks}
                                    </strong>
                                ),
                                civil: (chunks) => (
                                    <strong className="font-bold">
                                        {chunks}
                                    </strong>
                                ),
                            })}
                        </span>
                    </p>
                    <p className="text-ternary text-[0.6875rem] font-semibold tracking-wider whitespace-nowrap">
                        {t('availability')}
                    </p>
                </div>
            </div>

            <div className="max-w-8xl mx-auto flex flex-col gap-8 px-4 py-8 md:px-6 lg:px-8">
                <ul className="flex flex-wrap gap-5">
                    {trustBadges.map(({ labelKey, icon: Icon }) => (
                        <li
                            key={labelKey}
                            className="text-input inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-medium tracking-wide shadow-sm"
                        >
                            <Icon
                                className="text-primary-light size-3.5 shrink-0"
                                aria-hidden
                            />
                            {t(labelKey)}
                        </li>
                    ))}
                </ul>

                <div className="flex flex-col gap-6 border-t border-black/5 pt-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-1.5">
                        <p className="text-input text-lg leading-snug font-semibold whitespace-pre-line">
                            {t('brand')}
                        </p>
                        <p className="text-foreground text-sm leading-5">
                            {t('tagline')}
                        </p>
                    </div>

                    <div className="text-foreground flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                        <Link
                            href="/privacy"
                            className="hover:text-input text-sm transition-colors"
                        >
                            {t('privacy')}
                        </Link>
                        <Link
                            href="/legal"
                            className="hover:text-input text-sm transition-colors"
                        >
                            {t('legal')}
                        </Link>
                        <p className="text-xs font-medium tracking-wide whitespace-pre-line">
                            {t('copyright')}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
