import { Locale } from 'next-intl';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['en', 'es', 'fr', 'ar'],
    defaultLocale: 'en',
});

interface RoutingLabel {
    name: string;
    code: Locale;
    sub: string;
}

export const routingLabels: RoutingLabel[] = [
    { name: 'English', code: 'en', sub: '' },
    { name: 'Spanish', code: 'es', sub: '' },
    { name: 'French', code: 'fr', sub: '' },
    { name: 'Arabic', code: 'ar', sub: 'Darija' },
];

export function getLocaleLabel(locale: string) {
    return (
        routingLabels.find((label) => label.code === locale) || routingLabels[0]
    );
}

const routingTxtDir = new Map<string, 'ltr' | 'rtl'>([
    ['en', 'ltr'],
    ['es', 'ltr'],
    ['fr', 'ltr'],
    ['ar', 'rtl'],
]);

export function getLocaleTxtDir(locale: string) {
    return routingTxtDir.get(locale) || 'ltr';
}
