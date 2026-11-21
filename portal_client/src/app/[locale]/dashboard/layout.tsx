import { RequireAccess } from '@/components/Auth/RequireAccess';
import { DashboardSidebar } from '@/components/Dashboard/DashboardSidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <RequireAccess>
            <TooltipProvider>
                <SidebarProvider>
                    <DashboardSidebar />
                    <SidebarInset>
                        <header className="border-sidebar-border flex h-12 shrink-0 items-center gap-2 border-b px-3">
                            <SidebarTrigger />
                        </header>
                        <div className="flex flex-1 flex-col p-4">{children}</div>
                    </SidebarInset>
                </SidebarProvider>
            </TooltipProvider>
        </RequireAccess>
    );
}

export default DashboardLayout;
