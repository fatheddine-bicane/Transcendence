import { TRPCError, initTRPC } from '@trpc/server';
import { getAccessTokenCookie } from '@repo/api/auth/cookies';

/**
 * Context accepts `headers` so it can be reused in both the RSC server
 * caller (next/headers) and the API route handler (request headers).
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
    return {
        headers: opts.headers,
        accessToken: await getAccessTokenCookie(),
    };
};

const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const middleware = t.middleware;

/**
 * Requires an `accessToken` cookie to be present (expiry is not checked —
 * SilentRefresh may call authenticated procedures with an expired access cookie).
 * Narrows `ctx.accessToken` to `string`.
 */
export const authenticatedProcedure = t.procedure.use(
    middleware(async ({ ctx, next }) => {
        if (!ctx.accessToken) {
            throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        return next({
            ctx: {
                ...ctx,
                accessToken: ctx.accessToken,
            },
        });
    }),
);
