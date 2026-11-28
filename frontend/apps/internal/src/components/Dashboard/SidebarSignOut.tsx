'use client';

import { useMutation } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SidebarMenuButton, SidebarMenuItem } from '@repo/ui/components/ui/sidebar';
import { useTRPC } from '@/trpc/client';

type SidebarSignOutProps = {
    label: string;
};

function SidebarSignOut({ label }: SidebarSignOutProps) {
    const router = useRouter();
    const trpc = useTRPC();
    const signOut = useMutation(trpc.auth.signOut.mutationOptions());

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                tooltip={label}
                disabled={signOut.isPending}
                onClick={async () => {
                    try {
                        await signOut.mutateAsync();
                    } finally {
                        router.replace('/');
                    }
                }}
            >
                <LogOut />
                <span>{label}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

export { SidebarSignOut };
