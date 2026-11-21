import { initTRPC } from '@trpc/server';

/**
 * Context accepts `headers` so it can be reused in both the RSC server
 * caller (next/headers) and the API route handler (request headers).
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
    return {
        headers: opts.headers,
    };
};

const t = initTRPC
    .context<Awaited<ReturnType<typeof createTRPCContext>>>()
    .create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
