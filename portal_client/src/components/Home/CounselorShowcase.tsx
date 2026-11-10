import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, BadgeCheck, Star } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const counselors = [
    {
        image: '/counselors/salma-el-fassi.jpg',
        imageClassName: 'object-cover',
        nameKey: 'salmaName',
        roleKey: 'salmaRole',
        ratingKey: 'salmaRating',
        sessionsKey: 'salmaSessions',
        quoteKey: 'salmaQuote',
        tags: ['tagAnxiety', 'tagBurnout', 'tagFamily'],
        rate: '350 MAD',
        availabilityKey: 'availabilityToday6',
    },
    {
        image: '/counselors/youssef-chaoui.jpg',
        imageClassName: 'object-cover object-top',
        nameKey: 'youssefName',
        roleKey: 'youssefRole',
        ratingKey: 'youssefRating',
        sessionsKey: 'youssefSessions',
        quoteKey: 'youssefQuote',
        tags: ['tagDepression', 'tagCouples', 'tagGrief'],
        rate: '400 MAD',
        availabilityKey: 'availabilityTomorrow11',
    },
    {
        image: '/counselors/imane-benjelloun.jpg',
        imageClassName: 'object-cover object-[center_20%]',
        nameKey: 'imaneName',
        roleKey: 'imaneRole',
        ratingKey: 'imaneRating',
        sessionsKey: 'imaneSessions',
        quoteKey: 'imaneQuote',
        tags: ['tagSelfEsteem', 'tagTrauma', 'tagLanguages'],
        rate: '300 MAD',
        availabilityKey: 'availabilityToday830',
    },
] as const;

async function CounselorShowcase() {
    const t = await getTranslations('homePage.counselorShowcase');

    return (
        <section className="bg-surface w-full py-16 lg:py-24">
            <div className="max-w-8xl mx-auto flex flex-col gap-12 px-4 md:px-6 lg:px-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex max-w-xl flex-col gap-3">
                        <p className="text-secondary bg-secondary-lighter inline-flex w-fit rounded-full px-3 py-1 text-[0.6875rem] font-semibold tracking-wider uppercase">
                            {t('badge')}
                        </p>
                        <h2 className="font-jakarta text-input text-3xl font-semibold tracking-tight lg:text-4xl lg:leading-11">
                            {t('title')}
                        </h2>
                        <p className="text-foreground text-base leading-6">
                            {t('description')}
                        </p>
                    </div>
                    <Link
                        href="/psychologists"
                        className="text-primary-light hover:text-primary inline-flex shrink-0 items-center gap-1.5 text-sm font-medium transition-colors"
                    >
                        {t('exploreAll')}
                        <ArrowRight
                            className="icon-forward size-3"
                            aria-hidden
                        />
                    </Link>
                </div>

                <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {counselors.map((counselor) => (
                        <li
                            key={counselor.nameKey}
                            className="flex flex-col justify-between rounded-3xl bg-white p-6 shadow-sm"
                        >
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-4">
                                    <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl shadow-sm">
                                        <Image
                                            src={counselor.image}
                                            alt={t(counselor.nameKey)}
                                            fill
                                            sizes="64px"
                                            className={counselor.imageClassName}
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1">
                                            <h3 className="text-input truncate text-lg font-semibold">
                                                {t(counselor.nameKey)}
                                            </h3>
                                            <BadgeCheck
                                                className="text-primary fill-primary-lighter size-4 shrink-0"
                                                aria-hidden
                                            />
                                        </div>
                                        <p className="text-foreground text-sm">
                                            {t(counselor.roleKey)}
                                        </p>
                                        <p className="mt-0.5 flex items-center gap-1 text-xs">
                                            <Star
                                                className="text-rating fill-rating size-3.5 shrink-0"
                                                aria-hidden
                                            />
                                            <span className="text-rating font-semibold tracking-wide">
                                                {t(counselor.ratingKey)}
                                            </span>
                                            <span className="text-foreground font-medium tracking-wide">
                                                {t(counselor.sessionsKey)}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-wrap gap-1.5">
                                        {counselor.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="bg-background text-input rounded-lg px-2.5 py-1 text-xs font-medium tracking-wide"
                                            >
                                                {t(tag)}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-popover-foreground line-clamp-2 text-sm leading-5">
                                        {t(counselor.quoteKey)}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-accent mt-6 flex items-center justify-between gap-3 rounded-2xl px-3.5 pt-4 pb-3.5">
                                <div>
                                    <p className="text-foreground text-[0.6875rem] font-semibold tracking-wider uppercase">
                                        {t('rateLabel')}
                                    </p>
                                    <p className="text-input text-lg font-semibold">
                                        {counselor.rate}
                                    </p>
                                </div>
                                <span className="text-primary-deep bg-primary-lighter inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-base font-medium whitespace-nowrap">
                                    <span
                                        className="bg-primary-deep size-2 rounded-full"
                                        aria-hidden
                                    />
                                    {t(counselor.availabilityKey)}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

export default CounselorShowcase;
