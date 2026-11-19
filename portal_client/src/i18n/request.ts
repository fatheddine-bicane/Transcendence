import * as rootParams from 'next/root-params';
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ locale }) => {
    if (!locale) {
        const value = await rootParams.locale();
        if (hasLocale(routing.locales, value)) {
            locale = value;
        } else {
            notFound();
        }
    }

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
    };
});
