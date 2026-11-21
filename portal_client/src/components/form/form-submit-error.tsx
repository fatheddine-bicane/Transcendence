'use client';

import { useFormContext } from '@/components/form/context';
import { FormError } from '@/components/form/form-error';

type FormSubmitErrorProps = {
    className?: string;
};

function FormSubmitError({ className }: FormSubmitErrorProps) {
    const form = useFormContext();

    return (
        <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
            {(submitError) => {
                if (typeof submitError === 'string') {
                    <FormError className={className}>{submitError}</FormError>;
                }

                return null;
            }}
        </form.Subscribe>
    );
}

export { FormSubmitError };
