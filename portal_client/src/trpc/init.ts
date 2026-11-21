import { hasLocale, type Locale } from 'next-intl';
import { initTRPC } from '@trpc/server';
import { routing } from '@/i18n/routing';
import { LOCALE_HEADER } from './locale-header';

function resolveLocale(headers: Headers): Locale {
    const fromClient = headers.get(LOCALE_HEADER);
    if (hasLocale(routing.locales, fromClient)) {
        return fromClient;
    }

    // Present on RSC/page requests where next-intl middleware ran.
    const fromMiddleware = headers.get('x-next-intl-locale');
    if (hasLocale(routing.locales, fromMiddleware)) {
        return fromMiddleware;
    }

    return routing.defaultLocale;
}

/**
 * Context accepts `headers` so it can be reused in both the RSC server
 * caller (next/headers) and the API route handler (request headers).
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
    return {
        headers: opts.headers,
        locale: resolveLocale(opts.headers),
    };
};

const t = initTRPC
    .context<Awaited<ReturnType<typeof createTRPCContext>>>()
    .create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const middleware = t.middleware;
