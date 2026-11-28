import { redirect } from 'next/navigation';
import { Suspense, type ReactNode } from 'react';
import { RequireAccessSkeleton } from '@/components/Auth/RequireAccessSkeleton';
import { SilentRefresh } from '@/components/Auth/SilentRefresh';
import { getValidAccessToken, isInternalAccessToken } from '@/lib/api/auth';
import { clearAuthCookies } from '@/lib/api/auth/cookies';

type RequireAccessProps = {
    children: ReactNode;
    fallback?: ReactNode;
};

async function RequireAccessGate({ children }: { children: ReactNode }) {
    const accessToken = await getValidAccessToken();

    if (!accessToken) {
        return <SilentRefresh />;
    }

    if (!isInternalAccessToken(accessToken)) {
        await clearAuthCookies();
        redirect('/');
    }

    return children;
}

/**
 * RSC gate: valid internal access cookie → children; missing/expired → SilentRefresh;
 * wrong user_type → clear cookies and send to sign-in.
 */
function RequireAccess({ children, fallback = <RequireAccessSkeleton /> }: RequireAccessProps) {
    return (
        <Suspense fallback={fallback}>
            <RequireAccessGate>{children}</RequireAccessGate>
        </Suspense>
    );
}

export { RequireAccess };
export type { RequireAccessProps };
