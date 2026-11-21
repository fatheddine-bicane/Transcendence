import { z } from 'zod';

const serverEnvSchema = z.object({
    API_URL: z.url(),
});

/**
 * Validated server env. Parsed at module load so missing/invalid values
 * fail during `next build` / config load (via next.config import) and on
 * first server import — not silently at request time.
 */
export const env = {
    ...serverEnvSchema.parse({
        API_URL: process.env.API_URL,
    }),
    isProd: process.env.NODE_ENV === 'production',
};
