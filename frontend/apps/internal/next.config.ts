import type { NextConfig } from 'next';
import { env } from '@/lib/env';

const nextConfig: NextConfig = {
    cacheComponents: true,
    partialPrefetching: true,
    reactCompiler: true,
    transpilePackages: ['@repo/api', '@repo/constants', '@repo/ui'],
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

export default nextConfig;
