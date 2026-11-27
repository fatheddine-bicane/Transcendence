import { Skeleton } from '@/components/ui/skeleton';

function RequireAccessSkeleton() {
    return (
        <div className="flex min-h-svh w-full">
            <aside className="border-sidebar-border bg-sidebar hidden w-64 flex-col gap-4 border-r p-3 md:flex">
                <Skeleton className="h-10 w-full" />
                <div className="flex flex-col gap-2 pt-4">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-3/4" />
                </div>
                <div className="mt-auto">
                    <Skeleton className="h-8 w-full" />
                </div>
            </aside>

            <div className="flex flex-1 flex-col">
                <header className="border-sidebar-border flex h-12 items-center gap-2 border-b px-3">
                    <Skeleton className="size-7" />
                    <Skeleton className="h-4 w-28" />
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-40 w-full" />
                    <div className="grid gap-3 md:grid-cols-2">
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export { RequireAccessSkeleton };
