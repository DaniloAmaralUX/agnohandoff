"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Database,
  Users,
  Coins,
  Check,
  Layers,
  Fingerprint,
  Clock,
  Save,
} from "lucide-react";

import { PageHeader, PageShell } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { MonoLabel } from "@/components/bits";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { memoryStrategies, memoryConfig, memoryStats } from "@/lib/data";
import { USE_MOCK } from "@/lib/config";
import { API_MEMORY_STRATEGIES, useUpdateProjectMemory } from "@/lib/api/memory";
import { useActiveProject } from "@/lib/project-context";

/* Em modo API mostramos as estratégias REAIS do backend (hybrid, palace_only,
   db_only, none); as conceituais (buffer/resumo/vetorial) ficam na demo. */
const STRATEGY_OPTIONS = USE_MOCK ? memoryStrategies : API_MEMORY_STRATEGIES;

/* Métricas do topo — mesmo estilo das do dashboard (número grande, tabular). */
const stats = [
  {
    label: "Itens armazenados",
    value: memoryStats.stored,
    hint: "memórias longas indexadas",
    icon: Database,
  },
  {
    label: "Contatos com memória",
    value: memoryStats.contacts,
    hint: "perfis distintos lembrados",
    icon: Users,
  },
  {
    label: "Tokens por recuperação",
    value: String(memoryStats.avgTokens),
    hint: "média injetada no contexto",
    icon: Coins,
  },
];

// Chave da estratégia inicialmente selecionada — casa o texto de memoryConfig
// com a lista de estratégias (mesma heurística de antes, agora só na semente).
const initialStrategyKey = USE_MOCK
  ? memoryStrategies.find((s) =>
      memoryConfig.strategy
        .toLowerCase()
        .includes(s.name.split(" ")[0].toLowerCase())
    )?.key ?? memoryStrategies[0].key
  : "hybrid";

