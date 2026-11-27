'use client';

import { useSelector } from '@tanstack/react-form';
import { useFieldContext } from '@/components/form/context';

type UseFieldOptions = {
    id?: string;
};

function useField<T>({ id }: UseFieldOptions = {}) {
    const field = useFieldContext<T>();
    const isInvalid = useSelector(
        field.store,
        (state) => state.meta.isTouched && !state.meta.isValid,
    );
    const errors = useSelector(field.store, (state) => state.meta.errors);
    const inputId = id ?? field.name;

    return { field, isInvalid, errors, inputId };
}

export { useField };
