"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Rocket,
  Server,
  Cloud,
  Download,
  ArrowRight,
  Check,
} from "lucide-react";

import { PageHeader, PageShell } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge, ToneAvatar } from "@/components/bits";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { agents, deployTargets, deployments } from "@/lib/data";

/* ── Ícone + tint por alvo de publicação ────────────────────────── */
const targetMeta: Record<string, { icon: typeof Server; tint: string }> = {
  vm: { icon: Server, tint: "bg-bluetron/12 text-bluetron-text" },
  cloud: { icon: Cloud, tint: "heat-tint" },
  export: { icon: Download, tint: "bg-forest/12 text-forest-text" },
};

/* Tom do avatar por agente (reaproveita o seed dos agentes). */
function agentTone(name: string): string {
  return agents.find((a) => a.name === name)?.avatarTone ?? "graphite";
}

export default function DeployPage() {
  // Alvo de publicação selecionado — estado local (mock read-only).
  const [selected, setSelected] = useState<string | null>(null);

  const selectTarget = (t: (typeof deployTargets)[number]) => {
    setSelected(t.key);
    toast.success(`Alvo selecionado: ${t.name}.`);
  };

  const publish = () => {
    if (!selected) {
      toast.error("Escolha um alvo de publicação primeiro.");
      return;
    }
    toast.success("Deploy iniciado (demo).");
  };

  return (
    <PageShell>
      <PageHeader
        title="Deploy"
        subtitle="Publique seus agentes na VM do cliente, no Cloud Run ou exporte o projeto."
      >
        <Button
          size="sm"
          className="bg-heat text-heat-foreground hover:bg-heat-hover"
          onClick={publish}
        >
          <Rocket data-icon="inline-start" />
          Publicar
        </Button>
      </PageHeader>

      {/* ── Alvos de publicação ──────────────────────────────────── */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {deployTargets.map((t) => {
          const meta = targetMeta[t.key];
          const Icon = meta.icon;
          const isSelected = selected === t.key;
          return (
            <Card
              key={t.key}
              className={`gap-0 py-0 transition-colors ${
                isSelected ? "border-heat ring-1 ring-heat/40" : ""
              }`}
            >
              <CardContent className="flex h-full flex-col gap-3 p-4">
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-md ${meta.tint}`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
                    {t.desc}
                  </p>
                </div>
                <div className="mt-auto border-t border-border pt-3">
                  {isSelected ? (
                    <Button
                      size="sm"
                      className="w-full justify-between bg-heat text-heat-foreground hover:bg-heat-hover"
                      onClick={() => selectTarget(t)}
                    >
                      Selecionado
                      <Check data-icon="inline-end" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between border-border"
                      onClick={() => selectTarget(t)}
                    >
                      Selecionar
                      <ArrowRight data-icon="inline-end" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Publicações ──────────────────────────────────────────── */}
      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Publicações</CardTitle>
          <span className="font-mono text-[11px] tabular text-muted-foreground">
            {deployments.length} deployments
          </span>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agente</TableHead>
                <TableHead>Alvo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="text-right">Último deploy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deployments.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <ToneAvatar
                        tone={agentTone(d.agent)}
                        className="size-7 text-[11px]"
                      >
                        {d.agent.slice(0, 1)}
                      </ToneAvatar>
                      <span className="font-medium text-foreground">
                        {d.agent}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {d.target}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={d.status} />
                  </TableCell>
                  <TableCell className="font-mono tabular text-[13px] text-muted-foreground">
                    {d.version}
                  </TableCell>
                  <TableCell className="font-mono text-[12px] text-muted-foreground">
                    {d.url}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[12px] text-muted-foreground">
                    {d.lastDeploy}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageShell>
  );
}
