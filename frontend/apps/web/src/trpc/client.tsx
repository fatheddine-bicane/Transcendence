'use client';

import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import type { Locale } from 'next-intl';
import { useMemo } from 'react';
import { LOCALE_HEADER, TRPC_ENDPOINT } from '@/lib/constants';
import { makeQueryClient } from './query-client';
import type { AppRouter } from './routers/_app';

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient;

function getQueryClient() {
    if (typeof window === 'undefined') {
        return makeQueryClient();
    }
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
}

type Props = Readonly<{
    children: React.ReactNode;
    locale: Locale;
}>;

export function TRPCReactProvider(props: Props) {
    const queryClient = getQueryClient();

    const trpcClient = useMemo(
        () =>
            createTRPCClient<AppRouter>({
                links: [
                    httpBatchLink({
                        url: TRPC_ENDPOINT,
                        headers: {
                            [LOCALE_HEADER]: props.locale,
                        },
                    }),
                ],
            }),
        [props.locale],
    );

    return (
        <QueryClientProvider client={queryClient}>
            <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
                {props.children}
            </TRPCProvider>
        </QueryClientProvider>
    );
}
