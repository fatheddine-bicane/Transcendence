import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { cn } from 'cn';

type InputProps = React.ComponentProps<'input'> & {
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
};

function Input({ className, startIcon, endIcon, ...props }: InputProps) {
    const input = (
        <InputPrimitive
            data-slot="input"
            className={cn(
                'bg-accent text-input placeholder:text-popover-foreground/70 focus-visible:ring-primary-light/30 aria-invalid:ring-destructive/20 w-full min-w-0 rounded-xl py-4 text-base transition-colors outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3',
                startIcon ? 'ps-11' : 'ps-4',
                endIcon ? 'pe-12' : 'pe-4',
                className,
            )}
            {...props}
        />
    );

    if (!startIcon && !endIcon) {
        return input;
    }

    return (
        <div data-slot="input-group" className="relative w-full">
            {startIcon && (
                <span
                    data-slot="input-start-icon"
                    className="text-muted-foreground pointer-events-none absolute inset-s-4 top-1/2 flex -translate-y-1/2 items-center [&_svg]:size-4"
                    aria-hidden
                >
                    {startIcon}
                </span>
            )}
            {input}
            {endIcon && (
                <span
                    data-slot="input-end-icon"
                    className="absolute inset-e-3 top-1/2 flex -translate-y-1/2 items-center"
                >
                    {endIcon}
                </span>
            )}
        </div>
    );
}

export { Input };
