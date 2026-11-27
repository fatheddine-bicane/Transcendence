'use client';

import { Field, FieldError, FieldLabel } from '@repo/ui/components/ui/field';
import { Input } from '@repo/ui/components/ui/input';
import { useField } from './use-field';

type TextFieldProps = {
    label: React.ReactNode;
    id?: string;
    className?: string;
} & Omit<
    React.ComponentProps<typeof Input>,
    'id' | 'name' | 'value' | 'onBlur' | 'onChange' | 'aria-invalid'
>;

function TextField({ label, id, className, ...inputProps }: TextFieldProps) {
    const { field, isInvalid, errors, inputId } = useField<string>({ id });

    return (
        <Field data-invalid={isInvalid || undefined} className={className}>
            <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
            <Input
                id={inputId}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={isInvalid}
                {...inputProps}
            />
            {isInvalid && <FieldError errors={errors} />}
        </Field>
    );
}

export { TextField };
