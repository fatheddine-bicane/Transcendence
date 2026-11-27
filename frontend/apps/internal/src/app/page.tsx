import { Lock, Shield } from 'lucide-react';
import SignInForm from '@/components/Auth/SignInForm';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@repo/ui/components/ui/card';

export default function SignInPage() {
    return (
        <main className="bg-accent flex min-h-full items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">
                <div className="bg-background/70 mb-5 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-sm backdrop-blur-sm">
                    <div className="bg-primary-lighter flex size-9 shrink-0 items-center justify-center rounded-xl">
                        <Shield className="text-primary-light size-4" aria-hidden />
                    </div>
                    <div className="min-w-0">
                        <p className="text-foreground text-[0.6875rem] font-semibold tracking-wider uppercase">
                            Staff access
                        </p>
                        <p className="text-input text-sm font-semibold">Nafs internal portal</p>
                    </div>
                </div>

                <Card className="relative gap-3 sm:py-10 sm:[--card-spacing:--spacing(8)]">
                    <div
                        className="bg-primary-lighter/70 pointer-events-none absolute -inset-e-24 -top-24 size-80 rounded-full blur-3xl"
                        aria-hidden
                    />

                    <CardHeader className="relative">
                        <CardTitle className="text-[1.875rem] leading-9.5">Sign in</CardTitle>
                        <CardDescription className="text-base">
                            Use your Nafs staff credentials to continue.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="relative">
                        <SignInForm />
                    </CardContent>
                </Card>

                <p className="text-muted-foreground mt-4 flex items-center justify-center gap-1.5 text-xs">
                    <Lock className="size-3.5 shrink-0" aria-hidden />
                    Secure staff-only access
                </p>
            </div>
        </main>
    );
}
