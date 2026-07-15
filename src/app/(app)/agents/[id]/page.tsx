import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Brain,
  Wrench,
  Radio,
  SlidersHorizontal,
} from "lucide-react";

import { agents, tools, channels } from "@/lib/data";
import { initials } from "@/lib/utils";
import {
  BuilderActions,
  BuilderFormSection,
  BuilderProvider,
  PreviewChat,
} from "./builder-bits";
import { StatusBadge, ToneAvatar } from "@/components/bits";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";

export function generateStaticParams() {
  return agents.map((a) => ({ id: a.id.slice(4) }));
}

const SYSTEM_PROMPT = `Você é a Sofia, assistente de triagem da clínica Vitalmed.

Objetivo: acolher o paciente, entender o motivo do contato e encaminhar (agendar consulta, tirar dúvida ou direcionar para emergência).

Tom: caloroso, claro e objetivo. Trate por "você". Nunca dê diagnóstico — colete sintomas e oriente.

Sempre confirme dados antes de agendar. Se houver sinais de urgência, oriente procurar o pronto-socorro imediatamente.`;

const MODELS = [
  "Claude Opus 4.8",
  "Claude Sonnet 4.6",
  "Claude Haiku 4.5",
];

export default async function AgentBuilder({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = agents.find((a) => a.id.slice(4) === id) ?? agents[0];

  return (
    <BuilderProvider>
    <div className="mx-auto w-full max-w-[1240px] px-4 py-5 sm:px-6">
      {/* ── Cabeçalho do builder ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
          >
            <Link href="/agents" aria-label="Voltar">
              <ArrowLeft className="size-4.5" />
            </Link>
          </Button>
          <ToneAvatar tone={agent.avatarTone} className="size-11 text-sm">
            {initials(agent.name)}
          </ToneAvatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">
                {agent.name}
              </h1>
              <StatusBadge status={agent.status} />
            </div>
            <p className="text-[13px] text-muted-foreground">{agent.role}</p>
          </div>
        </div>
        <BuilderActions agentName={agent.name} />
      </div>

      {/* ── Corpo: config + prévia ───────────────────────────────── */}
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_400px]">
        {/* Coluna de config — remontável: "Descartar" restaura os defaults */}
        <BuilderFormSection>
        <Tabs defaultValue="instrucoes" className="gap-4">
          <TabsList variant="line" className="w-full justify-start gap-4 border-b border-border">
            <TabsTrigger className="text-foreground/70" value="instrucoes">
              <Sparkles /> Instruções
            </TabsTrigger>
            <TabsTrigger className="text-foreground/70" value="modelo">
              <SlidersHorizontal /> Modelo
            </TabsTrigger>
            <TabsTrigger className="text-foreground/70" value="ferramentas">
              <Wrench /> Ferramentas
            </TabsTrigger>
            <TabsTrigger className="text-foreground/70" value="memoria">
              <Brain /> Memória
            </TabsTrigger>
            <TabsTrigger className="text-foreground/70" value="canais">
              <Radio /> Canais
            </TabsTrigger>
          </TabsList>

          {/* Instruções */}
          <TabsContent value="instrucoes">
            <Card>
              <CardContent className="pt-6">
                <FieldGroup>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="nome">Nome do agente</FieldLabel>
                      <Input id="nome" defaultValue={agent.name} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="papel">Papel</FieldLabel>
                      <Input id="papel" defaultValue={agent.role} />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="prompt">Instruções do sistema</FieldLabel>
                    <Textarea
                      id="prompt"
                      rows={12}
                      defaultValue={SYSTEM_PROMPT}
                      className="resize-none font-mono text-[13px] leading-relaxed"
                    />
                    <FieldDescription>
                      Define a personalidade, o objetivo e os limites do agente.
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Modelo */}
          <TabsContent value="modelo">
            <Card>
              <CardContent className="pt-6">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Modelo base</FieldLabel>
                    <Select defaultValue={agent.model}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {MODELS.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Opus para tarefas complexas, Haiku para velocidade e custo.
                    </FieldDescription>
                  </Field>

                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel>Temperatura</FieldLabel>
                      <span className="font-mono text-[13px] tabular text-muted-foreground">
                        0.7
                      </span>
                    </div>
                    <Slider defaultValue={[0.7]} min={0} max={1} step={0.1} />
                    <FieldDescription>
                      Mais baixo = respostas mais previsíveis. Mais alto = mais criativas.
                    </FieldDescription>
                  </Field>

                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel>Máximo de tokens por resposta</FieldLabel>
                      <span className="font-mono text-[13px] tabular text-muted-foreground">
                        1.024
                      </span>
                    </div>
                    <Slider defaultValue={[1024]} min={256} max={4096} step={128} />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ferramentas */}
          <TabsContent value="ferramentas">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-1">
                  {tools.map((t, i) => (
                    <div key={t.id}>
                      {i > 0 && <Separator className="my-1" />}
                      <div className="flex items-center gap-3 py-2">
                        <ToneAvatar
                          tone={t.status === "Ativo" ? "bluetron" : "graphite"}
                          className="size-9 text-[11px]"
                        >
                          <Wrench className="size-4" />
                        </ToneAvatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{t.name}</p>
                            <Badge
                              variant="outline"
                              className="border-border font-mono text-[10px] font-normal text-muted-foreground"
                            >
                              {t.kind}
                            </Badge>
                          </div>
                          <p className="truncate text-[12px] text-muted-foreground">
                            {t.description}
                          </p>
                        </div>
                        <Switch defaultChecked={t.status === "Ativo"} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Memória */}
          <TabsContent value="memoria">
            <Card>
              <CardContent className="pt-6">
                <FieldGroup>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 items-center justify-center rounded-md heat-tint">
                        <Brain className="size-4.5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Memória persistente</p>
                        <p className="text-[13px] text-muted-foreground">
                          O agente lembra do histórico de cada contato entre sessões e canais.
                        </p>
                      </div>
                    </div>
                    <Switch defaultChecked={agent.memory} />
                  </div>
                  <Field>
                    <FieldLabel>Retenção do histórico</FieldLabel>
                    <Select defaultValue="90">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="30">30 dias</SelectItem>
                          <SelectItem value="90">90 dias</SelectItem>
                          <SelectItem value="365">1 ano</SelectItem>
                          <SelectItem value="0">Indefinido</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Canais */}
          <TabsContent value="canais">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-1">
                  {channels.map((c, i) => (
                    <div key={c.id}>
                      {i > 0 && <Separator className="my-1" />}
                      <div className="flex items-center gap-3 py-2">
                        <div className="flex size-9 items-center justify-center rounded-md bg-secondary">
                          <Radio className="size-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{c.label}</p>
                          <p className="truncate font-mono text-[12px] text-muted-foreground">
                            {c.detail}
                          </p>
                        </div>
                        <StatusBadge status={c.status} />
                        <Switch defaultChecked={c.status === "Conectado"} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </BuilderFormSection>

        {/* Coluna de prévia ao vivo */}
        <div className="lg:sticky lg:top-[72px] lg:self-start">
          <Card className="gap-0 overflow-hidden py-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-forest opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-forest" />
                </span>
                <span className="text-[13px] font-medium">Prévia ao vivo</span>
              </div>
              <Badge
                variant="outline"
                className="border-border font-mono text-[10px] font-normal text-muted-foreground"
              >
                {agent.model}
              </Badge>
            </div>

            <PreviewChat />

            <div className="px-3 pb-3">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
              >
                <Link href="/playground">Abrir no Playground completo</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
    </BuilderProvider>
  );
}
