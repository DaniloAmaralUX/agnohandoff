"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ROUTE_LABELS } from "@/components/app-sidebar";

/* Deriva "Fer-ra-men-tas" a partir do slug — fallback antes de repetir "AgnoHub". */
function humanize(seg: string) {
  return seg
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export function Topbar() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const seg = parts[0] ?? "dashboard";
  const label = ROUTE_LABELS[seg] ?? humanize(seg);
  // #96: em rotas de detalhe (ex.: /agents/sofia), acrescenta o nó atual
  // não-clicável — o breadcrumb do builder passa a ler "AgnoHub / Agentes / Sofia".
  const detail = parts[1] ? humanize(parts[1]) : null;

  // #99: exibir "Ctrl K" fora do macOS (padrão Geist/Vercel). Sem hydration
  // mismatch: começa com o rótulo neutro "⌘K" e ajusta no cliente.
  const [modKey, setModKey] = useState("⌘K");
  useEffect(() => {
    const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform)
      || /Mac/.test(navigator.userAgent);
    setModKey(isMac ? "⌘K" : "Ctrl K");
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
      <SidebarTrigger className="text-muted-foreground" />
      <Separator orientation="vertical" className="mr-1 h-5" />

      <nav className="flex items-center gap-1.5 text-sm">
        <span className="flex size-4 items-center justify-center rounded bg-heat text-[10px] font-bold text-heat-foreground">A</span>
        <span className="text-muted-foreground">AgnoHub</span>
        <span className="text-border">/</span>
        {detail ? (
          <>
            <span className="text-muted-foreground">{label}</span>
            <span className="text-border">/</span>
            <span className="font-medium text-foreground">{detail}</span>
          </>
        ) : (
          <span className="font-medium text-foreground">{label}</span>
        )}
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
            {modKey}
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
