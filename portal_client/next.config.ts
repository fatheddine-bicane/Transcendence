import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { env } from '@/lib/env';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
    /* config options here */
    cacheComponents: true,
    partialPrefetching: true,
    reactCompiler: true,
    turbopack: {
        rules: {
            '*.css': {
                loaders: ['@tailwindcss/turbopack'],
                as: '*.css',
            },
        },
    },
    async rewrites() {
        return [
            {
                source: '/auth/refresh',
                destination: `${env.API_URL}/auth/refresh`,
            },
        ];
    },
};

export default withNextIntl(nextConfig);
