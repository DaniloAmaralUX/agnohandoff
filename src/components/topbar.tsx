"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Settings,
  Sparkles,
  UserRound,
  LifeBuoy,
  ShieldCheck,
  LogOut,
} from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTE_LABELS } from "@/components/app-sidebar";
import { clearApiKey } from "@/lib/auth";

/* Deriva "Fer-ra-men-tas" a partir do slug — fallback antes de repetir "AgnoHub". */
function humanize(seg: string) {
  return seg
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
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
        <span className="flex size-4 items-center justify-center rounded bg-heat text-[10px] font-bold leading-none text-heat-foreground">A</span>
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

      {/* Controles globais em alvos de 40px (CRAFT: hit area mínima; estão em toda
          tela → o alvo importa em cada navegação). gap-1 separa sem sobrepor. */}
      <div className="ml-auto flex items-center gap-1">
        {/* Busca = ícone de lupa que abre o ⌘K (padrão Linear/Notion). O atalho
            segue no kbd do tooltip; o command menu abre seco. */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Buscar"
              className="size-10 text-muted-foreground"
              onClick={() => window.dispatchEvent(new Event("agnohub:cmdk"))}
            >
              <Search className="size-4.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Buscar
            <kbd data-slot="kbd" className="rounded bg-background/15 px-1.5 font-mono text-[10px]">
              {modKey}
            </kbd>
          </TooltipContent>
        </Tooltip>

        {/* Dot de "novo" estático — sem animate-pulse: motion contínuo num elemento
            sempre visível distrai sem comunicar mais que a cor já comunica (Emil). */}
        <Button variant="ghost" size="icon" aria-label="Notificações" className="relative size-10 text-muted-foreground">
          <Bell className="size-4.5" />
          <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-heat" />
        </Button>

        <ThemeToggle />

        <Separator orientation="vertical" className="mx-1 h-5" />

        {/* Conta do usuário — canto superior direito (padrão Vercel/Linear).
            A organização permanece na sidebar (contexto de navegação). */}
        <AccountMenu onSignOut={() => { clearApiKey(); router.push("/login"); }} />
      </div>
    </header>
  );
}

function AccountMenu({ onSignOut }: { onSignOut: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Abrir menu da conta"
          className="group/account grid size-10 place-items-center rounded-full outline-none transition-transform duration-150 ease-out-strong active:scale-[0.96]"
        >
          <Avatar className="size-8 rounded-full outline outline-1 -outline-offset-1 outline-black/10 ring-ring/50 ring-offset-2 ring-offset-background transition-[box-shadow] duration-150 group-hover/account:ring-2 group-focus-visible/account:ring-2 group-data-[state=open]/account:ring-2 dark:outline-white/10">
            <AvatarFallback className="rounded-full bg-graphite text-[11px] font-semibold text-white">
              DA
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60 rounded-lg"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex items-center gap-2 py-2">
          <Avatar className="size-8 rounded-md">
            <AvatarFallback className="rounded-md bg-graphite text-[11px] font-semibold text-white">
              DA
            </AvatarFallback>
          </Avatar>
          <div className="grid leading-tight">
            <span className="text-[13px] font-semibold">Danilo Amaral</span>
            <span className="text-[11px] font-normal text-muted-foreground">
              danilo@vitalmed.com.br
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 heat-tint font-medium">
          <Sparkles className="size-4" />
          Fazer upgrade para Scale
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="gap-2">
            <UserRound className="size-4 text-muted-foreground" />
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="gap-2">
            <Link href="/settings">
              <Settings className="size-4 text-muted-foreground" />
              Configurações
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <LifeBuoy className="size-4 text-muted-foreground" />
            Suporte
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="gap-2">
            <Link href="/super-admin">
              <ShieldCheck className="size-4 text-muted-foreground" />
              Super Admin
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 text-crimson focus:text-crimson"
          onClick={onSignOut}
        >
          <LogOut className="size-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
