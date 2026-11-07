import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';
import './globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import { getLocaleTxtDir, routing } from '@/i18n/routing';

const inter = Inter({
    variable: '--font-inter-family',
    subsets: ['latin'],
});

const plusJakartaSans = Plus_Jakarta_Sans({
    variable: '--font-jakarta-family',
    subsets: ['latin'],
});

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('manifest');

    return {
        title: t('name'),
        description: t('description'),
    };
}

async function RootLayout({ children }: LayoutProps<'/[locale]'>) {
    const locale = await getLocale();

    return (
        <html
            lang={locale}
            dir={getLocaleTxtDir(locale)}
            className={cn(
                inter.variable,
                plusJakartaSans.variable,
                'h-full antialiased',
            )}
        >
            <body className="size-full">
                <NextIntlClientProvider>{children}</NextIntlClientProvider>
            </body>
        </html>
    );
}

export default RootLayout;
