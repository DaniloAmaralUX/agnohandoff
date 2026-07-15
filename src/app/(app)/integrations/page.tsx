"use client";

import {
  GitBranch,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Hash,
  Calendar,
  Activity,
  Zap,
  NotebookText,
  CreditCard,
  Circle,
  Check,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader, PageShell } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { projects } from "@/lib/data";

/* Repositório por projeto — derivado de `projects` (mesmo tom Vitalmed). */
const repoBySlug: Record<
  string,
  { repo: string; ownership: "own" | "org"; lastPush: string }
> = {
  // NBSP antes da unidade ("2 h") — evita quebra número/unidade (CRAFT).
  prj_sofia: { repo: "vitalmed/sofia-agents", ownership: "own", lastPush: "há 2 h" },
  prj_recep: { repo: "vitalmed/agent-templates", ownership: "org", lastPush: "há 3 dias" },
  prj_leo: { repo: "vitalmed/leo-sdr", ownership: "own", lastPush: "ontem" },
};

/* Integrações futuras — ícone lucide aproximado + descrição curta. */
type FutureIntegration = {
  name: string;
  description: string;
  icon: typeof Hash;
  tone: string;
  available: boolean;
};

const futureIntegrations: FutureIntegration[] = [
  {
    name: "Slack",
    description: "Notifica a equipe quando um agente escala uma conversa.",
    icon: Hash,
    tone: "text-amethyst-text",
    available: true,
  },
  {
    name: "Google Calendar",
    description: "Sincroniza agendamentos da clínica com a agenda médica.",
    icon: Calendar,
    tone: "text-bluetron-text",
    available: true,
  },
  {
    name: "Datadog",
    description: "Exporta métricas de latência e uso de tokens dos agentes.",
    icon: Activity,
    tone: "text-amethyst-text",
    available: false,
  },
  {
    name: "Zapier",
    description: "Conecta a Vitalmed a mais de 6 mil apps sem código.",
    icon: Zap,
    tone: "text-honey-text",
    available: true,
  },
  {
    name: "Notion",
    description: "Registra transcrições e resumos de atendimento na base.",
    icon: NotebookText,
    tone: "text-muted-foreground",
    available: false,
  },
  {
    name: "Stripe",
    description: "Cobra consultas particulares direto pelo chat do agente.",
    icon: CreditCard,
    tone: "text-bluetron-text",
    available: false,
  },
];

const PAT = "ghp_9fK2mNq7Xa4L8vT1cB6rE3sW0dZ5yH2jP7Q";
const PAT_MASK = "ghp_••••••••••••••••••••••••••••2jP7Q";

