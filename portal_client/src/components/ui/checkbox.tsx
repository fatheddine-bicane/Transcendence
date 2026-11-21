'use client';

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { Check } from 'lucide-react';
import { cn } from 'cn';

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
    return (
        <CheckboxPrimitive.Root
            data-slot="checkbox"
            className={cn(
                'border-border text-primary-light focus-visible:ring-primary-light/30 data-checked:border-primary-light data-checked:bg-primary-light flex size-4 shrink-0 items-center justify-center rounded-[2.5px] border bg-white outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 data-checked:text-white',
                className,
            )}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                data-slot="checkbox-indicator"
                className="flex items-center justify-center text-current"
            >
                <Check className="size-3" strokeWidth={3} aria-hidden />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
}

export { Checkbox };
