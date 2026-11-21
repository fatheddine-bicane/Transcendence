'use client';

import { formContext } from '@/components/form/context';

type AppFormProps = Omit<React.ComponentProps<'form'>, 'onSubmit'> & {
    form: NonNullable<React.ComponentProps<typeof formContext.Provider>['value']>;
};

function AppForm({ form, children, ...formProps }: AppFormProps) {
    return (
        <formContext.Provider value={form}>
            <form
                {...formProps}
                onSubmit={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void form.handleSubmit();
                }}
            >
                {children}
            </form>
        </formContext.Provider>
    );
}

export { AppForm };
export type { AppFormProps };
