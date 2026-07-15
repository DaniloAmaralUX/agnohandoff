"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Check,
  Minus,
  CreditCard,
  KeyRound,
  Activity,
  Building2,
  Gauge,
  Lock,
  ShieldCheck,
} from "lucide-react";

import { PageHeader, PageShell } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { org } from "@/lib/data";

/* ── Dados locais da tela (mesmo tom do data.ts) ─────────────────── */

import { PLAN, shortTokens } from "@/lib/plan-data";

const planLimits = [
  { label: "Projetos", value: "10", used: "3" },
  { label: "Agentes por projeto", value: "8", used: "3" },
  {
    label: "Tokens por mês",
    value: shortTokens(PLAN.tokensPerMonth),
    used: shortTokens(PLAN.tokensUsed),
  },
];

const planFeatures = [
  { label: "BYOK — sua própria chave de API", included: true },
  { label: "BYOL — Langfuse self-hosted", included: true },
  { label: "Canais ilimitados por projeto", included: true },
  { label: "Suporte prioritário (SLA 4h)", included: true },
  { label: "SSO / SAML corporativo", included: false },
];

const providers = [
  { value: "anthropic", label: "Anthropic" },
  { value: "openai", label: "OpenAI" },
  { value: "google", label: "Google" },
  { value: "groq", label: "Groq" },
];

type RangeControl = {
  id: string;
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
  suffix: string;
};

const perfControls: RangeControl[] = [
  { id: "workers", label: "Workers da API", hint: "Processos concorrentes de inferência", min: 1, max: 16, step: 1, suffix: "" },
  { id: "timeout", label: "Timeout de resposta", hint: "Tempo máximo por requisição", min: 5, max: 120, step: 5, suffix: "s" },
  { id: "whatsapp", label: "Concorrência WhatsApp", hint: "Mensagens simultâneas por canal", min: 1, max: 50, step: 1, suffix: "" },
  { id: "pool", label: "Pool do banco", hint: "Conexões abertas ao Postgres", min: 5, max: 100, step: 5, suffix: "" },
];

