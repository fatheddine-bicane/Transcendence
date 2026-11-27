import { createFormHook } from '@tanstack/react-form';
import { fieldContext, formContext } from '@/components/form/context';
import { CheckboxField } from '@/components/form/checkbox-field';
import { FormSubmitError } from '@/components/form/form-submit-error';
import { PasswordField } from '@/components/form/password-field';
import { SubmitButton } from '@/components/form/submit-button';
import { TextField } from '@/components/form/text-field';

export { AppForm } from '@/components/form/form';

export const { useAppForm, withForm } = createFormHook({
    fieldContext,
    formContext,
    fieldComponents: {
        TextField,
        PasswordField,
        CheckboxField,
    },
    formComponents: {
        FormSubmitError,
        SubmitButton,
    },
});
