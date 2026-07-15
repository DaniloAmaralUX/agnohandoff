"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import {
  Plus,
  Circle,
  FolderKanban,
  Users,
  Bot,
  Radio,
  ArrowUpRight,
  Coins,
  TriangleAlert,
} from "lucide-react";

import { PageHeader, PageShell } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { type ColumnDef } from "@tanstack/react-table";
import {
  DataTable,
  DataTableColumnHeader,
  DataTableFacetedFilter,
} from "@/components/data-table";
import { useWorkspaces, useCreateWorkspace } from "@/lib/api/workspaces";
import { useProjects, type ProjectView } from "@/lib/api/projects";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/bits";
import { FormSheet } from "@/components/form-sheet";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// Fonte única de statusDot — evita divergência de cor por tela (achado consistency).
import { statusDot } from "@/lib/constants";
import { initials } from "@/lib/utils";
import { ToneAvatar } from "@/components/bits";

// Consumo de tokens — fonte única do plano (src/lib/plan-data.ts) para
// billing/settings/workspaces convergirem numa narrativa só.
import { planUsage as tokenUsage } from "@/lib/plan-data";

const fmt = (n: number) => n.toLocaleString("pt-BR");

const newWorkspaceSchema = z.object({
  name: z.string().min(2, "Dê um nome com ao menos 2 caracteres."),
  description: z.string().max(140, "Máximo de 140 caracteres.").optional(),
});
type NewWorkspaceForm = z.infer<typeof newWorkspaceSchema>;

/* Pluralização pt-BR — corrige "1 projetos / 1 membros" (achado consistency). */
function plural(n: number, singular: string, plural = `${singular}s`) {
  return n === 1 ? singular : plural;
}

/* Hash estável (djb2) → índice de tom; deriva a cor do id do workspace,
   não do índice do array (achado consistency: cor por identidade). */
const WS_TONES = ["heat", "bluetron", "forest", "amethyst", "honey"] as const;
function toneFor(id: string) {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = ((h << 5) + h + id.charCodeAt(i)) | 0;
  return WS_TONES[Math.abs(h) % WS_TONES.length];
}

/* Colunas da tabela de projetos (DataTable — sort/busca/filtro/paginação). */
const projectColumns: ColumnDef<ProjectView>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Projeto" />
    ),
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="max-w-[280px] truncate text-[12px] text-muted-foreground">
          {row.original.description}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "workspace",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Workspace" />
    ),
    cell: ({ row }) => (
      <span className="text-[13px] text-muted-foreground">
        {row.original.workspace}
      </span>
    ),
    filterFn: (row, id, value: string[]) =>
      value.includes(row.getValue(id)),
  },
  {
    accessorKey: "agents",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Agentes" />
    ),
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1 text-[13px] text-muted-foreground">
        <Bot className="size-3.5" />
        {/* API ainda não agrega contagens — "—" honesto (gap no HANDOFF). */}
        <span className="font-mono tabular">{row.original.agents ?? "—"}</span>
      </span>
    ),
  },
  {
    accessorKey: "channels",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Canais" />
    ),
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1 text-[13px] text-muted-foreground">
        <Radio className="size-3.5" />
        <span className="font-mono tabular">{row.original.channels ?? "—"}</span>
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" className="justify-end" />
    ),
    cell: ({ row }) => (
      <div className="text-right">
        <Badge variant="outline" className="gap-1 border-border text-[11px] font-normal">
          <Circle
            className={`size-2 fill-current ${statusDot(row.original.status)}`}
          />
          {row.original.status}
        </Badge>
      </div>
    ),
    filterFn: (row, id, value: string[]) =>
      value.includes(row.getValue(id)),
  },
];

const projectColumnLabels = {
  name: "Projeto",
  workspace: "Workspace",
  agents: "Agentes",
  channels: "Canais",
  status: "Status",
};

