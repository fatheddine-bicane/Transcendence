import { createFormHook } from '@tanstack/react-form';
import { fieldContext, formContext } from './context';
import { CheckboxField } from './checkbox-field';
import { FormSubmitError } from './form-submit-error';
import { PasswordField } from './password-field';
import { SubmitButton } from './submit-button';
import { TextField } from './text-field';

export { AppForm } from './form';

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
