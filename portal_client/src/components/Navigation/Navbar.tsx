import { Messages } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { LocaleSwitcher } from '@/components/ui/localeSwitcher';
import { Button, buttonVariants } from '@/components/ui/button';
import { getLocaleLabel } from '@/i18n/routing';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { Menu } from 'lucide-react';

interface Props {
    locale: string;
    t: Messages['navigation'];
    className?: string;
}

function Navbar({ locale, t, className }: Props) {
    const localeLabel = getLocaleLabel(locale);

    return (
        <nav
            className={cn(
                'flex items-center gap-2 p-2 md:gap-4 md:px-0 md:py-5 lg:gap-8',
                className,
            )}
        >
            <Logo label={t.home} />

            <div className="text-secondary-light hidden text-xs font-medium md:flex md:items-center md:gap-5 lg:text-sm">
                <Link
                    href="/how-it-works"
                    className="hover:text-primary transition-colors"
                >
                    {t.howItWorks}
                </Link>
                <Link
                    href="/about"
                    className="hover:text-primary transition-colors"
                >
                    {t.about}
                </Link>
                <Link
                    href="/psychologists"
                    className="hover:text-primary transition-colors"
                >
                    {t.psychologists}
                </Link>
                <Link
                    href="/for-professionals"
                    className="hover:text-primary transition-colors"
                >
                    {t.forProfessionals}
                </Link>
            </div>

            <div className="ms-auto flex items-center gap-3">
                <Link
                    href="/signin"
                    className={cn(
                        buttonVariants({
                            variant: 'ghost',
                            size: 'lg',
                            className: 'hidden md:inline-flex',
                        }),
                    )}
                >
                    {t.login}
                </Link>

                <Link
                    href="/signup"
                    className={cn(
                        buttonVariants({
                            size: 'lg',
                            className: 'hidden md:inline-flex',
                        }),
                    )}
                >
                    {t.getStarted}
                </Link>

                <LocaleSwitcher locale={locale}>
                    <span className="sm:hidden lg:inline">
                        {localeLabel.name}
                    </span>
                </LocaleSwitcher>
                <Drawer swipeDirection="right">
                    <DrawerTrigger
                        render={
                            <Button
                                variant="ghost"
                                className="hover:text-primary md:hidden"
                            />
                        }
                    >
                        <span className="sr-only">{t.openMenu}</span>
                        <Menu className="size-4" />
                    </DrawerTrigger>
                    <DrawerContent className="md:hidden">
                        <div className="flex flex-col gap-5 p-4">
                            <div className="space-y-2">
                                <Link
                                    href="/signin"
                                    className={buttonVariants({
                                        variant: 'ghost',
                                        size: 'lg',
                                        className: 'w-full',
                                    })}
                                >
                                    {t.login}
                                </Link>

                                <Link
                                    href="/signup"
                                    className={buttonVariants({
                                        size: 'lg',
                                        className: 'w-full',
                                    })}
                                >
                                    {t.getStarted}
                                </Link>
                            </div>
                            <div className="text-secondary-light mt-auto flex flex-col gap-5 text-sm font-medium">
                                <Link
                                    href="/how-it-works"
                                    className="hover:text-primary transition-colors"
                                >
                                    {t.howItWorks}
                                </Link>
                                <Link
                                    href="/about"
                                    className="hover:text-primary transition-colors"
                                >
                                    {t.about}
                                </Link>
                                <Link
                                    href="/psychologists"
                                    className="hover:text-primary transition-colors"
                                >
                                    {t.psychologists}
                                </Link>
                                <Link
                                    href="/for-professionals"
                                    className="hover:text-primary transition-colors"
                                >
                                    {t.forProfessionals}
                                </Link>
                            </div>
                        </div>
                        <DrawerFooter>
                            <DrawerClose render={<Button variant="outline" />}>
                                {t.closeMenu}
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div>
        </nav>
    );
}

function Logo({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2">
            <Link className="bg-primary-light/20 rounded-md p-2" href="/">
                <span className="sr-only">{label}</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19"
                    height="19"
                    fill="none"
                    className="text-primary-light"
                    aria-hidden
                >
                    <path
                        fill="currentColor"
                        d="M9.167 18.333a12.4 12.4 0 0 1-3.323-.905 9.1 9.1 0 0 1-2.945-2.005q-1.295-1.305-2.097-3.3T0 7.333v-.916h.917q1.168 0 2.406.298a9.2 9.2 0 0 1 2.315.893q.275-1.971 1.248-4.044Q7.861 1.49 9.166 0q1.307 1.489 2.28 3.564.975 2.073 1.25 4.044a9.2 9.2 0 0 1 2.314-.893 10.3 10.3 0 0 1 2.407-.298h.916v.916q0 2.796-.802 4.79-.801 1.995-2.097 3.3a9.2 9.2 0 0 1-2.933 2.005 12.2 12.2 0 0 1-3.334.905m-.046-1.879q-.252-3.804-2.257-5.752T1.879 8.296q.252 3.918 2.326 5.844 2.074 1.924 4.916 2.314m.046-5.82q.344-.505.836-1.043.494-.54.951-.928-.045-1.306-.516-2.728a14 14 0 0 0-1.271-2.772 14 14 0 0 0-1.272 2.772q-.47 1.422-.516 2.728.459.39.963.928.503.538.825 1.042m1.787 5.409a9.4 9.4 0 0 0 1.765-.802 6.7 6.7 0 0 0 1.707-1.433q.79-.905 1.352-2.257.561-1.352.676-3.254-2.154.32-3.781 1.432a7.5 7.5 0 0 0-2.498 2.83q.275.735.47 1.604.195.871.31 1.88m-1.788 2.291"
                    />
                </svg>
            </Link>
            <p
                aria-hidden
                className="font-jakarta text-lg font-semibold lg:text-xl"
            >
                Nafs
                <span className="text-primary-light">Care</span>
            </p>
        </div>
    );
}

export default Navbar;
