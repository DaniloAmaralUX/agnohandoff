"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { toast } from "sonner";
import {
  Plus,
  Circle,
  FolderKanban,
  Users,
  Bot,
  Radio,
  ArrowUpRight,
  Coins,
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
import {
  workspaces as seedWorkspaces,
  projects,
  type Workspace,
  type Project,
} from "@/lib/data";
import { FormSheet } from "@/components/form-sheet";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Consumo de tokens do plano Pro — dado local no tom Vitalmed (mock de apresentação).
const tokenUsage = {
  total: 2_000_000,
  used: 152_000,
  remaining: 1_848_000,
  percent: 7.6,
};

const fmt = (n: number) => n.toLocaleString("pt-BR");

const newWorkspaceSchema = z.object({
  name: z.string().min(2, "Dê um nome com ao menos 2 caracteres."),
  description: z.string().max(140, "Máximo de 140 caracteres.").optional(),
});
type NewWorkspaceForm = z.infer<typeof newWorkspaceSchema>;

function projectStatusDot(status: string) {
  if (status === "Ativo") return "text-forest-text";
  if (status === "Pausado") return "text-honey-text";
  return "text-muted-foreground"; // Rascunho
}

/* Colunas da tabela de projetos (DataTable — sort/busca/filtro/paginação). */
const projectColumns: ColumnDef<Project>[] = [
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
        <span className="font-mono tabular">{row.original.agents}</span>
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
        <span className="font-mono tabular">{row.original.channels}</span>
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
            className={`size-2 fill-current ${projectStatusDot(row.original.status)}`}
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
  const [items, setItems] = useState<Workspace[]>(seedWorkspaces);
  const [open, setOpen] = useState(false);
  const form = useForm<NewWorkspaceForm>({
    resolver: standardSchemaResolver(newWorkspaceSchema),
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    setItems((prev) => [
      {
        id: `ws_${Date.now()}`,
        name: values.name,
        description: values.description ?? "",
        projects: 0,
        members: 1,
      },
      ...prev,
    ]);
    toast.success("Workspace criado.", {
      description: "Adicione projetos e convide sua equipe.",
    });
    form.reset();
    setOpen(false);
  });

  return (
    <PageShell>
      <PageHeader
        title="Workspaces"
        subtitle="Organize projetos, equipes e o consumo da sua clínica em um só lugar."
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
          submitting={form.formState.isSubmitting}
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
            <FieldLabel htmlFor="ws-desc">Descrição</FieldLabel>
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
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
          <TabsTrigger value="projetos">Projetos</TabsTrigger>
          <TabsTrigger value="custos">Custos</TabsTrigger>
        </TabsList>

        {/* ── Workspaces ─────────────────────────────────────────── */}
        <TabsContent value="workspaces" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((ws, i) => (
              <Card
                key={ws.id}
                className="gap-0 transition-[transform,border-color,box-shadow] duration-150 ease-enter hover:-translate-y-0.5 hover:border-heat/40 hover:shadow-sm"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex size-9 items-center justify-center rounded-md bg-secondary text-[13px] font-semibold text-secondary-foreground">
                      {ws.name.slice(0, 2).toUpperCase()}
                    </div>
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
                      <span className="tabular">{ws.projects}</span> projetos
                    </Badge>
                    <Badge
                      variant="outline"
                      className="gap-1 border-border text-[11px] font-normal text-muted-foreground"
                    >
                      <Users className="size-3" />
                      <span className="tabular">{ws.members}</span> membros
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Button size="sm" className="flex-1">
                      Abrir
                      <ArrowUpRight data-icon="inline-end" />
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
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
            data={projects}
            searchColumn="name"
            searchPlaceholder="Buscar projeto…"
            columnLabels={projectColumnLabels}
            emptyMessage="Nenhum projeto encontrado."
            filters={(table) => (
              <>
                <DataTableFacetedFilter
                  column={table.getColumn("workspace")}
                  title="Workspace"
                  options={seedWorkspaces.map((w) => ({
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
