"use client";

import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  conversations: "Conversas",
  agents: "Agentes",
  tools: "Ferramentas",
  channels: "Canais",
  playground: "Playground",
  analytics: "Analytics",
  workspaces: "Workspaces",
  integrations: "Integrações",
  billing: "Faturamento",
  settings: "Configurações",
};

export function Topbar() {
  const pathname = usePathname();
  const seg = pathname.split("/").filter(Boolean)[0] ?? "dashboard";
  const label = LABELS[seg] ?? "AgnoHub";

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
      <SidebarTrigger className="text-muted-foreground" />
      <Separator orientation="vertical" className="mr-1 h-5" />

      <nav className="flex items-center gap-1.5 text-sm">
        <span className="flex size-4 items-center justify-center rounded bg-heat text-[10px] font-bold text-heat-foreground">A</span>
        <span className="text-muted-foreground">AgnoHub</span>
        <span className="text-border">/</span>
        <span className="font-medium text-foreground">{label}</span>
      </nav>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("agnohub:cmdk"))}
          className="hidden items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-[13px] text-muted-foreground transition hover:bg-accent active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:flex"
        >
          <Search className="size-3.5" />
          <span>Buscar</span>
          <kbd className="ml-4 rounded border border-border bg-muted px-1.5 font-mono text-[10px]">
            ⌘K
          </kbd>
        </button>
        <Button variant="ghost" size="icon" aria-label="Notificações" className="relative text-muted-foreground">
          <Bell className="size-4.5" />
          <span className="absolute right-2 top-2 size-1.5 animate-pulse rounded-full bg-heat" />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
