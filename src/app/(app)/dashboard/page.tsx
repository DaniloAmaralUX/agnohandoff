"use client";

import Link from "next/link";
import { toast } from "sonner";
import {
  Plus,
  FileBarChart,
  Bot,
  MessagesSquare,
  Circle,
} from "lucide-react";

import { PageHeader, PageShell } from "@/components/page-header";
import { StatCard } from "@/components/bits";
import { initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  agents,
  channelSplit,
  conversations,
  conversationSeries,
  metrics,
} from "@/lib/data";
import { statusDot, TONE as toneMap } from "@/lib/constants";

export default function DashboardPage() {
  const maxSeries = Math.max(...conversationSeries);

  return (
    <PageShell>
      <PageHeader
        title="Bom dia, Danilo"
        subtitle="Visão geral do que seus agentes fizeram nas últimas 24 horas."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success("Relatório gerado (demo).")}
        >
          <FileBarChart data-icon="inline-start" />
          Relatório
        </Button>
        {/* CTA usa --primary p/ AA (achado: fill heat vivo reprova AA) */}
        <Button size="sm">
          <Plus data-icon="inline-start" />
          Novo agente
        </Button>
      </PageHeader>

      {/* ── Métricas ─────────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* #125: anatomia canônica de KPI — StatCard (valor em Geist Mono tabular) */}
        {metrics.map((m) => (
          <StatCard
            key={m.label}
            label={m.label}
            value={m.value}
            delta={m.delta}
            trend={m.trend}
            hint={m.hint}
          />
        ))}
      </div>

      {/* ── Gráfico + canais ─────────────────────────────────────── */}
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Conversas</CardTitle>
            <CardDescription>Últimos 14 dias</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Barras em tint (bg-heat/30), 'hoje' cheio — acento por escassez (achado: 30 barras laranja diluem o CTA único);
                referência de escala à esquerda p/ leitura sem hover (achado: sem eixo Y, tooltip falha em touch/dark) */}
            {/* #71: gráfico div-based legível por leitor de tela */}
            <div
              role="img"
              aria-label={`Barras: conversas por dia nos últimos 14 dias, pico de ${maxSeries}`}
              className="relative flex h-40 items-end gap-1.5"
            >
              <span className="absolute -top-1 left-0 font-mono text-[10px] text-muted-foreground">
                máx {maxSeries}
              </span>
              {conversationSeries.map((v, i) => {
                const isToday = i === conversationSeries.length - 1;
                return (
                  <div
                    key={i}
                    className={`group relative flex-1 rounded-t-sm transition-colors ${
                      isToday ? "bg-heat" : "bg-heat/30 hover:bg-heat/60"
                    }`}
                    style={{ height: `${(v / maxSeries) * 100}%` }}
                  >
                    {/* Tooltip por tokens — inverte com tema (achado: bg-graphite fixo somia no dark) */}
                    <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded border border-border bg-popover px-1.5 py-0.5 font-mono text-[10px] text-popover-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      {v}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>14 dias atrás</span>
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
                {/* #71: barra de progresso legível por leitor de tela */}
                <div
                  role="img"
                  aria-label={`${c.name}: ${c.value}% das conversas`}
                  className="h-1.5 overflow-hidden rounded-full bg-muted"
                >
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

      {/* ── Agentes + conversas ──────────────────────────────────── */}
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Card>
          {/* !flex força layout row (o base do CardHeader é grid — flex-row sozinho não sobrescreve). Achado: 'Ver todos' empilhado. */}
          <CardHeader className="!flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Seus agentes</CardTitle>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              <Link href="/agents">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {agents.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent"
              >
                <div
                  className={`flex size-9 items-center justify-center rounded-md text-[13px] font-semibold ${
                    toneMap[a.avatarTone]
                  }`}
                >
                  {/* #128: iniciais canônicas (2 letras, maiúsculas) */}
                  {initials(a.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.name}</p>
                  <p className="truncate text-[12px] text-muted-foreground">
                    {a.role}
                  </p>
                </div>
                <span className="hidden font-mono text-[11px] text-muted-foreground sm:block">
                  {a.model}
                </span>
                <Badge
                  variant="outline"
                  className="gap-1 border-border text-[11px] font-normal"
                >
                  <Circle className={`size-2 fill-current ${statusDot(a.status)}`} />
                  {a.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          {/* !flex força layout row (o base do CardHeader é grid — flex-row sozinho não sobrescreve). Achado: 'Ver todos' empilhado. */}
          <CardHeader className="!flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <MessagesSquare className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Conversas recentes</CardTitle>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              <Link href="/conversations">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {conversations.slice(0, 5).map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-secondary text-[11px] font-medium text-secondary-foreground">
                    {/* #128: iniciais canônicas (2 letras, maiúsculas) */}
                    {initials(c.contact)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{c.contact}</p>
                    {c.unread && (
                      <span
                        className="flex size-1.5 items-center justify-center rounded-full bg-heat"
                        role="status"
                      >
                        <span className="sr-only">Não lida</span>
                      </span>
                    )}
                  </div>
                  <p className="truncate text-[12px] text-muted-foreground">
                    {c.preview}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="whitespace-nowrap text-[11px] tabular text-muted-foreground">
                    {c.time}
                  </span>
                  {/* Padroniza em 11px (achado: 10 vs 11px em cards gêmeos) */}
                  <Badge
                    variant="outline"
                    className="gap-1 border-border text-[11px] font-normal"
                  >
                    <Circle className={`size-2 fill-current ${statusDot(c.status)}`} />
                    {c.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
