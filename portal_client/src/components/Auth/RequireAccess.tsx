import { Suspense, type ReactNode } from 'react';
import { SilentRefresh } from '@/components/Auth/SilentRefresh';
import { getValidAccessToken } from '@/lib/api/auth';

type RequireAccessProps = {
    children: ReactNode;
    fallback?: ReactNode;
};

async function RequireAccessGate({ children }: { children: ReactNode }) {
    const accessToken = await getValidAccessToken();

    if (!accessToken) {
        return <SilentRefresh />;
    }

    return children;
}

/**
 * RSC gate: valid access cookie → children; missing/expired → SilentRefresh.
 * Wraps the cookie/`Date.now()` check in Suspense for Cache Components.
 */
function RequireAccess({ children, fallback = null }: RequireAccessProps) {
    return (
        <Suspense fallback={fallback}>
            <RequireAccessGate>{children}</RequireAccessGate>
        </Suspense>
    );
}

export { RequireAccess };
export type { RequireAccessProps };
