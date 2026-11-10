import { getTranslations } from 'next-intl/server';
import {
    CalendarClock,
    Car,
    EyeOff,
    HeartHandshake,
    type LucideIcon,
} from 'lucide-react';

const benefits: {
    titleKey: 'benefit1Title' | 'benefit2Title' | 'benefit3Title' | 'benefit4Title';
    descriptionKey:
        | 'benefit1Description'
        | 'benefit2Description'
        | 'benefit3Description'
        | 'benefit4Description';
    icon: LucideIcon;
    tone: 'primary' | 'secondary';
}[] = [
    {
        titleKey: 'benefit1Title',
        descriptionKey: 'benefit1Description',
        icon: EyeOff,
        tone: 'primary',
    },
    {
        titleKey: 'benefit2Title',
        descriptionKey: 'benefit2Description',
        icon: Car,
        tone: 'secondary',
    },
    {
        titleKey: 'benefit3Title',
        descriptionKey: 'benefit3Description',
        icon: CalendarClock,
        tone: 'primary',
    },
    {
        titleKey: 'benefit4Title',
        descriptionKey: 'benefit4Description',
        icon: HeartHandshake,
        tone: 'secondary',
    },
];

async function Benefits() {
    const t = await getTranslations('homePage.benefits');

    return (
        <section className="bg-accent w-full py-16 lg:py-24">
            <div className="max-w-8xl mx-auto flex flex-col items-center gap-12 px-4 md:px-6 lg:px-8">
                <div className="flex max-w-3xl flex-col items-center gap-3 text-center">
                    <p className="text-primary-deep bg-primary-lighter inline-flex rounded-full px-3 py-1 text-[0.6875rem] font-semibold tracking-wider uppercase">
                        {t('badge')}
                    </p>
                    <h2 className="font-jakarta text-input text-3xl font-semibold tracking-tight lg:text-4xl lg:leading-11">
                        {t('title')}
                    </h2>
                    <p className="text-foreground text-base leading-7 lg:text-lg">
                        {t('description')}
                    </p>
                </div>

                <ul className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {benefits.map(
                        ({
                            titleKey,
                            descriptionKey,
                            icon: Icon,
                            tone,
                        }) => (
                            <li
                                key={titleKey}
                                className="flex flex-col rounded-3xl bg-white p-7 shadow-sm"
                            >
                                <div
                                    className={
                                        tone === 'primary'
                                            ? 'bg-primary-lighter flex size-12 items-center justify-center rounded-2xl'
                                            : 'bg-secondary-lighter flex size-12 items-center justify-center rounded-2xl'
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
                                <div className="mt-4 flex flex-col gap-2">
                                    <h3 className="font-jakarta text-input text-xl leading-7 font-semibold">
                                        {t(titleKey)}
                                    </h3>
                                    <p className="text-foreground text-sm leading-relaxed">
                                        {t(descriptionKey)}
                                    </p>
                                </div>
                            </li>
                        ),
                    )}
                </ul>
            </div>
        </section>
    );
}

export default Benefits;
