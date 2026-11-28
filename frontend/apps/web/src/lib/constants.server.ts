import 'server-only';

export {
    ACCESS_TOKEN_COOKIE,
    ACCESS_TOKEN_MAX_AGE_SECONDS,
    REFRESH_TOKEN_COOKIE,
    REFRESH_TOKEN_MAX_AGE_SECONDS,
} from '@repo/constants/server';

/** Set by next-intl middleware on page/RSC requests. */
export const NEXT_INTL_LOCALE_HEADER = 'x-next-intl-locale';
