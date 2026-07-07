"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { Plus, FolderKanban, Bot, Radio, TriangleAlert } from "lucide-react";

import { PageHeader, PageShell } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, ToneAvatar, EmptyState } from "@/components/bits";
import { FormSheet } from "@/components/form-sheet";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjects, useCreateProject } from "@/lib/api/projects";
import { workspaces } from "@/lib/data";
import { initials } from "@/lib/utils";

/* Tom do avatar por projeto — mantém cada card com cor própria (design system). */
const tones = ["heat", "bluetron", "forest", "amethyst", "honey"] as const;

const newProjectSchema = z.object({
  name: z.string().min(2, "Dê um nome com ao menos 2 caracteres."),
  description: z.string().max(160, "Máximo de 160 caracteres.").optional(),
  workspace: z.string().min(1, "Escolha um workspace."),
});
type NewProjectForm = z.infer<typeof newProjectSchema>;

/* Pluralização pt-BR — corrige "1 agentes / 1 canais" (achado consistency). */
function plural(n: number, singular: string, plural = `${singular}s`) {
  return n === 1 ? singular : plural;
}

export default function ProjectsPage() {
  const { data, isLoading, isError, refetch } = useProjects();
  const createProject = useCreateProject();
  const items = data ?? [];
  const isEmpty = !isLoading && !isError && items.length === 0;

  const [open, setOpen] = useState(false);
  const form = useForm<NewProjectForm>({
    resolver: standardSchemaResolver(newProjectSchema),
    defaultValues: { name: "", description: "", workspace: workspaces[0]?.name ?? "" },
  });
  const onSubmit = form.handleSubmit((values) => {
    createProject.mutate(values);
    form.reset();
    setOpen(false);
  });

  return (
    <PageShell>
      <PageHeader
        title="Projetos"
        subtitle="Crie e gerencie os projetos da sua organização."
      >
        <FormSheet
          open={open}
          onOpenChange={setOpen}
          trigger={
            <Button size="sm" className="bg-heat text-heat-foreground hover:bg-heat-hover">
              <Plus data-icon="inline-start" />
              Novo projeto
            </Button>
          }
          title="Novo projeto"
          description="Agrupe agentes e canais em um novo projeto."
          submitLabel="Criar projeto"
          submitting={createProject.isPending}
          onSubmit={onSubmit}
        >
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="pj-name">Nome</FieldLabel>
            <Input
              id="pj-name"
              placeholder="Ex.: Recepção 24h"
              aria-invalid={!!form.formState.errors.name}
              {...form.register("name")}
            />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.workspace}>
            <FieldLabel htmlFor="pj-ws">Workspace</FieldLabel>
            <Controller
              control={form.control}
              name="workspace"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="pj-ws" className="w-full">
                    <SelectValue placeholder="Escolha um workspace" />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaces.map((w) => (
                      <SelectItem key={w.id} value={w.name}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[form.formState.errors.workspace]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="pj-desc">Descrição (opcional)</FieldLabel>
            <Textarea
              id="pj-desc"
              rows={3}
              placeholder="O que este projeto faz?"
              {...form.register("description")}
            />
            <FieldError errors={[form.formState.errors.description]} />
          </Field>
        </FormSheet>
      </PageHeader>

      {/* ── Erro ─────────────────────────────────────────────────── */}
      {isError && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-crimson/30 bg-crimson/5 px-4 py-3">
          <div className="flex items-center gap-2 text-[13px] text-foreground">
            <TriangleAlert className="size-4 text-crimson" />
            Não foi possível carregar os projetos da API.
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar de novo
          </Button>
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* ── Loading (skeletons) ────────────────────────────────── */}
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={`sk-${i}`} className="h-[188px] gap-0 py-0">
              <CardHeader className="flex-row items-start justify-between px-4 pt-4">
                <Skeleton className="size-11 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </CardHeader>
              <CardContent className="px-4 pt-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-3 w-full" />
                <Skeleton className="mt-1.5 h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}

        {/* ── Dados ──────────────────────────────────────────────── */}
        {!isLoading &&
          items.map((p, i) => (
            <Link
              key={p.id}
              href="/agents"
              className="group/link rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-heat/40"
            >
              <Card className="h-full gap-0 py-0 transition-[transform,border-color,box-shadow] duration-150 ease-enter group-hover/link:-translate-y-0.5 group-hover/link:border-heat/40 group-hover/link:shadow-sm">
                <CardHeader className="flex-row items-start justify-between gap-2 px-4 pt-4">
                  <ToneAvatar tone={tones[i % tones.length]} className="size-11 text-sm">
                    {initials(p.name)}
                  </ToneAvatar>
                  <StatusBadge status={p.status} className="shrink-0" />
                </CardHeader>

                <CardContent className="px-4 pb-4 pt-3">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted-foreground">
                    {p.description || "Sem descrição"}
                  </p>
                </CardContent>

                <CardFooter className="mt-auto justify-between gap-2 border-t px-4 py-3">
                  <span className="inline-flex min-w-0 items-center gap-1.5 text-[12px] text-muted-foreground">
                    <FolderKanban className="size-3.5 shrink-0" />
                    <span className="truncate">{p.workspace}</span>
                  </span>
                  {p.agents !== undefined && (
                    <div className="flex shrink-0 items-center gap-3 text-[12px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Bot className="size-3.5" />
                        <span className="tabular">{p.agents}</span>{" "}
                        {plural(p.agents ?? 0, "agente")}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Radio className="size-3.5" />
                        <span className="tabular">{p.channels}</span>{" "}
                        {plural(p.channels ?? 0, "canal", "canais")}
                      </span>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </Link>
          ))}

        {/* ── Vazio ──────────────────────────────────────────────── */}
        {isEmpty && (
          <EmptyState
            icon={FolderKanban}
            title="Nenhum projeto ainda"
            description="Crie seu primeiro projeto para organizar agentes e canais."
            action={
              <Button
                size="sm"
                className="bg-heat text-heat-foreground hover:bg-heat-hover"
                onClick={() => setOpen(true)}
              >
                <Plus data-icon="inline-start" />
                Novo projeto
              </Button>
            }
          />
        )}

        {/* ── Card fantasma: novo projeto ────────────────────────── */}
        {!isLoading && !isError && !isEmpty && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex min-h-[168px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/40 px-4 py-6 text-center transition-colors hover:border-heat/50 hover:bg-accent"
          >
            <div className="flex size-11 items-center justify-center rounded-md heat-tint">
              <Plus className="size-5" />
            </div>
            <p className="text-sm font-medium">Novo projeto</p>
            <p className="text-[13px] text-muted-foreground">
              Organize agentes e canais em um novo projeto.
            </p>
          </button>
        )}
      </div>
    </PageShell>
  );
}
