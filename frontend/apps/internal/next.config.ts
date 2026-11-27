import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    cacheComponents: true,
    partialPrefetching: true,
    reactCompiler: true,
    transpilePackages: ['@repo/ui'],
    turbopack: {
        rules: {
            '*.css': {
                loaders: ['@tailwindcss/turbopack'],
                as: '*.css',
            },
        },
    },
};

export default nextConfig;
