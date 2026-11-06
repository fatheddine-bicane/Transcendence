import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';
import './globals.css';

const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin'],
});

const plusJakartaSans = Plus_Jakarta_Sans({
    variable: '--font-jakarta-sans',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'NafsCare',
    description:
        'Compassionate, Confidential Mental Health Care — 100% Online Across Morocco',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        <html
            lang="en"
            className={cn(
                inter.variable,
                plusJakartaSans.variable,
                'h-full antialiased',
            )}
        >
            <body>{children}</body>
        </html>
    );
}
