export { cn } from 'cn';

function getErrorMessage(error: unknown) {
    if (!error) return;
    if (typeof error === 'string') return error;
    if (typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        return error.message;
    }

    return String(error);
}

function formatFieldErrors(errors?: Array<unknown>) {
    return errors?.map(getErrorMessage).filter(Boolean).join(', ');
}

export { getErrorMessage, formatFieldErrors };
