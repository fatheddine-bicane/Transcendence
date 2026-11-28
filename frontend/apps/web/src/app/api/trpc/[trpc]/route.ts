import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { TRPC_ENDPOINT } from '@/lib/constants';
import { createTRPCContext } from '@/trpc/init';
import { appRouter } from '@/trpc/routers/_app';

const handler = (req: Request) =>
    fetchRequestHandler({
        endpoint: TRPC_ENDPOINT,
        req,
        router: appRouter,
        createContext: () => createTRPCContext({ headers: req.headers }),
    });

export { handler as GET, handler as POST };
