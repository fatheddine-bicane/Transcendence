'use client';

import { Checkbox } from '@repo/ui/components/ui/checkbox';
import { Field, FieldLabel } from '@repo/ui/components/ui/field';
import { useField } from './use-field';

type CheckboxFieldProps = {
    label: React.ReactNode;
    id?: string;
    className?: string;
};

function CheckboxField({ label, id, className }: CheckboxFieldProps) {
    const { field, inputId } = useField<boolean>({ id });

    return (
        <Field orientation="horizontal" className={className}>
            <Checkbox
                id={inputId}
                name={field.name}
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(checked === true)}
                onBlur={field.handleBlur}
            />
            <FieldLabel htmlFor={inputId} className="cursor-pointer">
                {label}
            </FieldLabel>
        </Field>
    );
}

export { CheckboxField };
