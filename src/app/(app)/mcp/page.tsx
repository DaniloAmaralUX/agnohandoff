"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { toast } from "sonner";
import {
  Plus,
  Server,
  Wrench,
  Info,
  FolderGit2,
  Settings2,
  RefreshCw,
} from "lucide-react";

import { PageHeader, PageShell } from "@/components/page-header";
import { StatusBadge, ToneAvatar } from "@/components/bits";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FormSheet } from "@/components/form-sheet";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mcpServers as seedServers, type McpServer } from "@/lib/data";

/* Auth em cor coerente com o risco — só um toque, sem competir com o Heat. */
function authTone(auth: McpServer["auth"]): string {
  if (auth === "none") return "text-crimson";
  return "text-muted-foreground";
}

/* Cor do contador de tools por status do servidor. */
function toolsTone(status: McpServer["status"]): string {
  if (status === "Conectado") return "text-forest-text";
  if (status === "Erro") return "text-crimson";
  return "text-muted-foreground";
}

const newServerSchema = z.object({
  name: z.string().min(2, "Dê um nome com ao menos 2 caracteres."),
  url: z.string().url("Informe uma URL válida (https://…)."),
  auth: z.enum(["none", "api_key", "bearer"]),
});
type NewServerForm = z.infer<typeof newServerSchema>;

export default function McpRegistryPage() {
  const [items, setItems] = useState<McpServer[]>(seedServers);
  const [open, setOpen] = useState(false);
  const form = useForm<NewServerForm>({
    resolver: standardSchemaResolver(newServerSchema),
    defaultValues: { name: "", url: "", auth: "none" },
  });

  const onSubmit = form.handleSubmit((values) => {
    setItems((prev) => [
      {
        id: `m_${Date.now()}`,
        name: values.name,
        url: values.url,
        auth: values.auth,
        status: "Conectado",
        tools: 0,
        project: "Sofia",
      },
      ...prev,
    ]);
    toast.success("Servidor registrado.", {
      description: "Demo: não persiste ao recarregar.",
    });
    form.reset();
    setOpen(false);
  });

  return (
    <PageShell>
      <PageHeader
        title="MCP Registry"
        subtitle="Conecte servidores MCP externos para ampliar as capacidades dos agentes."
      >
        <FormSheet
          open={open}
          onOpenChange={setOpen}
          trigger={
            <Button
              size="sm"
              className="bg-heat text-heat-foreground hover:bg-heat-hover"
            >
              <Plus data-icon="inline-start" />
              Registrar servidor
            </Button>
          }
          title="Registrar servidor MCP"
          description="Conecte um servidor externo para expor suas ferramentas aos agentes."
          submitLabel="Registrar servidor"
          submitting={form.formState.isSubmitting}
          onSubmit={onSubmit}
        >
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="mcp-name">Nome</FieldLabel>
            <Input
              id="mcp-name"
              placeholder="Ex.: CRM Vitalmed"
              aria-invalid={!!form.formState.errors.name}
              {...form.register("name")}
            />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.url}>
            <FieldLabel htmlFor="mcp-url">URL</FieldLabel>
            <Input
              id="mcp-url"
              placeholder="https://mcp.vitalmed.com.br/crm"
              aria-invalid={!!form.formState.errors.url}
              {...form.register("url")}
            />
            <FieldError errors={[form.formState.errors.url]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.auth}>
            <FieldLabel htmlFor="mcp-auth">Autenticação</FieldLabel>
            <Controller
              control={form.control}
              name="auth"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="mcp-auth" className="w-full">
                    <SelectValue placeholder="Escolha o tipo de auth" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    <SelectItem value="api_key">API Key</SelectItem>
                    <SelectItem value="bearer">Bearer</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[form.formState.errors.auth]} />
          </Field>
        </FormSheet>
      </PageHeader>

      {/* ── Card de contexto: o que é MCP ────────────────────────────── */}
      <Card className="mt-6 gap-0 py-0">
        <CardContent className="flex items-start gap-3 p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md heat-tint">
            <Info className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              O que é o Model Context Protocol
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              Servidores MCP expõem ferramentas, dados e ações de sistemas
              externos por um protocolo padrão. Ao registrar um servidor aqui,
              suas ferramentas ficam disponíveis para os agentes dos projetos
              vinculados — sem escrever integração manual.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Grid de servidores MCP ───────────────────────────────────── */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((s) => (
          <Card key={s.id} className="gap-0 py-0">
            <CardContent className="flex flex-col gap-4 p-4">
              <div className="flex items-start gap-3">
                <ToneAvatar tone="bluetron" className="size-10 shrink-0">
                  <Server className="size-5" />
                </ToneAvatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {s.name}
                    </p>
                    <Badge
                      variant="outline"
                      className={`border-border font-mono text-[10px] font-normal ${authTone(
                        s.auth,
                      )}`}
                    >
                      {s.auth}
                    </Badge>
                  </div>
                  <p className="mt-1.5 truncate font-mono text-[12px] text-muted-foreground">
                    {s.url}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-3">
                <StatusBadge status={s.status} />
                <span
                  className={`flex items-center gap-1.5 text-[12px] ${toolsTone(
                    s.status,
                  )}`}
                >
                  <Wrench className="size-3.5" />
                  <span className="tabular">{s.tools}</span> ferramentas
                </span>
                <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  <FolderGit2 className="size-3.5" />
                  {s.project}
                </span>
                {/* Rodapé padronizado com Tools: sempre uma ação; em Erro,
                    caminho de recuperação explícito ("Reconectar"). */}
                <div className="ml-auto flex items-center gap-1">
                  {s.status === "Erro" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-crimson hover:text-crimson"
                      onClick={() =>
                        toast.success(`Tentando reconectar ${s.name}…`)
                      }
                    >
                      <RefreshCw data-icon="inline-start" />
                      Reconectar
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() =>
                        toast.success(`Detalhes de ${s.name} em breve.`)
                      }
                    >
                      <Settings2 data-icon="inline-start" />
                      Detalhes
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
