'use client';

import { PropsWithChildren, Suspense, useState } from 'react';
import { Locale } from 'next-intl';
import { Globe } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';
import { getLocaleLabel, routingLabels } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Props extends PropsWithChildren {
    locale: Locale;
    className?: string;
}

export function LocaleSwitcher(props: Props) {
    return (
        <Suspense
            fallback={
                <Select>
                    <SelectTrigger
                        className={cn(
                            'group min-h-7 w-40 gap-1 border-none bg-transparent sm:min-h-8',
                            props.className,
                        )}
                    >
                        <Globe className="text-primary-light size-4" />
                        <SelectValue>{props.children}</SelectValue>
                    </SelectTrigger>
                </Select>
            }
        >
            <Dropdown {...props} />
        </Suspense>
    );
}

function Dropdown({ locale, children, className }: Props) {
    const [selected, setSelected] = useState(() => getLocaleLabel(locale));
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    return (
        <Select
            value={selected.code}
            onValueChange={(value) => {
                if (!value) return;

                setSelected(getLocaleLabel(value));
                router.replace(`${pathname}?${searchParams.toString()}`, {
                    locale: value,
                });
            }}
        >
            <SelectTrigger
                className={cn(
                    'min-h-7 gap-2 border-none bg-transparent sm:min-h-8',
                    className,
                )}
            >
                <Globe className="text-primary-light size-4" />
                <SelectValue placeholder={selected.name}>
                    {children}
                </SelectValue>
            </SelectTrigger>
            <SelectContent align="end" alignItemWithTrigger={false}>
                {routingLabels.map((label) => (
                    <SelectItem key={label.code} value={label.code}>
                        {label.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
