'use client';

import { useFormContext } from '@/components/form/context';
import { FormError } from '@/components/form/form-error';

type FormSubmitErrorProps = {
    className?: string;
};

function resolveSubmitError(submitError: unknown): string | null {
    if (typeof submitError === 'string') {
        return submitError;
    }

    if (
        submitError &&
        typeof submitError === 'object' &&
        'form' in submitError &&
        typeof submitError.form === 'string'
    ) {
        return submitError.form;
    }

    return null;
}

function FormSubmitError({ className }: FormSubmitErrorProps) {
    const form = useFormContext();

    return (
        <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
            {(submitError) => {
                const message = resolveSubmitError(submitError);
                if (!message) {
                    return null;
                }

                return <FormError className={className}>{message}</FormError>;
            }}
        </form.Subscribe>
    );
}

export { FormSubmitError };
