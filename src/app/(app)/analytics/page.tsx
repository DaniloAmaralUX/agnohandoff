"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, ArrowDownRight, BarChart3 } from "lucide-react";

import { PageHeader, PageShell } from "@/components/page-header";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  agents,
  channelSplit,
  conversationSeries,
  metrics,
} from "@/lib/data";

// Uso derivado por agente (mock plausível — clínica Vitalmed).
const agentUsage: Record<string, { calls: number; latency: number; tokens: string }> = {
  agt_sofia: { calls: 4218, latency: 620, tokens: "2,1M" },
  agt_agenda: { calls: 2864, latency: 480, tokens: "1,3M" },
  agt_fin: { calls: 742, latency: 910, tokens: "0,4M" },
  agt_leo: { calls: 1596, latency: 540, tokens: "0,9M" },
};

const topAgents = agents
  .map((a) => ({ ...a, ...agentUsage[a.id] }))
  .sort((x, y) => y.calls - x.calls);

// Séries por período. 90d agregado por semana p/ o filtro ter comportamento visível (achado: 90d = 30d).
const seriesByPeriod: Record<string, number[]> = {
  "7d": conversationSeries.slice(-7),
  "30d": [...conversationSeries, ...conversationSeries].slice(0, 30),
  // 13 semanas ~ 90 dias — agregação semanal (soma de blocos de 7 amostras cíclicas)
  "90d": Array.from({ length: 13 }, (_, w) => {
    let sum = 0;
    for (let d = 0; d < 7; d++) {
      sum += conversationSeries[(w * 7 + d) % conversationSeries.length];
    }
    return sum;
  }),
};

const periodLabel: Record<string, string> = {
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  "90d": "Últimos 90 dias",
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  const series = seriesByPeriod[period];
  const maxSeries = useMemo(() => Math.max(...series), [series]);

  return (
    <PageShell>
      <PageHeader
        title="Analytics"
        subtitle="Como seus agentes performaram — conversas, canais e consumo."
      >
        {/* Badge Pro removido — o usuário demo já é Pro (sidebar diz 'Plano Pro'); competia com o único controle funcional (achado) */}
        <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <SelectTrigger size="sm" className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      {/* ── Métricas ─────────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="gap-0 py-4">
            <CardContent className="px-4">
              <p className="text-[13px] text-muted-foreground">{m.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular">
                {m.value}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[12px]">
                <span
                  className={`inline-flex items-center gap-0.5 font-medium ${
                    m.trend === "up" ? "text-forest-text" : "text-muted-foreground"
                  }`}
                >
                  {m.trend === "up" ? (
                    <ArrowUpRight className="size-3.5" />
                  ) : (
                    <ArrowDownRight className="size-3.5" />
                  )}
                  {m.delta}
                </span>
                <span className="text-muted-foreground">{m.hint}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Conversas por dia + canais ───────────────────────────── */}
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Conversas por dia</CardTitle>
            <CardDescription>{periodLabel[period]}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Barras rebaixadas p/ tint; última = 'hoje' em cheio; tooltip por tokens (achados: massa laranja + tooltip somia no dark) */}
            <div className="relative flex h-40 items-end gap-1">
              <span className="absolute -top-1 left-0 font-mono text-[10px] text-muted-foreground">
                máx {maxSeries}
              </span>
              {series.map((v, i) => {
                const isLast = i === series.length - 1;
                return (
                  <div
                    key={i}
                    className={`group relative flex-1 rounded-t-sm transition-colors ${
                      isLast ? "bg-heat" : "bg-heat/30 hover:bg-heat/60"
                    }`}
                    style={{ height: `${(v / maxSeries) * 100}%` }}
                  >
                    <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded border border-border bg-popover px-1.5 py-0.5 font-mono text-[10px] text-popover-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      {v}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>{period === "7d" ? "7 dias atrás" : "início do período"}</span>
              <span>hoje</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Canais</CardTitle>
            <CardDescription>Distribuição das conversas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {channelSplit.map((c) => (
              <div key={c.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-foreground">{c.name}</span>
                  <span className="font-medium tabular text-muted-foreground">
                    {c.value}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${c.value}%`, background: c.color }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Top agentes ──────────────────────────────────────────── */}
      <div className="mt-3">
        <Card>
          {/* !flex força row layout (achado: 'Ver todos' empilhado) */}
          <CardHeader className="!flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Top agentes</CardTitle>
            </div>
            <span className="text-[12px] text-muted-foreground">
              {periodLabel[period]}
            </span>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agente</TableHead>
                  <TableHead className="text-right">Chamadas</TableHead>
                  <TableHead className="text-right">Latência média (ms)</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topAgents.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{a.name}</span>
                        <span className="text-[12px] text-muted-foreground">
                          {a.role}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular">
                      {a.calls.toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular">
                      {a.latency}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular">
                      {a.tokens}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
