import 'server-only';

import { cookies } from 'next/headers';
import { AUTH_REFRESH_PATH } from '@/lib/constants';
import {
    ACCESS_TOKEN_COOKIE,
    ACCESS_TOKEN_MAX_AGE_SECONDS,
    REFRESH_TOKEN_COOKIE,
    REFRESH_TOKEN_MAX_AGE_SECONDS,
} from '@/lib/constants.server';
import { env } from '@/lib/env';

type AuthCookies = {
    accessToken: string;
    /** From Nest `Set-Cookie` — sign-in JSON only returns `accessToken`. */
    refreshToken: string;
};

const cookieBase = {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'lax' as const,
};

async function setAuthCookies({ accessToken, refreshToken }: AuthCookies) {
    const jar = await cookies();

    jar.set(ACCESS_TOKEN_COOKIE, accessToken, {
        ...cookieBase,
        path: '/',
        maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
    });

    jar.set(REFRESH_TOKEN_COOKIE, refreshToken, {
        ...cookieBase,
        path: AUTH_REFRESH_PATH,
        maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });
}

function parseCookieFromSetCookie(headers: Headers, name: string) {
    const prefix = `${name}=`;

    for (const header of headers.getSetCookie()) {
        const firstSegment = header.split(';')[0]?.trim();
        if (firstSegment?.startsWith(prefix)) {
            return firstSegment.slice(prefix.length);
        }
    }

    return undefined;
}

export { setAuthCookies, parseCookieFromSetCookie };
export type { AuthCookies };
