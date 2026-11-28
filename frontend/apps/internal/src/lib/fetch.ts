import 'server-only';

import { env } from '@/lib/env';
import { getErrorMessage } from '@repo/ui/lib/utils';

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

export { apiFetch, ApiUnauthorizedError, ApiRequestError };
export type { ApiResult, ApiFetchInit };
