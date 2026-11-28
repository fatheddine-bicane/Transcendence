/** tRPC HTTP endpoint (App Router route handler). */
export const TRPC_ENDPOINT = '/api/trpc';

/**
 * Same-origin refresh path rewritten to Nest `POST /auth/refresh`.
 * Must match Nest refresh cookie `Path` so Set-Cookie mirrors correctly.
 */
export const AUTH_REFRESH_PATH = '/auth/refresh';
