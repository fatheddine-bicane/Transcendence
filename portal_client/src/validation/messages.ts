import type { Messages } from 'next-intl';

type ValidationMessages = Messages['validation'];
type ValidationTranslator = (key: keyof ValidationMessages) => string;

export type { ValidationMessages, ValidationTranslator };
