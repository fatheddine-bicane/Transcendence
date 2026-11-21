import 'server-only';

import { parseCookieFromSetCookie } from './cookies';
import { REFRESH_TOKEN_COOKIE } from '@/lib/constants.server';
import { apiFetch, ApiRequestError, ApiUnauthorizedError } from '@/lib/fetch';

class ApiMissingRefreshTokenError extends Error {
    constructor() {
        super('API sign-in response missing refreshToken cookie');
        this.name = 'ApiMissingRefreshTokenError';
    }
}

async function authSignIn(email: string, password: string) {
    const { data, error, meta } = await apiFetch<{ accessToken?: string }>('/auth/sign-in', {
        body: { email, password },
    });

    if (error) {
        return { data: null, error };
    }

    if (!data.accessToken) {
        return { data: null, error: new ApiRequestError(500) };
    }

    const refreshToken = parseCookieFromSetCookie(meta.headers, REFRESH_TOKEN_COOKIE);
    if (!refreshToken) {
        return { data: null, error: new ApiMissingRefreshTokenError() };
    }

    return {
        data: {
            accessToken: data.accessToken,
            refreshToken,
        },
        error: null,
    };
}

export { authSignIn, ApiMissingRefreshTokenError, ApiUnauthorizedError, ApiRequestError };
