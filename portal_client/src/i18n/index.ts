import { getLocale } from 'next-intl/server';
import 'server-only';
import { routing } from './routing';

const dictionaries = {
    en: () => import('../../messages/en.json').then((module) => module.default),
    es: () => import('../../messages/es.json').then((module) => module.default),
    fr: () => import('../../messages/fr.json').then((module) => module.default),
    ar: () => import('../../messages/ar.json').then((module) => module.default),
} as const;

export async function getDictionary() {
    const target = await getLocale();
    const dict = dictionaries[target];
    if (!dict) return dictionaries[routing.defaultLocale!]();
    return dict();
}
