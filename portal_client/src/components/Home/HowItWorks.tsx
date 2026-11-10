import { getTranslations } from 'next-intl/server';
import {
    ClipboardList,
    Globe2,
    Lock,
    type LucideIcon,
    ShieldCheck,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';

const steps: {
    number: string;
    titleKey: 'step1Title' | 'step2Title' | 'step3Title';
    descriptionKey:
        | 'step1Description'
        | 'step2Description'
        | 'step3Description';
    tagKey: 'step1Tag' | 'step2Tag' | 'step3Tag';
    footerKey: 'step1Footer' | 'step2Footer' | 'step3Footer';
    footerIcon: LucideIcon;
    tone: 'primary' | 'secondary';
}[] = [
    {
        number: '01',
        titleKey: 'step1Title',
        descriptionKey: 'step1Description',
        tagKey: 'step1Tag',
        footerKey: 'step1Footer',
        footerIcon: Lock,
        tone: 'primary',
    },
    {
        number: '02',
        titleKey: 'step2Title',
        descriptionKey: 'step2Description',
        tagKey: 'step2Tag',
        footerKey: 'step2Footer',
        footerIcon: Globe2,
        tone: 'secondary',
    },
    {
        number: '03',
        titleKey: 'step3Title',
        descriptionKey: 'step3Description',
        tagKey: 'step3Tag',
        footerKey: 'step3Footer',
        footerIcon: ShieldCheck,
        tone: 'primary',
    },
];

async function HowItWorks() {
    const t = await getTranslations('homePage.howItWorks');

    return (
        <section className="bg-surface w-full py-16 lg:py-24">
            <div className="max-w-8xl mx-auto flex flex-col gap-12 px-4 md:px-6 lg:px-8">
                <div className="flex max-w-2xl flex-col gap-3">
                    <p className="text-primary-deep bg-primary-lighter inline-flex w-fit rounded-full px-3 py-1 text-[0.6875rem] font-semibold tracking-wider uppercase">
                        {t('badge')}
                    </p>
                    <h2 className="font-jakarta text-input text-3xl font-semibold tracking-tight lg:text-4xl lg:leading-11">
                        {t('title')}
                    </h2>
                    <p className="text-foreground text-base leading-7 lg:text-lg">
                        {t('description')}
                    </p>
                </div>

                <ol className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {steps.map(
                        ({
                            number,
                            titleKey,
                            descriptionKey,
                            tagKey,
                            footerKey,
                            footerIcon: FooterIcon,
                            tone,
                        }) => (
                            <li
                                key={number}
                                className="flex flex-col justify-between rounded-3xl bg-white p-8 shadow-sm"
                            >
                                <div className="flex flex-col gap-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div
                                            className={
                                                tone === 'primary'
                                                    ? 'bg-primary-lighter text-primary-light font-jakarta flex size-12 items-center justify-center rounded-2xl text-base font-semibold'
                                                    : 'bg-secondary-lighter text-secondary font-jakarta flex size-12 items-center justify-center rounded-2xl text-base font-semibold'
                                            }
                                        >
                                            {number}
                                        </div>
                                        <span className="bg-background text-foreground rounded-lg px-3 py-1 text-xs font-medium tracking-wide">
                                            {t(tagKey)}
                                        </span>
                                    </div>
                                    <h3 className="font-jakarta text-input text-xl font-semibold">
                                        {t(titleKey)}
                                    </h3>
                                    <p className="text-foreground text-base leading-relaxed">
                                        {t(descriptionKey)}
                                    </p>
                                </div>
                                <p
                                    className={
                                        tone === 'primary'
                                            ? 'text-primary-light mt-6 flex items-center gap-1.5 text-sm font-medium'
                                            : 'text-secondary mt-6 flex items-center gap-1.5 text-sm font-medium'
                                    }
                                >
                                    <FooterIcon
                                        className="size-3.5 shrink-0"
                                        aria-hidden
                                    />
                                    {t(footerKey)}
                                </p>
                            </li>
                        ),
                    )}
                </ol>

                <div className="bg-background flex flex-col items-start justify-between gap-4 rounded-2xl p-6 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3 sm:items-center">
                        <ClipboardList
                            className="text-primary-light mt-0.5 size-5 shrink-0 sm:mt-0"
                            aria-hidden
                        />
                        <p className="text-input text-base leading-6">
                            {t('quizPrompt')}
                        </p>
                    </div>
                    <Link
                        href="/psychologists"
                        className="text-primary-light shrink-0 rounded-xl bg-white px-5 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-white/80"
                    >
                        {t('quizCta')}
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default HowItWorks;
