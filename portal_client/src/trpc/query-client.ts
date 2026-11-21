import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query';

export function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30 * 1000, // 30 seconds
            },
            dehydrate: {
                shouldDehydrateQuery: (query) =>
                    defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
                shouldRedactErrors: () => {
                    // Keep Next.js digest so dynamic rendering detection works.
                    return false;
                },
            },
        },
    });
}
