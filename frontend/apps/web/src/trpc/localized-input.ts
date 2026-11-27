import 'server-only';

import { TRPCError } from '@trpc/server';
import { getTranslations } from 'next-intl/server';
import type { z } from 'zod';
import type { ValidationTranslator } from '@/validation/messages';
import { middleware } from './init';

/**
 * Validate raw procedure input with a Zod schema whose messages come
 * from the shared `validation` namespace for `ctx.locale`.
 */
function localizedInput(createSchema: (v: ValidationTranslator) => z.ZodType) {
    return middleware(async ({ ctx, getRawInput, next }) => {
        const v = await getTranslations({ locale: ctx.locale, namespace: 'validation' });

        const parsed = createSchema(v).safeParse(await getRawInput());

        if (!parsed.success) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: parsed.error.issues[0]?.message ?? v('invalid'),
                cause: parsed.error,
            });
        }

        return next();
    });
}

export { localizedInput };
