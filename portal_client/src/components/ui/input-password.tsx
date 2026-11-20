'use client';

import * as React from 'react';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { Input } from '@/components/ui/input';

type InputPasswordProps = Omit<React.ComponentProps<typeof Input>, 'type' | 'endIcon'> & {
    showPasswordLabel?: string;
    hidePasswordLabel?: string;
};

function InputPassword({
    startIcon = <KeyRound />,
    showPasswordLabel = 'Show password',
    hidePasswordLabel = 'Hide password',
    ...props
}: InputPasswordProps) {
    const [visible, setVisible] = React.useState(false);

    return (
        <Input
            {...props}
            type={visible ? 'text' : 'password'}
            startIcon={startIcon}
            endIcon={
                <button
                    type="button"
                    onClick={() => setVisible((value) => !value)}
                    className="text-muted-foreground hover:text-input rounded-md p-1.5 transition-colors"
                    aria-label={visible ? hidePasswordLabel : showPasswordLabel}
                    aria-pressed={visible}
                >
                    {visible ? (
                        <EyeOff className="size-4" aria-hidden />
                    ) : (
                        <Eye className="size-4" aria-hidden />
                    )}
                </button>
            }
        />
    );
}

export { InputPassword };
