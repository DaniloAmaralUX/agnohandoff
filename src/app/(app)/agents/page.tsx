"use client";

import Link from "next/link";
import {
  Plus,
  Circle,
  BrainCircuit,
  Wrench,
  Bot,
  BadgeCheck,
  Pencil,
  Play,
  TriangleAlert,
  MessageCircle,
} from "lucide-react";

import { PageHeader, PageShell } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, TONE_TEXT_AA } from "@/components/bits";
import { cn, initials } from "@/lib/utils";
import { statusDot, TONE as toneMap } from "@/lib/constants";
import { useAgents } from "@/lib/api/agents";

export default function AgentsPage() {
  const { data: agents = [], isLoading, isError, refetch } = useAgents();

  const total = agents.length;
  const isEmpty = !isLoading && !isError && agents.length === 0;
  const published = agents.filter((a) => a.status === "Publicado").length;
  const withMemory = agents.filter((a) => a.memory).length;

  // #98: 4o slot passa a ser um sinal OPERACIONAL (conecta Agentes a Operar),
  // não "Média de tools" — métrica sem contexto na lista.
  const stats = [
    { label: "Agentes", value: String(total), hint: "no projeto", icon: Bot },
    { label: "Publicados", value: String(published), hint: "em produção", icon: BadgeCheck },
    { label: "Com memória", value: String(withMemory), hint: "contexto persistente", icon: BrainCircuit },
    { label: "Conversas hoje", value: "42", hint: "atendidas por agentes", icon: MessageCircle },
  ];

  return (
    <PageShell>
      <PageHeader
        title="Agentes"
        subtitle="Gerencie os agentes de IA que atendem os pacientes da Vitalmed."
      >
        <Button asChild size="sm" className="bg-heat text-heat-foreground hover:bg-heat-hover">
          <Link href="/agents/sofia">
            <Plus data-icon="inline-start" />
            Novo agente
          </Link>
        </Button>
      </PageHeader>

      {isError && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-crimson/30 bg-crimson/5 px-4 py-3">
          <div className="flex items-center gap-2 text-[13px] text-foreground">
            <TriangleAlert className="size-4 text-crimson" />
            Não foi possível carregar os agentes da API.
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar de novo
          </Button>
        </div>
      )}

      {/* ── Mini-métricas ────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="gap-0 py-4">
            <CardContent className="px-4">
              <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <s.icon className="size-3.5" />
                {s.label}
              </div>
              {isLoading ? (
                <Skeleton className="mt-2 h-7 w-10" />
              ) : (
                <p className="mt-2 font-mono text-2xl font-semibold tracking-tight tabular">
                  {s.value}
                </p>
              )}
              <p className="mt-1 text-[12px] text-muted-foreground">{s.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Grid de agentes ──────────────────────────────────────── */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={`sk-${i}`} className="h-[184px] gap-0 py-0">
              <CardHeader className="flex-row gap-3 px-4 pt-4">
                <Skeleton className="size-11 rounded-md" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardHeader>
            </Card>
          ))}

        {!isLoading &&
          agents.map((a) => (
            <Card key={a.id} className="gap-0 py-0">
              <CardHeader className="flex-row items-start gap-3 px-4 pt-4">
                <div
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-md text-sm font-semibold",
                    toneMap[a.tone] ?? "bg-secondary text-foreground",
                    TONE_TEXT_AA[a.tone],
                  )}
                >
                  {initials(a.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{a.name}</p>
                    {/* #19: badge SEM affordance de toggle — publicar/despublicar
                        vive dentro do builder, com confirmação. Aqui é só sinal. */}
                    <Badge
                      variant="outline"
                      className="shrink-0 gap-1 border-border text-[11px] font-normal"
                    >
                      <Circle className={`size-2 fill-current ${statusDot(a.status)}`} />
                      {a.status}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                    {a.role || "—"}
                  </p>
                  <p translate="no" className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                    {a.model || "—"}
                  </p>
                </div>
              </CardHeader>

              {(a.memory || a.tools !== undefined) && (
                <CardContent className="px-4 pb-4 pt-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {a.memory && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                        <BrainCircuit className="size-3" />
                        Memória
                      </span>
                    )}
                    {a.tools !== undefined && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                        <Wrench className="size-3" />
                        <span className="tabular">{a.tools}</span> tools
                      </span>
                    )}
                  </div>
                </CardContent>
              )}

              <Separator />

              <CardFooter className="gap-1 px-2 py-1.5">
                {/* "Editar" agora aponta para o agente clicado — antes
                    todos levavam a /agents/sofia (achado usability). */}
                <Button asChild variant="ghost" size="sm" className="flex-1 text-muted-foreground">
                  <Link href={`/agents/${a.id.slice(4)}`}>
                    <Pencil data-icon="inline-start" />
                    Editar
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="flex-1 text-muted-foreground">
                  <Link href="/playground">
                    <Play data-icon="inline-start" />
                    Testar
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}

        {/* #126: card fantasma "Criar novo" no fim da coleção — mesmo
            padrão do ghost card de /projects; leva ao CTA de criar. */}
        {!isLoading && !isError && !isEmpty && (
          <Link
            href="/agents/sofia"
            className="flex min-h-[168px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/40 px-4 py-6 text-center outline-none transition-colors hover:border-heat/50 hover:bg-accent focus-visible:ring-2 focus-visible:ring-heat/40"
          >
            <div className="flex size-11 items-center justify-center rounded-md heat-tint">
              <Plus className="size-5" />
            </div>
            <p className="text-sm font-medium">Novo agente</p>
            <p className="text-pretty text-[13px] text-muted-foreground">
              Configure um agente para atender seus pacientes.
            </p>
          </Link>
        )}

        {isEmpty && (
          <EmptyState
            icon={Bot}
            title="Nenhum agente ainda"
            description="Crie seu primeiro agente para começar a atender."
            action={
              <Button asChild size="sm" className="bg-heat text-heat-foreground hover:bg-heat-hover">
                <Link href="/agents/sofia">
                  <Plus data-icon="inline-start" />
                  Novo agente
                </Link>
              </Button>
            }
          />
        )}
      </div>
    </PageShell>
  );
}
