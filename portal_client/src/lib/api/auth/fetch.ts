import 'server-only';

import { getValidAccessToken } from './session';
import { apiFetch, ApiUnauthorizedError, type ApiFetchInit } from '@/lib/fetch';

/**
 * Nest call with Bearer from a valid access cookie (or an explicit token).
 * Missing/expired cookie → `ApiUnauthorizedError` (RSC should render SilentRefresh).
 */
async function apiFetchAuth<T>(path: string, init: ApiFetchInit = {}, accessToken?: string) {
    const token = accessToken ?? (await getValidAccessToken());

    if (!token) {
        return {
            data: null,
            error: new ApiUnauthorizedError(),
            meta: { headers: null },
        } as const;
    }

    const headers = new Headers(init.headers);
    headers.set('Authorization', `Bearer ${token}`);

    return apiFetch<T>(path, { ...init, headers });
}

export { apiFetchAuth };
