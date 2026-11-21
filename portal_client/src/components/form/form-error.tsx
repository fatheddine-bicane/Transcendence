import { cn } from '@/lib/utils';

type FormErrorProps = {
    children: React.ReactNode;
    className?: string;
};

function FormError({ children, className }: FormErrorProps) {
    if (!children) return null;

    return (
        <p
            role="alert"
            className={cn(
                'border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-3 py-3 text-center text-sm',
                className,
            )}
        >
            {children}
        </p>
    );
}

export { FormError };
