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
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Circle, TriangleAlert } from "lucide-react";
import { type Channel } from "@/lib/data";
import { USE_MOCK } from "@/lib/config";
import { useChannels, useCreateChannel } from "@/lib/api/channels";
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from "@/lib/api/api-keys";
import { useProjects } from "@/lib/api/projects";
import { Skeleton } from "@/components/ui/skeleton";
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

const typeIcon: Record<string, React.ElementType> = {
  WhatsApp: MessageCircle,
  "Web Widget": Globe,
  Telegram: Send,
  Instagram: Camera,
  API: Zap,
};

const typeTone: Record<string, string> = {
  WhatsApp: "bg-forest/12 text-forest-text",
  "Web Widget": "bg-bluetron/12 text-bluetron-text",
  Telegram: "bg-amethyst/12 text-amethyst-text",
  Instagram: "bg-honey/15 text-honey-text",
  API: "bg-graphite/10 text-foreground",
};

// Rótulo amigável para cada tipo no Select — "Web Widget" é o webhook/site próprio.
// Instagram existe só na demo: o backend fala whatsapp|widget|api|telegram
// (gap anotado no HANDOFF); em modo API a opção honesta é "API REST".
const CHANNEL_TYPES: { value: Channel["type"] | "API"; label: string }[] = USE_MOCK
  ? [
      { value: "WhatsApp", label: "WhatsApp" },
      { value: "Instagram", label: "Instagram" },
      { value: "Web Widget", label: "Web Widget (webhook/site)" },
      { value: "Telegram", label: "Telegram" },
    ]
  : [
      { value: "WhatsApp", label: "WhatsApp" },
      { value: "Web Widget", label: "Web Widget (webhook/site)" },
      { value: "Telegram", label: "Telegram" },
      { value: "API", label: "API REST" },
    ];

const newChannelSchema = z.object({
  label: z.string().min(2, "Dê um nome com ao menos 2 caracteres."),
  type: z.enum(["WhatsApp", "Web Widget", "Telegram", "Instagram", "API"], {
    message: "Escolha um tipo de canal.",
  }),
  project: z.string().min(1, "Escolha um projeto."),
  detail: z.string().optional(),
});
type NewChannelForm = z.infer<typeof newChannelSchema>;

