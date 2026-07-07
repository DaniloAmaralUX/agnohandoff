"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { toast } from "sonner";
import {
  Plus,
  MessageCircle,
  Globe,
  Send,
  Camera,
  Settings2,
  Zap,
  Copy,
  Check,
  RefreshCw,
  KeyRound,
} from "lucide-react";

import { PageHeader, PageShell } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Circle } from "lucide-react";
import { channels as seedChannels, projects, type Channel } from "@/lib/data";
import { statusDot } from "@/lib/constants";
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

const typeIcon: Record<Channel["type"], React.ElementType> = {
  WhatsApp: MessageCircle,
  "Web Widget": Globe,
  Telegram: Send,
  Instagram: Camera,
};

const typeTone: Record<Channel["type"], string> = {
  WhatsApp: "bg-forest/12 text-forest-text",
  "Web Widget": "bg-bluetron/12 text-bluetron-text",
  Telegram: "bg-amethyst/12 text-amethyst-text",
  Instagram: "bg-honey/15 text-honey-text",
};

// Rótulo amigável para cada tipo no Select — "Web Widget" é o webhook/site próprio.
const CHANNEL_TYPES: { value: Channel["type"]; label: string }[] = [
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "Instagram", label: "Instagram" },
  { value: "Web Widget", label: "Web Widget (webhook/site)" },
  { value: "Telegram", label: "Telegram" },
];

const newChannelSchema = z.object({
  label: z.string().min(2, "Dê um nome com ao menos 2 caracteres."),
  type: z.enum(["WhatsApp", "Web Widget", "Telegram", "Instagram"], {
    message: "Escolha um tipo de canal.",
  }),
  project: z.string().min(1, "Escolha um projeto."),
  detail: z.string().optional(),
});
type NewChannelForm = z.infer<typeof newChannelSchema>;

export default function ChannelsPage() {
  const [items, setItems] = useState<Channel[]>(seedChannels);
  const [apiKey, setApiKey] = useState("sk_live_a1b2c3d4e5f6···9f0e");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<NewChannelForm>({
    resolver: standardSchemaResolver(newChannelSchema),
    defaultValues: {
      label: "",
      type: "WhatsApp",
      project: projects[0]?.name ?? "",
      detail: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setItems((prev) => [
      {
        id: `ch_${Date.now()}`,
        type: values.type,
        label: values.label,
        project: values.project,
        status: "Pendente",
        detail: values.detail?.trim() || "Aguardando configuração",
      },
      ...prev,
    ]);
    toast.success("Canal adicionado.", {
      description: "Conclua a configuração para conectá-lo.",
    });
    form.reset();
    setOpen(false);
  });

  function handleCopy() {
    navigator.clipboard?.writeText(apiKey).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function handleGenerateKey() {
    const rand = Math.random().toString(36).slice(2, 14);
    setApiKey(`sk_live_${rand}···${rand.slice(0, 4)}`);
    setCopied(false);
    toast.success("Nova chave gerada.", {
      description: "Copie agora — ela só é exibida na íntegra neste momento.",
    });
  }

  return (
    <PageShell>
      <PageHeader
        title="Canais"
        subtitle="Conecte WhatsApp, site e redes sociais para seus agentes atenderem onde os pacientes estão."
      >
        <FormSheet
          open={open}
          onOpenChange={setOpen}
          trigger={
            <Button size="sm" className="bg-heat text-heat-foreground hover:bg-heat-hover">
              <Plus data-icon="inline-start" />
              Adicionar canal
            </Button>
          }
          title="Adicionar canal"
          description="Conecte um novo canal de atendimento a um projeto."
          submitLabel="Adicionar canal"
          submitting={form.formState.isSubmitting}
          onSubmit={onSubmit}
        >
          <Field data-invalid={!!form.formState.errors.label}>
            <FieldLabel htmlFor="ch-label">Nome</FieldLabel>
            <Input
              id="ch-label"
              placeholder="Ex.: WhatsApp Business"
              aria-invalid={!!form.formState.errors.label}
              {...form.register("label")}
            />
            <FieldError errors={[form.formState.errors.label]} />
          </Field>

          <Field data-invalid={!!form.formState.errors.type}>
            <FieldLabel htmlFor="ch-type">Tipo</FieldLabel>
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="ch-type" className="w-full">
                    <SelectValue placeholder="Escolha o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNEL_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[form.formState.errors.type]} />
          </Field>

          <Field data-invalid={!!form.formState.errors.project}>
            <FieldLabel htmlFor="ch-project">Projeto</FieldLabel>
            <Controller
              control={form.control}
              name="project"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="ch-project" className="w-full">
                    <SelectValue placeholder="Escolha um projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[form.formState.errors.project]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="ch-detail">Webhook URL (opcional)</FieldLabel>
            <Input
              id="ch-detail"
              placeholder="https://exemplo.com/webhook"
              {...form.register("detail")}
            />
            <FieldError errors={[form.formState.errors.detail]} />
          </Field>
        </FormSheet>
      </PageHeader>

      {/* ── Grid de canais ───────────────────────────────────────── */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {items.map((c) => {
          const Icon = typeIcon[c.type];
          const connected = c.status === "Conectado";
          return (
            <Card key={c.id} className="gap-0 py-0">
              <CardContent className="flex flex-col gap-4 p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-md ${typeTone[c.type]}`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {c.label}
                      </p>
                      <Badge
                        variant="outline"
                        className="gap-1 border-border text-[10px] font-normal"
                      >
                        <Circle className={`size-2 fill-current ${statusDot(c.status)}`} />
                        {c.status}
                      </Badge>
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                      {c.type} · {c.project}
                    </p>
                    <p className="mt-1.5 truncate font-mono text-[12px] tabular text-muted-foreground">
                      {c.detail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-border pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-muted-foreground"
                    onClick={() =>
                      toast.info(`Abrindo configuração de ${c.label}…`, {
                        description: "Ajuste credenciais, gatilhos e roteamento.",
                      })
                    }
                  >
                    <Settings2 data-icon="inline-start" />
                    Configurar
                  </Button>
                  {connected && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-muted-foreground"
                      onClick={() =>
                        toast.success("Teste enviado ao canal.", {
                          description: `Mensagem de verificação disparada para ${c.label}.`,
                        })
                      }
                    >
                      <Zap data-icon="inline-start" />
                      Testar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Chaves de API ────────────────────────────────────────── */}
      <Card className="mt-3">
        <CardHeader className="flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="size-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">Chaves de API</CardTitle>
              <CardDescription className="mt-0.5">
                Use na API REST e nos webhooks para integrar canais próprios.
              </CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleGenerateKey}>
            <RefreshCw data-icon="inline-start" />
            Gerar nova key
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Badge
                variant="outline"
                className="gap-1 border-border text-[10px] font-normal"
              >
                <Circle className="size-2 fill-current text-forest-text" />
                Ativa
              </Badge>
              <code className="truncate font-mono text-[13px] tabular text-foreground">
                {apiKey}
              </code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 shrink-0 text-muted-foreground"
            >
              {copied ? (
                <Check data-icon="inline-start" className="text-forest-text" />
              ) : (
                <Copy data-icon="inline-start" />
              )}
              {copied ? "Copiada" : "Copiar"}
            </Button>
          </div>
          <p className="mt-2 text-[12px] text-muted-foreground">
            Trate esta chave como uma senha — ela concede acesso total ao workspace
            <span className="font-mono"> Vitalmed</span>. Não a exponha em código
            público. A key só é exibida na íntegra no momento da criação.
          </p>
        </CardContent>
      </Card>
    </PageShell>
  );
}
