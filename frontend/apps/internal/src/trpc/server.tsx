import 'server-only';

import { createTRPCOptionsProxy, unstable_createHydrateClient } from '@trpc/tanstack-react-query';
import type { ResolverDef, TRPCQueryOptions } from '@trpc/tanstack-react-query';
import { noop } from '@tanstack/react-query';
import { headers } from 'next/headers';
import { cache } from 'react';
import { createTRPCContext } from './init';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/_app';

export const getQueryClient = cache(makeQueryClient);

const createContext = async () => createTRPCContext({ headers: await headers() });

export const trpc = createTRPCOptionsProxy({
    ctx: createContext,
    router: appRouter,
    queryClient: getQueryClient,
});

export const HydrateClient = unstable_createHydrateClient(getQueryClient);

export function prefetch<T extends ReturnType<TRPCQueryOptions<ResolverDef>>>(queryOptions: T) {
    const queryClient = getQueryClient();
    if (queryOptions.queryKey[1]?.type === 'infinite') {
        void queryClient.infiniteQuery(queryOptions as never).catch(noop);
    } else {
        void queryClient.query(queryOptions).catch(noop);
    }
}

export const caller = appRouter.createCaller(createContext);
