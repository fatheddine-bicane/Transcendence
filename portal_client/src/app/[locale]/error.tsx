'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

type Props = {
    error: Error;
    reset(): void;
};

export default function Error({ error, reset }: Props) {
    const t = useTranslations('errorPage');

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="flex size-full flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-semibold">{t('title')}</h1>

            <div>
                {t.rich('description', {
                    p: (chunks) => <p className="mt-4">{chunks}</p>,
                    retry: (chunks) => (
                        <button
                            className="text-primary underline underline-offset-2"
                            onClick={reset}
                            type="button"
                        >
                            {chunks}
                        </button>
                    ),
                })}
            </div>
        </main>
    );
}
