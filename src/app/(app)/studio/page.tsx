"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Sparkles, Terminal, TriangleAlert, Wand2 } from "lucide-react";

import { PageHeader, PageShell } from "@/components/page-header";
import { MonoLabel } from "@/components/bits";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useStudioRules,
  useToggleStudioRule,
  useGenerateStudioRule,
} from "@/lib/api/studio";

/* ── Cor da Badge por escopo da regra ────────────────────────────── */
const scopeTint: Record<string, string> = {
  Payload: "border-bluetron/25 bg-bluetron/10 text-bluetron-700 dark:text-bluetron-text",
  Voz: "border-amethyst/25 bg-amethyst/10 text-amethyst-700 dark:text-amethyst-text",
  Entrada: "border-forest/25 bg-forest/10 text-forest-text",
  Saída: "border-honey/25 bg-honey/10 text-honey-text",
};

export default function StudioPage() {
  const { data, isLoading, isError, refetch } = useStudioRules();
  const toggle = useToggleStudioRule();
  const generate = useGenerateStudioRule();
  const rules = data ?? [];
  const [prompt, setPrompt] = useState("");

  const activeCount = rules.filter((r) => r.active).length;

  function focusPrompt() {
    document.getElementById("studio-prompt")?.focus();
  }

  function toggleRule(id: string, active: boolean) {
    toggle.mutate({ id, active });
  }

  function generateRule() {
    const text = prompt.trim();
    if (!text) {
      toast.error("Descreva a regra antes de gerar.");
      focusPrompt();
      return;
    }
    generate.mutate(
      { instruction: text },
      { onSuccess: () => setPrompt("") },
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Studio"
        subtitle="Configure regras de payload e voz por linguagem natural."
      >
        {/* Ghost: fill Heat único da tela fica no rail direito ("Gerar regra"). */}
        <Button
          variant="outline"
          size="sm"
          onClick={focusPrompt}
        >
          <Plus data-icon="inline-start" />
          Nova regra
        </Button>
      </PageHeader>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* ── ESQUERDA: lista de regras ──────────────────────────────── */}
        <Card className="gap-0 py-0">
          <CardHeader className="flex-row items-center justify-between border-b border-border px-4 py-4">
            <div className="flex items-center gap-2">
              <Terminal className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Regras</CardTitle>
            </div>
            <Badge
              variant="outline"
              className="border-border font-normal tabular text-[11px] text-muted-foreground"
            >
              {/* Um único text-node evita "espaço fantasma" antes da barra. */}
              {`${activeCount}/${rules.length} ativas`}
            </Badge>
          </CardHeader>

          <CardContent className="p-0">
            {isError && (
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex items-center gap-2 text-[13px] text-foreground">
                  <TriangleAlert className="size-4 text-crimson" />
                  Não foi possível carregar as regras da API.
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Tentar de novo
                </Button>
              </div>
            )}
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`sk-${i}`}
                  className={`px-4 py-3.5 ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="mt-2 h-3 w-full" />
                </div>
              ))}
            {!isLoading && rules.map((rule, i) => (
              <div
                key={rule.id}
                className={`flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-accent ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{rule.name}</p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-normal ${scopeTint[rule.scope] ?? "border-border bg-muted text-muted-foreground"}`}
                    >
                      {rule.scope}
                    </Badge>
                    {/* 11px muted pleno: garante legibilidade AA nos dois temas. */}
                    <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                      {rule.id}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] italic leading-snug text-muted-foreground">
                    {rule.trigger}
                  </p>
                </div>
                <Switch
                  checked={rule.active}
                  onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                  aria-label={`Ativar regra ${rule.name}`}
                  className="mt-0.5 shrink-0"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── DIREITA: compor nova regra ─────────────────────────────── */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card className="gap-0 py-0">
            <CardHeader className="border-b border-border px-4 py-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-md heat-tint">
                  <Sparkles className="size-4 text-heat" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-[15px]">Nova regra</CardTitle>
                  <CardDescription className="text-[12px]">
                    Linguagem natural
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 px-4 py-4">
              <div className="flex flex-col gap-2">
                <MonoLabel>prompt</MonoLabel>
                <Textarea
                  id="studio-prompt"
                  rows={5}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Descreva a regra em português: ‘Quando o paciente…’"
                  className="resize-none text-[13px] leading-relaxed"
                />
              </div>

              {/* Preview: como o texto vira config */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <MonoLabel>preview</MonoLabel>
                  <span className="font-mono text-[10px] text-foreground/70">
                    rule.yaml
                  </span>
                </div>
                <div className="overflow-hidden rounded-lg border border-border bg-secondary/50">
                  <div className="flex items-center gap-1.5 border-b border-border px-3 py-1.5">
                    <span className="size-2 rounded-full bg-crimson/50" />
                    <span className="size-2 rounded-full bg-honey/60" />
                    <span className="size-2 rounded-full bg-forest/50" />
                  </div>
                  <pre className="overflow-x-auto px-3 py-2.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
                    <span className="text-amethyst-text">scope</span>:{" "}
                    <span className="text-foreground">payload</span>
                    {"\n"}
                    <span className="text-amethyst-text">trigger</span>:{" "}
                    <span className="text-foreground/70">
                      &quot;on: patient.message&quot;
                    </span>
                    {"\n"}
                    <span className="text-amethyst-text">action</span>:
                    {"\n"}
                    {"  "}
                    <span className="text-bluetron-text">transform</span>:{" "}
                    <span className="text-foreground">normalize_phone</span>
                    {"\n"}
                    <span className="text-amethyst-text">enabled</span>:{" "}
                    <span className="text-forest-text">true</span>
                  </pre>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  O Studio traduz seu texto em{" "}
                  <span className="font-mono text-foreground">config</span>{" "}
                  versionável antes de aplicar.
                </p>
              </div>

              <Button
                size="sm"
                className="w-full bg-heat text-heat-foreground hover:bg-heat-hover"
                onClick={generateRule}
                disabled={generate.isPending}
              >
                <Wand2 data-icon="inline-start" />
                {generate.isPending ? "Gerando…" : "Gerar regra"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
