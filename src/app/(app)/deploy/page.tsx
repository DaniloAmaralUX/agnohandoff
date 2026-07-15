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
  ExternalLink,
} from "lucide-react";

import { PageHeader, PageShell } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge, ToneAvatar } from "@/components/bits";
import {
  Card,
  CardAction,
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
import { initials } from "@/lib/utils";

/* ── Ícone + tint por alvo de publicação ────────────────────────── */
const targetMeta: Record<string, { icon: typeof Server; tint: string }> = {
  vm: { icon: Server, tint: "bg-bluetron/12 text-bluetron-700 dark:text-bluetron-text" },
  // Heat é reservado para ação/CTA — usar aqui num de três alvos equivalentes
  // criava ênfase falsa. Amethyst mantém identidade e fica neutro semanticamente.
  cloud: { icon: Cloud, tint: "bg-amethyst/12 text-amethyst-700 dark:text-amethyst-text" },
  export: { icon: Download, tint: "bg-forest/12 text-forest-700 dark:text-forest-text" },
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
        {/* Pré-condição visível: sem alvo selecionado, o CTA fica desabilitado
            com título explicando o próximo passo — em vez de prometer ação e
            devolver toast de erro. */}
        <Button
          size="sm"
          className="bg-heat text-heat-foreground hover:bg-heat-hover"
          onClick={publish}
          disabled={!selected}
          title={
            selected
              ? undefined
              : "Selecione um alvo de publicação primeiro"
          }
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
        <CardHeader>
          <CardTitle className="text-base">Publicações</CardTitle>
          {/* Contador volta ao canto direito via CardAction; texto PT alinha
              com o resto da tela ("Publicações", "Último deploy"). */}
          <CardAction>
            <span className="font-mono text-[11px] tabular text-muted-foreground">
              {deployments.length} publicações
            </span>
          </CardAction>
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
                        {/* initials() canônico (#128) — antes slice(0,1) cru. */}
                        {initials(d.agent)}
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
                    {d.url === "—" ? (
                      d.url
                    ) : (
                      /* URL vira link (nova aba) + ícone external no hover —
                         mesmo espírito da chave de API que já tem copy. */
                      <a
                        href={`https://${d.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex items-center gap-1 text-foreground underline-offset-4 hover:underline"
                      >
                        {d.url}
                        <ExternalLink
                          aria-hidden
                          className="size-3 opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      </a>
                    )}
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
