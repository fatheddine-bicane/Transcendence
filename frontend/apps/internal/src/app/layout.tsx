import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { cn } from '@repo/ui/lib/utils';
import '@repo/ui/styles.css';
import { TRPCReactProvider } from '@/trpc/client';

const inter = Inter({
    variable: '--font-inter-family',
    subsets: ['latin'],
});

const plusJakartaSans = Plus_Jakarta_Sans({
    variable: '--font-jakarta-family',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Nafs Internal',
    description: 'Internal staff portal',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        <html
            lang="en"
            className={cn(
                inter.variable,
                plusJakartaSans.variable,
                'h-full scroll-smooth antialiased',
            )}
        >
            <body className="size-full">
                <TRPCReactProvider>{children}</TRPCReactProvider>
            </body>
        </html>
    );
}
