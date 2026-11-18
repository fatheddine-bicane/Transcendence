import { getTranslations } from 'next-intl/server';
import { Phone, TriangleAlert } from 'lucide-react';

async function CrisisNotice() {
    const t = await getTranslations('homePage.crisisNotice');

    return (
        <section className="bg-warning-lighter w-full py-6">
            <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center md:px-6 lg:px-8">
                <div className="flex items-start gap-3">
                    <TriangleAlert
                        className="text-ternary mt-0.5 size-5 shrink-0"
                        aria-hidden
                    />
                    <div>
                        <h2 className="text-warning-deep text-lg leading-snug font-semibold">
                            {t('title')}
                        </h2>
                        <p className="text-warning mt-0.5 text-sm leading-5">
                            {t.rich('description', {
                                samu: (chunks) => (
                                    <strong className="font-bold">
                                        {chunks}
                                    </strong>
                                ),
                                rescue: (chunks) => (
                                    <strong className="font-bold">
                                        {chunks}
                                    </strong>
                                ),
                            })}
                        </p>
                    </div>
                </div>

                <a
                    href="tel:15"
                    className="text-ternary inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-white/90"
                >
                    <Phone className="size-3.5" aria-hidden />
                    {t('emergencyCta')}
                </a>
            </div>
        </section>
    );
}

export default CrisisNotice;
