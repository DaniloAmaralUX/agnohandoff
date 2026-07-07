import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { CommandMenu } from "@/components/command-menu";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <a
          href="#main-content"
          className="sr-only rounded-md bg-heat px-3 py-1.5 text-sm font-medium text-heat-foreground focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50"
        >
          Pular para o conteúdo
        </a>
        <Topbar />
        <main id="main-content" className="flex-1 overflow-x-hidden">
          <AuthGuard>{children}</AuthGuard>
        </main>
      </SidebarInset>
      <CommandMenu />
    </SidebarProvider>
  );
}
