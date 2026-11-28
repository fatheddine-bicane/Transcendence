import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/**
 * Shared ESLint flat config for React library packages (not Next.js apps).
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const libraryConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        rules: {
            // Library packages have no Next.js pages/app directory.
            '@next/next/no-html-link-for-pages': 'off',
        },
    },
    globalIgnores(['dist/**', 'build/**', 'node_modules/**']),
]);
