import 'server-only';

import { TRPCError } from '@trpc/server';
import { getTranslations } from 'next-intl/server';
import type { z } from 'zod';
import type messages from '../../messages/en.json';
import { middleware } from './init';

type MessageNamespace = {
    [K in keyof typeof messages]: (typeof messages)[K] extends Record<string, string> ? K : never;
}[keyof typeof messages];

/**
 * Validate raw procedure input with a Zod schema whose messages are
 * loaded from next-intl for `ctx.locale`.
 */
function localizedInput<TMessages extends Record<string, string>>(
    namespace: MessageNamespace,
    createSchema: (messages: TMessages) => z.ZodType,
    messageKeys: ReadonlyArray<keyof TMessages & string>,
) {
    return middleware(async ({ ctx, getRawInput, next }) => {
        const t = await getTranslations({ locale: ctx.locale, namespace });

        const messages = Object.fromEntries(
            messageKeys.map((key) => [key, t(key as never)]),
        ) as TMessages;

        const parsed = createSchema(messages).safeParse(await getRawInput());

        if (!parsed.success) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: parsed.error.issues[0]?.message ?? 'Invalid input',
                cause: parsed.error,
            });
        }

        return next();
    });
}

export { localizedInput };