export default function SettingsPage() {
  const [perf, setPerf] = React.useState<Record<string, number>>({
    workers: 4,
    timeout: 30,
    whatsapp: 12,
    pool: 20,
  });
  const [cache, setCache] = React.useState(true);

  return (
    <PageShell>
      <PageHeader
        title="Configurações"
        subtitle="Plano, chaves, observabilidade e ajustes da organização Vitalmed."
      />

      <Tabs defaultValue="plano" className="mt-6">
        <TabsList>
          <TabsTrigger className="text-foreground/70" value="plano">
            <CreditCard data-icon="inline-start" />
            Plano
          </TabsTrigger>
          <TabsTrigger className="text-foreground/70" value="byok">
            <KeyRound data-icon="inline-start" />
            BYOK
          </TabsTrigger>
          <TabsTrigger className="text-foreground/70" value="langfuse">
            <Activity data-icon="inline-start" />
            Langfuse
          </TabsTrigger>
          <TabsTrigger className="text-foreground/70" value="org">
            <Building2 data-icon="inline-start" />
            Organização
          </TabsTrigger>
          <TabsTrigger className="text-foreground/70" value="perf">
            <Gauge data-icon="inline-start" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* ── Plano ────────────────────────────────────────────────── */}
        <TabsContent value="plano" className="mt-4">
          <div className="grid gap-3 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex-row items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">Plano {org.plan}</CardTitle>
                    <Badge
                      variant="outline"
                      className="gap-1 border-heat/30 text-[11px] font-normal text-heat-text"
                    >
                      Atual
                    </Badge>
                  </div>
                  <CardDescription>
                    Faturamento mensal · renova em 12/07/2026
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold tracking-tight tabular">
                    {PLAN.priceLabel}
                  </p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {PLAN.priceSuffix}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3">
                  {planLimits.map((l) => (
                    <div
                      key={l.label}
                      className="rounded-md border border-border bg-muted/40 px-3 py-3"
                    >
                      <p className="text-[12px] text-muted-foreground">{l.label}</p>
                      <p className="mt-1 font-mono text-lg font-semibold tabular text-foreground">
                        {l.value}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] tabular text-muted-foreground">
                        {l.used} em uso
                      </p>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex items-center justify-between">
                  <p className="text-[13px] text-muted-foreground">
                    <span className="font-mono tabular text-foreground">
                      {org.seatsUsed}
                    </span>{" "}
                    de{" "}
                    <span className="font-mono tabular text-foreground">
                      {org.seats}
                    </span>{" "}
                    assentos ocupados
                  </p>
                  <Button
                    size="sm"
                    className="bg-heat text-heat-foreground hover:bg-heat-hover"
                    onClick={() =>
                      toast.info("Gerenciamento de plano em breve.", {
                        description: "Fale com o comercial para ajustar assentos e limites.",
                      })
                    }
                  >
                    Gerenciar plano
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recursos inclusos</CardTitle>
                <CardDescription>O que o plano {org.plan} libera</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {planFeatures.map((f) => (
                  /* Ícone negativo (Minus) para itens não inclusos evita a contradição
                     visual (check + tachado) e melhora a leitura por screen reader. */
                  <div key={f.label} className="flex items-center gap-2.5">
                    <span
                      className={`flex size-4 items-center justify-center rounded-full ${
                        f.included
                          ? "bg-forest/15 text-forest-text"
                          : "bg-muted text-muted-foreground"
                      }`}
                      aria-hidden
                    >
                      {f.included ? (
                        <Check className="size-2.5" strokeWidth={3} />
                      ) : (
                        <Minus className="size-2.5" strokeWidth={3} />
                      )}
                    </span>
                    <span
                      className={`text-[13px] ${
                        f.included ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {f.label}
                      {!f.included && (
                        <span className="ml-1.5 text-foreground/70">
                          — disponível no Scale
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── BYOK ─────────────────────────────────────────────────── */}
        <TabsContent value="byok" className="mt-4">
          <Card className="max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <KeyRound className="size-4 text-muted-foreground" />
                <CardTitle className="text-base">Chave de API própria (BYOK)</CardTitle>
              </div>
              <CardDescription>
                Use os créditos do seu provedor. A chave é criptografada em repouso e
                nunca exibida novamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="byok-provider">Provedor</Label>
                  <Select defaultValue="anthropic">
                    <SelectTrigger id="byok-provider" className="w-full">
                      <SelectValue placeholder="Selecione o provedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="byok-key">Chave de API</Label>
                  <Input
                    id="byok-key"
                    type="password"
                    placeholder="sk-ant-••••••••••••••••••••"
                    className="font-mono"
                    defaultValue="sk-ant-a1b2c3d4e5f6g7h8"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
                <ShieldCheck className="size-4 shrink-0 text-forest-text" />
                <p className="text-[12px] text-muted-foreground">
                  Criptografia AES-256. Última chave salva em{" "}
                  <span className="font-mono tabular text-foreground">
                    28/06/2026 09:14
                  </span>
                  .
                </p>
              </div>
            </CardContent>
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <p className="text-[12px] text-muted-foreground">
                Aplica-se a todos os agentes da organização.
              </p>
              <Button
                size="sm"
                className="bg-heat text-heat-foreground hover:bg-heat-hover"
                onClick={() =>
                  toast.success("Chave salva.", {
                    description: "Demo: não persiste ao recarregar.",
                  })
                }
              >
                <Lock data-icon="inline-start" />
                Salvar chave criptografada
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* ── Langfuse (BYOL) ──────────────────────────────────────── */}
        <TabsContent value="langfuse" className="mt-4">
          <Card className="max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-muted-foreground" />
                <CardTitle className="text-base">Langfuse (BYOL)</CardTitle>
              </div>
              <CardDescription>
                Conecte sua instância Langfuse self-hosted para observabilidade e
                traces dos agentes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lf-host">Host</Label>
                <Input
                  id="lf-host"
                  placeholder="https://langfuse.suaempresa.com.br"
                  className="font-mono"
                  defaultValue="https://langfuse.vitalmed.com.br"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lf-public">Public Key</Label>
                  <Input
                    id="lf-public"
                    className="font-mono"
                    placeholder="pk-lf-••••••••"
                    defaultValue="pk-lf-7f3a9c21"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lf-secret">Secret Key</Label>
                  <Input
                    id="lf-secret"
                    type="password"
                    className="font-mono"
                    placeholder="sk-lf-••••••••"
                    defaultValue="sk-lf-b8e4d0a2"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="gap-1 border-border text-[11px] font-normal"
                >
                  <span className="size-2 rounded-full bg-forest" />
                  Conectado
                </Badge>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {/*   antes da unidade — número não separa de "min". */}
                  {"latência 42 ms · último trace há 3 min"}
                </span>
              </div>
            </CardContent>
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <p className="text-[12px] text-muted-foreground">
                As credenciais ficam criptografadas na organização.
              </p>
              <Button
                size="sm"
                className="bg-heat text-heat-foreground hover:bg-heat-hover"
                onClick={() =>
                  toast.success("Conexão salva.", {
                    description: "Demo: não persiste ao recarregar.",
                  })
                }
              >
                Salvar conexão
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* ── Organização ──────────────────────────────────────────── */}
        <TabsContent value="org" className="mt-4">
          <Card className="max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-muted-foreground" />
                <CardTitle className="text-base">Dados da organização</CardTitle>
              </div>
              <CardDescription>
                Informações públicas usadas em faturas e no painel.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Nome</Label>
                  <Input id="org-name" defaultValue={org.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-slug">Slug</Label>
                  <Input
                    id="org-slug"
                    className="font-mono"
                    defaultValue="vitalmed"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-email">Email de contato</Label>
                <Input
                  id="org-email"
                  type="email"
                  className="font-mono"
                  defaultValue="contato@vitalmed.com.br"
                />
              </div>
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
                <p className="text-[12px] text-muted-foreground">
                  URL do painel:{" "}
                  <span className="font-mono text-foreground">
                    app.agnohub.com/vitalmed
                  </span>
                </p>
              </div>
            </CardContent>
            <div className="flex items-center justify-end border-t border-border px-6 py-4">
              <Button
                size="sm"
                className="bg-heat text-heat-foreground hover:bg-heat-hover"
                onClick={() =>
                  toast.success("Configurações salvas.", {
                    description: "Demo: não persiste ao recarregar.",
                  })
                }
              >
                Salvar
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* ── Performance ──────────────────────────────────────────── */}
        <TabsContent value="perf" className="mt-4">
          <Card className="max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gauge className="size-4 text-muted-foreground" />
                <CardTitle className="text-base">Ajustes de performance</CardTitle>
              </div>
              <CardDescription>
                Controle a capacidade e os limites do runtime dos agentes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {perfControls.map((c) => (
                <div key={c.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={c.id}>{c.label}</Label>
                    <span className="font-mono text-[13px] font-medium tabular text-foreground">
                      {perf[c.id]}
                      {c.suffix}
                    </span>
                  </div>
                  <input
                    id={c.id}
                    type="range"
                    min={c.min}
                    max={c.max}
                    step={c.step}
                    value={perf[c.id]}
                    onChange={(e) =>
                      setPerf((prev) => ({
                        ...prev,
                        [c.id]: Number(e.target.value),
                      }))
                    }
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-heat"
                  />
                  <p className="text-[11px] text-muted-foreground">{c.hint}</p>
                </div>
              ))}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="perf-cache">Cache de respostas</Label>
                  <p className="text-[11px] text-muted-foreground">
                    {"Reaproveita respostas idênticas por 5 min"}
                  </p>
                </div>
                <Switch
                  id="perf-cache"
                  checked={cache}
                  onCheckedChange={setCache}
                />
              </div>

              <div className="rounded-md border border-border bg-muted/40 px-3 py-2.5">
                <p className="font-mono text-[11px] tabular text-muted-foreground">
                  workers={perf.workers} · timeout={perf.timeout}s ·
                  whatsapp={perf.whatsapp} · pool={perf.pool} · cache=
                  {cache ? "on" : "off"}
                </p>
              </div>
            </CardContent>
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <p className="text-[12px] text-muted-foreground">
                Alterações reiniciam os workers em ~10s.
              </p>
              <Button
                size="sm"
                className="bg-heat text-heat-foreground hover:bg-heat-hover"
                onClick={() =>
                  toast.success("Configurações salvas.", {
                    description: "Demo: não persiste ao recarregar.",
                  })
                }
              >
                Salvar
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
