import { getTranslations } from 'next-intl/server';
import { ArrowRight, Lock, RefreshCw, Search } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

async function ClosingCta() {
    const t = await getTranslations('homePage.closingCta');

    return (
        <section className="bg-surface w-full py-16 lg:py-20">
            <div className="mx-auto flex max-w-5xl justify-center px-4 md:px-6 lg:px-8">
                <div className="bg-primary-lighter flex w-full flex-col items-center gap-8 overflow-hidden rounded-3xl p-8 shadow-sm lg:p-14">
                    <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
                        <p className="text-primary-deep inline-flex rounded-full bg-white px-3 py-1 text-[0.6875rem] font-semibold tracking-wider uppercase shadow-sm">
                            {t('badge')}
                        </p>
                        <h2 className="font-jakarta text-input text-3xl font-semibold tracking-tight lg:text-4xl lg:leading-11">
                            {t('title')}
                        </h2>
                        <p className="text-foreground text-base leading-7 lg:text-lg">
                            {t('description')}
                        </p>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link
                            href="/psychologists"
                            className={cn(
                                buttonVariants({ size: 'lg' }),
                                'h-auto gap-2 rounded-xl px-8 py-4 text-base font-semibold shadow-md',
                            )}
                        >
                            {t('primaryCta')}
                            <ArrowRight
                                className="icon-forward size-3.5"
                                aria-hidden
                            />
                        </Link>
                        <Link
                            href="/psychologists"
                            className={cn(
                                buttonVariants({ size: 'lg' }),
                                'text-input h-auto gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold shadow-sm hover:bg-white/90',
                            )}
                        >
                            <Search className="size-4" aria-hidden />
                            {t('secondaryCta')}
                        </Link>
                    </div>

                    <div className="text-popover-foreground flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-2 text-sm">
                        <p className="flex items-center gap-1.5">
                            <Lock className="size-3.5 shrink-0" aria-hidden />
                            {t('encrypted')}
                        </p>
                        <p className="flex items-center gap-1.5">
                            <RefreshCw
                                className="size-3.5 shrink-0"
                                aria-hidden
                            />
                            {t('flexible')}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ClosingCta;
