"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  LayoutDashboard,
  MessagesSquare,
  Bot,
  Wrench,
  Radio,
  Play,
  BarChart3,
  FolderKanban,
  Plug,
  CreditCard,
  Settings,
  ChevronsUpDown,
  Check,
  Plus,
  Server,
  Brain,
  SquareTerminal,
  Rocket,
  Folder,
} from "lucide-react";

import { org, workspaces } from "@/lib/data";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

/* Nav agrupada — FONTE ÚNICA da label de cada rota, usada tanto pela sidebar
   quanto pelo breadcrumb do topbar (evita o bug "AgnoHub / AgnoHub" que a
   auditoria pegou em Deploy, MCP, Memória, Studio, Projetos e Super Admin). */
export const nav: {
  label: string;
  items: { title: string; href: string; icon: React.ElementType; badge?: string }[];
}[] = [
  {
    label: "Principal",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Conversas", href: "/conversations", icon: MessagesSquare, badge: "3" },
    ],
  },
  {
    label: "Construir",
    items: [
      { title: "Agentes", href: "/agents", icon: Bot },
      { title: "Ferramentas", href: "/tools", icon: Wrench },
      { title: "MCP", href: "/mcp", icon: Server },
      { title: "Memória", href: "/memory", icon: Brain },
      { title: "Canais", href: "/channels", icon: Radio },
      { title: "Playground", href: "/playground", icon: Play },
      { title: "Studio", href: "/studio", icon: SquareTerminal },
    ],
  },
  {
    label: "Operar",
    items: [
      { title: "Analytics", href: "/analytics", icon: BarChart3 },
      { title: "Deploy", href: "/deploy", icon: Rocket },
      { title: "Workspaces", href: "/workspaces", icon: FolderKanban },
      { title: "Projetos", href: "/projects", icon: Folder },
      { title: "Integrações", href: "/integrations", icon: Plug },
    ],
  },
  {
    label: "Conta",
    items: [
      { title: "Faturamento", href: "/billing", icon: CreditCard },
      { title: "Configurações", href: "/settings", icon: Settings },
    ],
  },
];

/* Mapa segmento → título derivado da nav; + rotas fora do (app) que precisam
   de breadcrumb (super-admin). Consumido pelo Topbar. */
export const ROUTE_LABELS: Record<string, string> = {
  ...Object.fromEntries(
    nav.flatMap((g) => g.items.map((i) => [i.href.replace(/^\//, ""), i.title])),
  ),
  "super-admin": "Super Admin",
};

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      {/* ── Switcher de organização ───────────────────────────────── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded bg-heat text-heat-foreground">
                    <span className="text-[15px] font-bold leading-none">A</span>
                  </div>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-[13px] font-semibold">
                      {org.name}
                    </span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      Plano {org.plan} · AgnoHub
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto -mr-px size-4 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 rounded-lg"
                align="start"
                side="right"
                sideOffset={8}
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Organização
                </DropdownMenuLabel>
                <DropdownMenuItem className="gap-2">
                  <div className="flex size-6 items-center justify-center rounded-md bg-heat text-heat-foreground">
                    <span className="text-[10px] font-bold">{org.logoInitials}</span>
                  </div>
                  <span className="font-medium">{org.name}</span>
                  <Check className="ml-auto size-4 text-heat" />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Workspaces
                </DropdownMenuLabel>
                {workspaces.map((ws) => (
                  <DropdownMenuItem
                    key={ws.id}
                    className="gap-2"
                    onClick={() =>
                      toast.info(`Trocar para ${ws.name}`, {
                        description: "Demo: disponível na versão integrada.",
                      })
                    }
                  >
                    <FolderKanban className="size-4 text-muted-foreground" />
                    <span className="truncate">{ws.name}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 text-muted-foreground"
                  onClick={() =>
                    toast.info("Novo workspace", {
                      description: "Demo: disponível na versão integrada.",
                    })
                  }
                >
                  <Plus className="size-4" />
                  Novo workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Navegação agrupada ────────────────────────────────────── */}
      <SidebarContent>
        {nav.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpenMobile(false)}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge className="ml-auto h-5 min-w-5 justify-center rounded-full bg-heat px-1 text-[10px] tabular-nums text-heat-foreground">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
