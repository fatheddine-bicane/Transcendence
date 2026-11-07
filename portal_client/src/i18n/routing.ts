import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['en', 'es', 'fr', 'ar'],
    defaultLocale: 'en',
});

const routingTxtDir = new Map<string, 'ltr' | 'rtl'>([
    ['en', 'ltr'],
    ['es', 'ltr'],
    ['fr', 'ltr'],
    ['ar', 'rtl'],
]);

export function getLocaleTxtDir(locale: string) {
    return routingTxtDir.get(locale) || 'ltr';
}
