import 'server-only';

import { getValidAccessToken } from './auth/session';
import { env } from './env';

type ApiResult<T> =
    | { data: T; error: null; meta: { headers: Headers } }
    | { data: null; error: Error; meta: { headers: Headers | null } };

type ApiFetchInit = Omit<RequestInit, 'body' | 'headers'> & {
    headers?: HeadersInit;
    body?: BodyInit | Record<string, unknown> | null;
};

class ApiUnauthorizedError extends Error {
    constructor() {
        super('Unauthorized');
        this.name = 'ApiUnauthorizedError';
    }
}

class ApiRequestError extends Error {
    status: number;

    constructor(status: number) {
        super(`API request failed with status ${status}`);
        this.name = 'ApiRequestError';
        this.status = status;
    }
}

function getErrorMessage(error: unknown) {
    if (!error) return;
    if (typeof error === 'string') return error;
    if (typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        return error.message;
    }

    return String(error);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return (
        typeof value === 'object' &&
        value !== null &&
        !(value instanceof Blob) &&
        !(value instanceof ArrayBuffer) &&
        !(value instanceof FormData) &&
        !(value instanceof URLSearchParams) &&
        !(value instanceof ReadableStream) &&
        !ArrayBuffer.isView(value)
    );
}

async function apiFetch<T>(path: string, init: ApiFetchInit = {}): Promise<ApiResult<T>> {
    try {
        const url = `${env.API_URL}${path.startsWith('/') ? path : `/${path}`}`;
        const { body, headers: initHeaders, ...rest } = init;

        const headers = new Headers({ 'Content-Type': 'application/json' });
        new Headers(initHeaders).forEach((value, key) => {
            headers.set(key, value);
        });

        const response = await fetch(url, {
            ...rest,
            method: rest.method ?? (body != null ? 'POST' : 'GET'),
            headers,
            body: isPlainObject(body) ? JSON.stringify(body) : body,
        });

        if (response.status === 401) {
            return {
                data: null,
                error: new ApiUnauthorizedError(),
                meta: { headers: response.headers },
            };
        }

        if (!response.ok) {
            return {
                data: null,
                error: new ApiRequestError(response.status),
                meta: { headers: response.headers },
            };
        }

        const data = (await response.json()) as T;
        return {
            data,
            error: null,
            meta: { headers: response.headers },
        };
    } catch (error) {
        return {
            data: null,
            error: new Error(getErrorMessage(error) ?? 'Unknown error'),
            meta: { headers: null },
        };
    }
}

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

export { apiFetch, apiFetchAuth, ApiUnauthorizedError, ApiRequestError };
export type { ApiResult, ApiFetchInit };