export default function IntegrationsPage() {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  // Status de conexão por integração (mock local) — "idle" → "connecting".
  const [connecting, setConnecting] = useState<Record<string, boolean>>({});

  const copyPat = () => {
    navigator.clipboard?.writeText(PAT).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const connect = (name: string) => {
    setConnecting((prev) => ({ ...prev, [name]: true }));
    toast.success("Conexão iniciada (demo).", {
      description: "Demo: não persiste ao recarregar.",
    });
  };

  return (
    <PageShell>
      {/* O slot de ação do PageHeader é reservado para o CTA primário — como
          esta tela não tem um, deixamos vazio (silêncio também é informação).
          O plano já é comunicado no rodapé da sidebar. */}
      <PageHeader
        title="Integrações"
        subtitle="Conecte a Vitalmed às ferramentas que sua equipe já usa."
      />

      {/* ── GitHub (destaque) ────────────────────────────────────── */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-secondary">
              <GitBranch className="size-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">GitHub</CardTitle>
                <Badge
                  variant="outline"
                  className="gap-1 border-border text-[11px] font-normal"
                >
                  <Circle className="size-2 fill-current text-forest-text" />
                  Conectado
                </Badge>
              </div>
              <CardDescription>
                Sincroniza definições de agentes e prompts versionados por projeto.
              </CardDescription>
            </div>
          </div>
          {/* CardAction devolve o botão ao topo direito no tamanho sm. */}
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast.info("Reconfigurar GitHub", {
                  description: "Demo: disponível na versão integrada.",
                })
              }
            >
              <RefreshCw data-icon="inline-start" />
              Reconfigurar
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Personal Access Token */}
          <div className="space-y-1.5">
            <p className="text-[12px] font-medium text-muted-foreground">
              Personal Access Token
            </p>
            <div className="flex items-center gap-2">
              <code translate="no" className="flex h-9 flex-1 items-center overflow-hidden rounded-md border border-border bg-muted/50 px-3 font-mono text-[13px] text-foreground">
                {revealed ? PAT : PAT_MASK}
              </code>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={revealed ? "Ocultar token" : "Revelar token"}
                    className="size-9 shrink-0"
                    onClick={() => setRevealed((v) => !v)}
                  >
                    {revealed ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {revealed ? "Ocultar token" : "Revelar token"}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Copiar token"
                    className="size-9 shrink-0"
                    onClick={copyPat}
                  >
                    {copied ? (
                      <Check className="size-4 text-forest-text" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{copied ? "Copiado!" : "Copiar"}</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <Separator />

          {/* Repositórios por projeto */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-medium text-muted-foreground">
                Repositórios por projeto
              </p>
              <span className="font-mono text-[11px] text-muted-foreground tabular">
                {projects.length} vinculados
              </span>
            </div>

            <div className="divide-y divide-border overflow-hidden rounded-md border border-border">
              {projects.map((p) => {
                const r = repoBySlug[p.id];
                if (!r) return null;
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-mono text-[13px] text-foreground">
                          {r.repo}
                        </span>
                        <Badge
                          variant="outline"
                          className={`shrink-0 border-border text-[11px] font-normal ${
                            r.ownership === "own"
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {r.ownership === "own" ? "Repo próprio" : "Padrão da org"}
                        </Badge>
                      </div>
                      <p className="truncate text-[12px] text-muted-foreground">
                        {p.name} · {p.workspace}
                      </p>
                    </div>
                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="text-[11px] text-muted-foreground">último push</p>
                      <p className="font-mono text-[11px] text-foreground tabular">
                        {r.lastPush}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Integrações futuras ──────────────────────────────────── */}
      {/* Rótulo de seção em sans-medium — Fraunces (h1/h2) fica reservado para
          o título-herói de topo da página; usar serif aqui achata a hierarquia. */}
      <div className="mt-8 space-y-1">
        <h3 className="font-sans-force text-sm font-medium text-foreground">
          Mais integrações
        </h3>
        <p className="text-sm text-muted-foreground">
          Amplie o alcance dos seus agentes conectando outras ferramentas.
        </p>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {futureIntegrations.map((it) => {
          const Icon = it.icon;
          return (
            <Card key={it.name} className="gap-0 py-4">
              <CardContent className="flex h-full flex-col px-4">
                <div className="flex items-start justify-between">
                  <div className="flex size-9 items-center justify-center rounded-md border border-border bg-secondary">
                    <Icon className={`size-[18px] ${it.tone}`} />
                  </div>
                  {!it.available && (
                    <Badge
                      variant="outline"
                      className="gap-1 border-border text-[11px] font-normal text-muted-foreground"
                    >
                      <Circle className="size-2 fill-current text-muted-foreground" />
                      Em breve
                    </Badge>
                  )}
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  {it.name}
                </p>
                <p className="mt-1 flex-1 text-[12px] leading-relaxed text-muted-foreground">
                  {it.description}
                </p>
                <div className="mt-3">
                  {it.available ? (
                    connecting[it.name] ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="w-full"
                      >
                        <Loader2 data-icon="inline-start" className="animate-spin" />
                        Conectando…
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => connect(it.name)}
                      >
                        Conectar
                      </Button>
                    )
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="w-full"
                    >
                      Indisponível
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
