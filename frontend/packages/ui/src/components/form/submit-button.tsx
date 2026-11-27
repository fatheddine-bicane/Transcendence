'use client';

import { Button } from '@repo/ui/components/ui/button';
import { useFormContext } from './context';

type SubmitButtonProps = {
    children: React.ReactNode;
    submittingLabel?: React.ReactNode;
} & Omit<React.ComponentProps<typeof Button>, 'type' | 'disabled' | 'children'>;

function SubmitButton({ children, submittingLabel, ...buttonProps }: SubmitButtonProps) {
    const form = useFormContext();

    return (
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit} {...buttonProps}>
                    {isSubmitting && submittingLabel ? submittingLabel : children}
                </Button>
            )}
        </form.Subscribe>
    );
}

export { SubmitButton };