export default function WorkspacesPage() {
  const { data, isLoading, isError, refetch } = useWorkspaces();
  const createWorkspace = useCreateWorkspace();
  const { data: projData } = useProjects();
  const items = data ?? [];
  const projectItems = projData ?? [];
  const isEmpty = !isLoading && !isError && items.length === 0;

  // Nome do workspace por id — em modo API a tabela mostra o nome real,
  // não o id truncado; e a contagem de projetos é derivada da lista.
  const wsNameById = new Map(items.map((w) => [w.id, w.name]));
  const tableProjects = projectItems.map((p) => ({
    ...p,
    workspace:
      (p.workspaceId ? wsNameById.get(p.workspaceId) : undefined) ?? p.workspace,
  }));
  const projCountByWs = new Map<string, number>();
  for (const p of projectItems) {
    if (p.workspaceId) {
      projCountByWs.set(p.workspaceId, (projCountByWs.get(p.workspaceId) ?? 0) + 1);
    }
  }

  const [open, setOpen] = useState(false);
  const form = useForm<NewWorkspaceForm>({
    resolver: standardSchemaResolver(newWorkspaceSchema),
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    createWorkspace.mutate(values);
    form.reset();
    setOpen(false);
  });

  return (
    <PageShell>
      <PageHeader
        title="Workspaces"
        subtitle="Organize projetos, equipes e o consumo da sua organização em um só lugar."
      >
        <FormSheet
          open={open}
          onOpenChange={setOpen}
          trigger={
            <Button size="sm" className="bg-heat text-heat-foreground hover:bg-heat-hover">
              <Plus data-icon="inline-start" />
              Novo workspace
            </Button>
          }
          title="Novo workspace"
          description="Um espaço para agrupar projetos, equipe e custos."
          submitLabel="Criar workspace"
          submitting={createWorkspace.isPending}
          onSubmit={onSubmit}
        >
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="ws-name">Nome</FieldLabel>
            <Input
              id="ws-name"
              placeholder="Ex.: Atendimento Clínico"
              aria-invalid={!!form.formState.errors.name}
              {...form.register("name")}
            />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="ws-desc">Descrição (opcional)</FieldLabel>
            <Textarea
              id="ws-desc"
              rows={3}
              placeholder="O que este workspace agrupa?"
              {...form.register("description")}
            />
            <FieldError errors={[form.formState.errors.description]} />
          </Field>
        </FormSheet>
      </PageHeader>

      <Tabs defaultValue="workspaces" className="mt-6">
        <TabsList>
          {/* "Visão geral" evita repetir o título da página (achado usability). */}
          <TabsTrigger value="workspaces">Visão geral</TabsTrigger>
          <TabsTrigger value="projetos">Projetos</TabsTrigger>
          <TabsTrigger value="custos">Custos</TabsTrigger>
        </TabsList>

        {/* ── Workspaces ─────────────────────────────────────────── */}
        <TabsContent value="workspaces" className="mt-4">
          {isError && (
            <div className="mb-4 flex items-center justify-between gap-4 rounded-lg border border-crimson/30 bg-crimson/5 px-4 py-3">
              <div className="flex items-center gap-2 text-[13px] text-foreground">
                <TriangleAlert className="size-4 text-crimson" />
                Não foi possível carregar os workspaces da API.
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Tentar de novo
              </Button>
            </div>
          )}
          {isEmpty && (
            <EmptyState
              icon={FolderKanban}
              title="Nenhum workspace ainda"
              description="Crie o primeiro workspace para agrupar projetos e equipe."
              action={
                <Button
                  size="sm"
                  className="bg-heat text-heat-foreground hover:bg-heat-hover"
                  onClick={() => setOpen(true)}
                >
                  <Plus data-icon="inline-start" />
                  Novo workspace
                </Button>
              }
            />
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading &&
              Array.from({ length: 2 }).map((_, i) => (
                <Card key={`sk-${i}`} className="h-[220px] gap-0">
                  <CardHeader>
                    <Skeleton className="size-9 rounded-md" />
                    <Skeleton className="mt-3 h-4 w-32" />
                    <Skeleton className="mt-2 h-3 w-full" />
                  </CardHeader>
                  <CardContent className="mt-auto pt-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="mt-4 h-8 w-full" />
                  </CardContent>
                </Card>
              ))}
            {!isLoading && items.map((ws, i) => (
              /* Sem hover-lift: card não é clicável (achado usability — evita
                 assinatura enganosa de "sou clicável"). */
              <Card key={ws.id} className="gap-0">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    {/* ToneAvatar unificando linguagem com /projects, tom por hash
                        do id — identidade, não índice (achado consistency). */}
                    {/* initials() canônico (@/lib/utils) — "Atendimento Clínico"
                        vira "AC", não "At" (consistente com /projects). */}
                    <ToneAvatar tone={toneFor(ws.id)} className="size-9 text-[13px]">
                      {initials(ws.name)}
                    </ToneAvatar>
                    {i === 0 && (
                      <Badge
                        variant="outline"
                        className="heat-tint border-transparent text-[11px] font-medium"
                      >
                        Em uso
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-3 text-base">{ws.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {ws.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="gap-1 border-border text-[11px] font-normal text-muted-foreground"
                    >
                      <FolderKanban className="size-3" />
                      {/* Mock traz a contagem; em modo API deriva da lista de projetos. */}
                      <span className="tabular">
                        {ws.projects ?? projCountByWs.get(ws.id) ?? 0}
                      </span>{" "}
                      {plural(ws.projects ?? projCountByWs.get(ws.id) ?? 0, "projeto")}
                    </Badge>
                    {/* Members só existe no mock — a API não expõe (gap no HANDOFF). */}
                    {ws.members != null && (
                      <Badge
                        variant="outline"
                        className="gap-1 border-border text-[11px] font-normal text-muted-foreground"
                      >
                        <Users className="size-3" />
                        <span className="tabular">{ws.members}</span>{" "}
                        {plural(ws.members, "membro")}
                      </Badge>
                    )}
                  </div>
                  {/* "Abrir" rebaixado a outline: fill Heat fica reservado ao
                      único CTA de página (achado hierarchy). */}
                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        toast.info(`Abrir ${ws.name}`, {
                          description: "Demo: disponível na versão integrada.",
                        })
                      }
                    >
                      Abrir
                      <ArrowUpRight data-icon="inline-end" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-muted-foreground"
                      onClick={() =>
                        toast.info(`Configurar ${ws.name}`, {
                          description: "Demo: disponível na versão integrada.",
                        })
                      }
                    >
                      Configurar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Projetos (DataTable: sort/busca/filtro/paginação) ───── */}
        <TabsContent value="projetos" className="mt-4">
          <DataTable
            columns={projectColumns}
            data={tableProjects}
            searchColumn="name"
            searchPlaceholder="Buscar projeto…"
            columnLabels={projectColumnLabels}
            emptyMessage="Nenhum projeto encontrado."
            filters={(table) => (
              <>
                <DataTableFacetedFilter
                  column={table.getColumn("workspace")}
                  title="Workspace"
                  options={items.map((w) => ({
                    label: w.name,
                    value: w.name,
                  }))}
                />
                <DataTableFacetedFilter
                  column={table.getColumn("status")}
                  title="Status"
                  options={[
                    { label: "Ativo", value: "Ativo" },
                    { label: "Rascunho", value: "Rascunho" },
                    { label: "Pausado", value: "Pausado" },
                  ]}
                />
              </>
            )}
          />
        </TabsContent>

        {/* ── Custos ─────────────────────────────────────────────── */}
        <TabsContent value="custos" className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Total de tokens", value: fmt(tokenUsage.total), hint: "plano Pro · mês" },
              { label: "Usados", value: fmt(tokenUsage.used), hint: "no ciclo atual" },
              { label: "Restantes", value: fmt(tokenUsage.remaining), hint: "até a renovação" },
              { label: "Uso", value: `${tokenUsage.percent.toLocaleString("pt-BR")}%`, hint: "do limite mensal", heat: true },
            ].map((m) => (
              <Card key={m.label} className="gap-0 py-4">
                <CardContent className="px-4">
                  <p className="text-[13px] text-muted-foreground">{m.label}</p>
                  <p
                    className={`mt-2 font-mono text-2xl font-semibold tracking-tight tabular ${
                      m.heat ? "text-heat" : ""
                    }`}
                  >
                    {m.value}
                  </p>
                  <p className="mt-2 text-[12px] text-muted-foreground">
                    {m.hint}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="size-4 text-muted-foreground" />
                <CardTitle className="text-base">Consumo do plano</CardTitle>
              </div>
              <span className="font-mono text-[13px] tabular text-muted-foreground">
                {fmt(tokenUsage.used)} / {fmt(tokenUsage.total)}
              </span>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={tokenUsage.percent} className="h-2" />
              <div className="flex justify-between font-mono text-[11px] tabular text-muted-foreground">
                <span>{tokenUsage.percent.toLocaleString("pt-BR")}% utilizado</span>
                <span>{fmt(tokenUsage.remaining)} restantes</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
