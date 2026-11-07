import Hero from '@/components/Home/Hero';
import { getTranslations } from 'next-intl/server';

export default async function Home() {
    const t = await getTranslations('homePage');

    return <Hero title={t('title')} />;
}
