import 'server-only';

import { cookies } from 'next/headers';
import { AUTH_REFRESH_PATH } from '@repo/constants';
import {
    ACCESS_TOKEN_COOKIE,
    ACCESS_TOKEN_MAX_AGE_SECONDS,
    REFRESH_TOKEN_COOKIE,
    REFRESH_TOKEN_MAX_AGE_SECONDS,
} from '@repo/constants/server';
import { env } from '../env';

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

async function setAccessTokenCookie(accessToken: string) {
    const jar = await cookies();

    jar.set(ACCESS_TOKEN_COOKIE, accessToken, {
        ...cookieBase,
        path: '/',
        maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
    });
}

async function clearAuthCookies() {
    const jar = await cookies();
    jar.delete({ name: ACCESS_TOKEN_COOKIE, path: '/' });
    jar.delete({
        name: REFRESH_TOKEN_COOKIE,
        path: AUTH_REFRESH_PATH,
    });
}

async function getAccessTokenCookie() {
    const jar = await cookies();
    return jar.get(ACCESS_TOKEN_COOKIE)?.value;
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

export {
    setAuthCookies,
    setAccessTokenCookie,
    clearAuthCookies,
    getAccessTokenCookie,
    parseCookieFromSetCookie,
};
export type { AuthCookies };
