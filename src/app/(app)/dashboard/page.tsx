"use client";

import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  FileBarChart,
  Bot,
  MessagesSquare,
  Circle,
} from "lucide-react";

import { PageHeader, PageShell } from "@/components/page-header";
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
        <Button size="sm" className="bg-heat text-heat-foreground hover:bg-heat-hover">
          <Plus data-icon="inline-start" />
          Novo agente
        </Button>
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

      {/* ── Gráfico + canais ─────────────────────────────────────── */}
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Conversas</CardTitle>
            <CardDescription>Últimos 14 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-1.5">
              {conversationSeries.map((v, i) => (
                <div
                  key={i}
                  className="group relative flex-1 rounded-t-sm bg-heat/85 transition-colors hover:bg-heat"
                  style={{ height: `${(v / maxSeries) * 100}%` }}
                >
                  <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-graphite px-1.5 py-0.5 font-mono text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {v}
                  </span>
                </div>
              ))}
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

      {/* ── Agentes + conversas ──────────────────────────────────── */}
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
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
                  {a.name.slice(0, 2)}
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
          <CardHeader className="flex-row items-center justify-between">
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
                    {c.contact
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{c.contact}</p>
                    {c.unread && <span className="size-1.5 rounded-full bg-heat" />}
                  </div>
                  <p className="truncate text-[12px] text-muted-foreground">
                    {c.preview}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                    {c.time}
                  </span>
                  <Badge
                    variant="outline"
                    className="gap-1 border-border text-[10px] font-normal"
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
