'use client';

import { Field, FieldError, FieldLabel } from '@repo/ui/components/ui/field';
import { InputPassword } from '@repo/ui/components/ui/input-password';
import { useField } from './use-field';

type PasswordFieldProps = {
    label: React.ReactNode;
    labelAction?: React.ReactNode;
    id?: string;
    className?: string;
} & Omit<
    React.ComponentProps<typeof InputPassword>,
    'id' | 'name' | 'value' | 'onBlur' | 'onChange' | 'aria-invalid'
>;

function PasswordField({ label, labelAction, id, className, ...inputProps }: PasswordFieldProps) {
    const { field, isInvalid, errors, inputId } = useField<string>({ id });

    return (
        <Field data-invalid={isInvalid || undefined} className={className}>
            <div className="flex items-center justify-between gap-3">
                <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
                {labelAction}
            </div>
            <InputPassword
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

export { PasswordField };