export default function MemoryPage() {
  // Estado local controlado; em modo API os valores iniciais vêm do projeto
  // ativo e o Salvar persiste via PATCH /manage/projects/{id}.
  const [strategyKey, setStrategyKey] = useState<string>(initialStrategyKey);
  const [longMemory, setLongMemory] = useState(memoryConfig.longMemory);
  const [contextWindow, setContextWindow] = useState(String(memoryConfig.window));
  const [retention, setRetention] = useState(memoryConfig.retention);
  const [embeddings, setEmbeddings] = useState(memoryConfig.embeddings);

  const { project } = useActiveProject();
  const updateMemory = useUpdateProjectMemory();

  // Hidrata o form quando o projeto ativo muda (só em modo API).
  useEffect(() => {
    if (USE_MOCK || !project) return;
    if (project.memoryStrategy) {
      setStrategyKey(project.memoryStrategy);
      setLongMemory(project.memoryStrategy !== "none");
    }
    if (project.contextWindow != null) {
      setContextWindow(String(project.contextWindow));
    }
  }, [project]);

  const selectedStrategy =
    STRATEGY_OPTIONS.find((s) => s.key === strategyKey) ?? STRATEGY_OPTIONS[0];

  const saveContext = () => {
    if (USE_MOCK) {
      toast.success("Configurações de memória salvas.");
      return;
    }
    updateMemory.mutate({
      // Toggle desligado = sem memória longa, independente da estratégia.
      memoryStrategy: longMemory ? strategyKey : "none",
      contextWindow: Number(contextWindow) || 10,
    });
  };

  return (
    <PageShell>
      <PageHeader
        title="Memória"
        subtitle="Estratégia de memória longa e gestão de contexto por projeto."
      >
        <Button
          size="sm"
          className="bg-heat text-heat-foreground hover:bg-heat-hover"
          onClick={saveContext}
          disabled={updateMemory.isPending}
        >
          <Save data-icon="inline-start" />
          {updateMemory.isPending ? "Salvando…" : "Salvar"}
        </Button>
      </PageHeader>

      {/* ── Métricas ─────────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="gap-0 py-4">
            <CardContent className="px-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <s.icon className="size-4" />
                <p className="text-[13px]">{s.label}</p>
              </div>
              <p className="mt-2 font-mono text-2xl font-semibold tracking-tight tabular">
                {s.value}
              </p>
              <p className="mt-1.5 text-[12px] text-muted-foreground">
                {/* O backend ainda não expõe métricas de memória (gap no
                    HANDOFF) — em modo API os números são ilustrativos. */}
                {s.hint}
                {!USE_MOCK && " · estimativa"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Estratégia + Contexto ────────────────────────────────── */}
      {/* items-start: card Estratégia não se estica até a altura do Contexto. */}
      <div className="mt-3 grid items-start gap-3 lg:grid-cols-2">
        {/* Estratégia de memória */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Estratégia</CardTitle>
            </div>
            <CardDescription>
              Como o agente lida com o histórico ao montar o contexto.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {STRATEGY_OPTIONS.map((strategy) => {
              const selected = strategy.key === strategyKey;
              return (
                <button
                  key={strategy.key}
                  type="button"
                  onClick={() => setStrategyKey(strategy.key)}
                  aria-pressed={selected}
                  className={`flex w-full items-start gap-3 rounded-md border px-3 py-3 text-left transition-colors ${
                    selected
                      ? "heat-tint border-heat/30"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${
                      selected
                        ? "border-heat bg-heat text-heat-foreground"
                        : "border-muted-foreground/40"
                    }`}
                  >
                    {selected && <Check className="size-2.5" strokeWidth={3} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-[13px] font-medium ${
                        selected ? "text-heat-text" : "text-foreground"
                      }`}
                    >
                      {strategy.name}
                    </p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      {strategy.desc}
                    </p>
                  </div>
                </button>
              );
            })}
            <div className="rounded-md border border-border bg-muted/40 px-3 py-2.5">
              <p className="font-mono text-[11px] text-muted-foreground">
                strategy=
                <span className="text-foreground">{selectedStrategy.name}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contexto */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Contexto</CardTitle>
            </div>
            <CardDescription>
              Persistência, janela e retenção da memória por projeto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              {/* Memória persistente */}
              <Field orientation="horizontal">
                <FieldLabel htmlFor="long-memory">
                  Memória persistente
                  <FieldDescription>
                    Lembra dados do contato entre conversas diferentes.
                  </FieldDescription>
                </FieldLabel>
                <Switch
                  id="long-memory"
                  checked={longMemory}
                  onCheckedChange={setLongMemory}
                />
              </Field>

              <Separator />

              {/* Janela de contexto */}
              <Field>
                <FieldLabel htmlFor="context-window">
                  Janela de contexto
                </FieldLabel>
                <Select value={contextWindow} onValueChange={setContextWindow}>
                  <SelectTrigger id="context-window" className="w-full">
                    <SelectValue placeholder="Selecione a janela" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="10">Últimas 10 mensagens</SelectItem>
                      <SelectItem value="20">Últimas 20 mensagens</SelectItem>
                      <SelectItem value="50">Últimas 50 mensagens</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Quantas mensagens recentes entram na íntegra no prompt.
                </FieldDescription>
              </Field>

              {/* Retenção */}
              <Field>
                <FieldLabel htmlFor="retention">Retenção</FieldLabel>
                <Select value={retention} onValueChange={setRetention}>
                  <SelectTrigger id="retention" className="w-full">
                    <SelectValue placeholder="Selecione a retenção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="30 dias">30 dias</SelectItem>
                      <SelectItem value="90 dias">90 dias</SelectItem>
                      <SelectItem value="180 dias">180 dias</SelectItem>
                      <SelectItem value="Indeterminado">Indeterminado</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Por quanto tempo as memórias ficam disponíveis para busca.
                </FieldDescription>
              </Field>

              <Separator />

              {/* Embeddings */}
              <Field>
                <FieldLabel htmlFor="embeddings">
                  <span className="flex items-center gap-1.5">
                    <Fingerprint className="size-3.5 text-muted-foreground" />
                    Embeddings
                  </span>
                </FieldLabel>
                <Input
                  id="embeddings"
                  className="font-mono"
                  value={embeddings}
                  onChange={(e) => setEmbeddings(e.target.value)}
                />
                <FieldDescription>
                  Modelo usado para vetorizar o histórico na busca semântica.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>

          {/* CTA único no header salva a página inteira; rodapé mantém apenas o escopo. */}
          <div className="flex items-center border-t border-border px-6 py-4">
            <MonoLabel>por projeto · {project?.name ?? "Sofia"}</MonoLabel>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