export default function ChannelsPage() {
  const { data, isLoading, isError, refetch } = useChannels();
  const createChannel = useCreateChannel();
  const { data: projData } = useProjects();
  const { data: keys } = useApiKeys();
  const createKey = useCreateApiKey();
  const revokeKey = useRevokeApiKey();

  const items = data ?? [];
  const projectOptions = projData ?? [];
  const currentKey = (keys ?? []).find((k) => k.active) ?? (keys ?? [])[0];

  // "fullKey" = a chave real (retornada UMA vez pela API); depois só o
  // preview mascarado permanece — a íntegra é irrecuperável, como um bom
  // segredo deve ser. Na demo, começa visível para contar essa história.
  const [fullKey, setFullKey] = useState<string | null>(
    USE_MOCK ? "pk_demo_DEMO_NOT_A_SECRET_0000000000000000" : null,
  );
  // Preview da chave recém-gerada (sobrepõe a da lista até o refetch).
  const [newPreview, setNewPreview] = useState<string | null>(null);
  const maskedKey = newPreview ?? currentKey?.preview ?? "—";
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  // Confirmação para regenerar a chave — ação destrutiva (revoga a atual).
  const [confirmRegen, setConfirmRegen] = useState(false);

  const form = useForm<NewChannelForm>({
    resolver: standardSchemaResolver(newChannelSchema),
    defaultValues: {
      label: "",
      type: "WhatsApp",
      project: "",
      detail: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    createChannel.mutate(values);
    form.reset();
    setOpen(false);
  });

  function handleCopy() {
    // Copia a íntegra se ela ainda estiver visível; senão, a mascarada mesmo
    // (nada útil, mas evita erro silencioso).
    navigator.clipboard
      ?.writeText(fullKey ?? maskedKey)
      .catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function dismissReveal() {
    setFullKey(null); // some pra sempre — não é possível re-exibir
  }

  function handleGenerateKey() {
    // "Regenerar" = criar nova + revogar a anterior (o backend não tem PATCH).
    const prevId = USE_MOCK ? undefined : currentKey?.id;
    createKey.mutate(
      { name: "Painel" },
      {
        onSuccess: (k) => {
          setFullKey(k.raw);
          setNewPreview(k.preview);
          setCopied(false);
          toast.success("Nova chave gerada.", {
            description: "Copie agora — a íntegra some quando você fechar.",
            action: {
              label: "Copiar",
              onClick: () => {
                navigator.clipboard?.writeText(k.raw).catch(() => {});
              },
            },
          });
          if (prevId) revokeKey.mutate({ id: prevId });
        },
      },
    );
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
          submitting={createChannel.isPending}
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
                    {projectOptions.map((p) => (
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

      {/* ── Erro ─────────────────────────────────────────────────── */}
      {isError && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-crimson/30 bg-crimson/5 px-4 py-3">
          <div className="flex items-center gap-2 text-[13px] text-foreground">
            <TriangleAlert className="size-4 text-crimson" />
            Não foi possível carregar os canais da API.
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar de novo
          </Button>
        </div>
      )}

      {/* ── Grid de canais ───────────────────────────────────────── */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {isLoading &&
          Array.from({ length: 2 }).map((_, i) => (
            <Card key={`sk-${i}`} className="gap-0 py-0">
              <CardContent className="flex flex-col gap-4 p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="size-10 rounded-md" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="mt-2 h-3 w-24" />
                    <Skeleton className="mt-2 h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        {!isLoading && items.map((c) => {
          const Icon = typeIcon[c.type] ?? Globe;
          const connected = c.status === "Conectado";
          const disconnected = c.status === "Desconectado";
          const pending = c.status === "Pendente";
          return (
            <Card key={c.id} className="gap-0 py-0">
              <CardContent className="flex flex-col gap-4 p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-md ${typeTone[c.type] ?? "bg-muted text-muted-foreground"}`}
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
                        className="gap-1 border-border text-[11px] font-normal"
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
                  {/* Estado de erro precisa nomear a saída — não basta
                      "Configurar" genérico. Reconectar (Desconectado) e
                      Concluir configuração (Pendente) viram a ação primária. */}
                  {disconnected && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() =>
                        toast.success(`Reconectando ${c.label}…`, {
                          description: "Você será redirecionado para autorizar novamente.",
                        })
                      }
                    >
                      <RefreshCw data-icon="inline-start" />
                      Reconectar
                    </Button>
                  )}
                  {pending && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() =>
                        toast.info(`Concluindo configuração de ${c.label}…`, {
                          description: "Finalize as credenciais para conectar.",
                        })
                      }
                    >
                      <Settings2 data-icon="inline-start" />
                      Concluir configuração
                    </Button>
                  )}
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

        {/* ── Card fantasma: adicionar canal (#126) — mesmo padrão de /projects,
            leva ao FormSheet existente. */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-[168px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/40 px-4 py-6 text-center outline-none transition-colors hover:border-heat/50 hover:bg-accent focus-visible:ring-2 focus-visible:ring-heat/40"
        >
          <div className="flex size-11 items-center justify-center rounded-md heat-tint">
            <Plus className="size-5" />
          </div>
          <p className="text-sm font-medium">Adicionar canal</p>
          <p className="text-pretty text-[13px] text-muted-foreground">
            Conecte WhatsApp, Telegram, Instagram ou seu site.
          </p>
        </button>
      </div>

      {/* ── Chaves de API ────────────────────────────────────────── */}
      {/* mt-6 (espaçamento de seção) — gap-3 fica reservado para itens do grid. */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="size-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">Chaves de API</CardTitle>
              <CardDescription className="mt-0.5">
                Use na API REST e nos webhooks para integrar canais próprios.
              </CardDescription>
            </div>
          </div>
          {/* CardAction ativa grid-cols-[1fr_auto] — o botão volta compacto ao topo direito. */}
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmRegen(true)}
            >
              <RefreshCw data-icon="inline-start" />
              Gerar nova key
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {fullKey && (
            <div className="mb-2 flex flex-col gap-2 rounded-md border border-heat/40 bg-heat/5 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Badge className="border-none bg-primary text-primary-foreground text-[11px] font-normal">
                  Íntegra — só agora
                </Badge>
                <code className="truncate font-mono text-[13px] tabular text-foreground">
                  {fullKey}
                </code>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
                  {copied ? "Copiada" : "Copiar íntegra"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissReveal}
                  className="h-8 shrink-0 text-muted-foreground"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Badge
                variant="outline"
                className="gap-1 border-border text-[11px] font-normal"
              >
                <Circle className="size-2 fill-current text-forest-text" />
                Ativa
              </Badge>
              <code className="truncate font-mono text-[13px] tabular text-foreground">
                {maskedKey}
              </code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 shrink-0 text-muted-foreground"
              disabled={!fullKey}
              title={fullKey ? "Copiar íntegra" : "A íntegra desta chave já foi ocultada"}
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

      {/* Confirmação destrutiva — regenerar revoga a chave atual imediatamente.
          Usamos Dialog (o kit não tem AlertDialog); o botão de confirmação usa
          o tom crimson para nomear o risco. */}
      <Dialog open={confirmRegen} onOpenChange={setConfirmRegen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gerar nova chave?</DialogTitle>
            <DialogDescription>
              A chave atual deixará de funcionar imediatamente. Integrações que
              a usam vão parar até você atualizá-las com a nova chave.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              size="sm"
              className="bg-crimson text-white hover:bg-crimson/90"
              onClick={() => {
                handleGenerateKey();
                setConfirmRegen(false);
              }}
            >
              Gerar nova chave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
