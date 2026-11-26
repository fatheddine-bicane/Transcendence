import { useTranslations } from 'next-intl';

export default function NotFoundPage() {
    const t = useTranslations('notFoundPage');

    return (
        <main className="flex size-full flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-semibold">{t('title')}</h1>
            <p className="text-lg">{t('description')}</p>
        </main>
    );
}
