import { getTranslations } from 'next-intl/server';
import {
    Banknote,
    GraduationCap,
    Laptop,
    type LucideIcon,
    Shield,
} from 'lucide-react';

const items: {
    titleKey: 'remoteTitle' | 'licensedTitle' | 'pricingTitle' | 'cndpTitle';
    descriptionKey:
        | 'remoteDescription'
        | 'licensedDescription'
        | 'pricingDescription'
        | 'cndpDescription';
    icon: LucideIcon;
    tone: 'primary' | 'secondary';
}[] = [
    {
        titleKey: 'remoteTitle',
        descriptionKey: 'remoteDescription',
        icon: Laptop,
        tone: 'primary',
    },
    {
        titleKey: 'licensedTitle',
        descriptionKey: 'licensedDescription',
        icon: GraduationCap,
        tone: 'secondary',
    },
    {
        titleKey: 'pricingTitle',
        descriptionKey: 'pricingDescription',
        icon: Banknote,
        tone: 'primary',
    },
    {
        titleKey: 'cndpTitle',
        descriptionKey: 'cndpDescription',
        icon: Shield,
        tone: 'secondary',
    },
];

async function TrustHighlights() {
    const t = await getTranslations('homePage.trustHighlights');

    return (
        <section className="bg-white py-6 shadow-sm">
            <ul className="max-w-8xl mx-auto grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 md:px-6 lg:grid-cols-4 lg:gap-6 lg:px-8">
                {items.map(({ titleKey, descriptionKey, icon: Icon, tone }) => (
                    <li key={titleKey} className="flex items-center gap-3">
                        <div
                            className={
                                tone === 'primary'
                                    ? 'bg-primary-lighter flex size-10 shrink-0 items-center justify-center rounded-xl'
                                    : 'bg-secondary-lighter flex size-10 shrink-0 items-center justify-center rounded-xl'
                            }
                        >
                            <Icon
                                className={
                                    tone === 'primary'
                                        ? 'text-primary-light size-5'
                                        : 'text-secondary size-5'
                                }
                                aria-hidden
                            />
                        </div>
                        <div className="min-w-0">
                            <p className="text-input text-lg leading-snug font-semibold">
                                {t(titleKey)}
                            </p>
                            <p className="text-foreground text-sm leading-5">
                                {t(descriptionKey)}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default TrustHighlights;
