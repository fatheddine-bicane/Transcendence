'use client';

import { useMutation } from '@tanstack/react-query';
import { useEffect, useEffectEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_REFRESH_PATH } from '@/lib/constants';
import { useTRPC } from '@/trpc/client';

/**
 * Client recovery when RSC lacks a valid access JWT.
 * Refresh via same-origin rewrite → mirror access cookie → `router.refresh()`.
 * On failure: `auth.signOut` → sign-in.
 */
function SilentRefresh() {
    const router = useRouter();
    const trpc = useTRPC();
    const setAccessToken = useMutation(trpc.auth.setAccessToken.mutationOptions());
    const signOut = useMutation(trpc.auth.signOut.mutationOptions());

    const recover = useEffectEvent(async () => {
        try {
            const response = await fetch(AUTH_REFRESH_PATH, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: '{}',
            });

            if (!response.ok) {
                throw new Error('refresh failed');
            }

            const data = (await response.json()) as { accessToken?: string };
            if (!data.accessToken) {
                throw new Error('refresh missing accessToken');
            }

            await setAccessToken.mutateAsync({ token: data.accessToken });
            router.refresh();
        } catch {
            try {
                await signOut.mutateAsync();
            } catch {
                // Cookie clear is best-effort before redirect.
            }
            router.replace('/');
        }
    });

    useEffect(() => {
        void recover();
    }, []);

    return null;
}

export { SilentRefresh };
