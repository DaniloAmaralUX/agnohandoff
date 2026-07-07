"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  LayoutDashboard,
  MessagesSquare,
  Bot,
  FlaskConical,
  Wrench,
  Plug,
  Brain,
  Radio,
  SlidersHorizontal,
  BarChart3,
  Rocket,
  Boxes,
  FolderKanban,
  Puzzle,
  CreditCard,
  Settings,
  Plus,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type Item = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string;
};

const NAV: { heading: string; items: Item[] }[] = [
  {
    heading: "Navegação",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Conversas", href: "/conversations", icon: MessagesSquare },
      { label: "Agentes", href: "/agents", icon: Bot },
      { label: "Playground", href: "/playground", icon: FlaskConical },
      { label: "Ferramentas", href: "/tools", icon: Wrench },
      { label: "MCP", href: "/mcp", icon: Plug },
      { label: "Memória", href: "/memory", icon: Brain },
      { label: "Canais", href: "/channels", icon: Radio },
      { label: "Studio", href: "/studio", icon: SlidersHorizontal },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Deploy", href: "/deploy", icon: Rocket },
      { label: "Workspaces", href: "/workspaces", icon: Boxes },
      { label: "Projetos", href: "/projects", icon: FolderKanban },
      { label: "Integrações", href: "/integrations", icon: Puzzle },
      { label: "Faturamento", href: "/billing", icon: CreditCard },
      { label: "Configurações", href: "/settings", icon: Settings },
    ],
  },
  {
    heading: "Ações",
    items: [
      { label: "Novo agente", href: "/agents/sofia", icon: Plus, keywords: "criar adicionar" },
      { label: "Novo projeto", href: "/projects", icon: Plus, keywords: "criar adicionar" },
      { label: "Documentação de design", href: "/design", icon: Puzzle, keywords: "tokens design system" },
    ],
  },
];

export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("agnohub:cmdk", onOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("agnohub:cmdk", onOpen);
    };
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* ⌘K é ação de teclado (100+/dia) → abre SECO, sem zoom/fade (regra do Emil:
          "keyboard/command-palette = no animation, ever"; Raycast não anima). */}
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden p-0 duration-0 data-open:animate-none data-closed:animate-none sm:max-w-lg"
      >
        <DialogTitle className="sr-only">Buscar telas e ações</DialogTitle>
        <Command label="Buscar telas e ações">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Command.Input
              autoFocus
              placeholder="Buscar telas e ações…"
              className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-1.5">
            <Command.Empty className="px-3 py-6 text-center text-[13px] text-muted-foreground">
              Nada encontrado.
            </Command.Empty>
            {NAV.map((g) => (
              <Command.Group
                key={g.heading}
                heading={g.heading}
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {g.items.map((it) => (
                  <Command.Item
                    key={it.label}
                    value={`${it.label} ${it.keywords ?? ""}`}
                    onSelect={() => go(it.href)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-[13px] text-foreground data-[selected=true]:bg-accent"
                  >
                    <it.icon className="size-4 text-muted-foreground" />
                    {it.label}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
