"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Paperclip,
  Mic,
  Wrench,
  Bot,
  ChevronDown,
  ImageIcon,
  AudioLines,
  Sparkles,
  Circle,
  RotateCcw,
} from "lucide-react";

import { PageHeader, PageShell } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { playgroundThread } from "@/lib/data";
import { USE_MOCK } from "@/lib/config";
import { useChatSession } from "@/lib/api/chat";
import { useAgents } from "@/lib/api/agents";
import { useActiveProject } from "@/lib/project-context";
import { initials } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";

const fmt = (n: number) => n.toLocaleString("pt-BR");

export default function PlaygroundPage() {
  const [input, setInput] = useState("");
  const [agentName, setAgentName] = useState<string | null>(null);
  const [model, setModel] = useState("opus");
  const [temperature, setTemperature] = useState(0.7);
  const [memory, setMemory] = useState(true);
  const [tools, setTools] = useState(true);

  // Agentes reais do projeto ativo (mock na demo) + sessão de chat com
  // streaming token a token (SSE em modo API; simulado na demo).
  const { data: agentsData } = useAgents();
  const { project } = useActiveProject();
  const chat = useChatSession();
  const agentsList = agentsData ?? [];
  const activeAgent =
    agentsList.find((a) => a.name === agentName) ??
    agentsList[0] ?? { name: "Agente", role: "" };

  // Demo: a transcrição-exemplo abre a conversa; o que você envia continua dela.
  const thread = [...(USE_MOCK ? playgroundThread : []), ...chat.messages];

  // Auto-scroll: o token mais novo nasce visível (respeita reduced-motion).
  const threadEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    threadEndRef.current?.scrollIntoView({
      block: "end",
      behavior: reduce ? "auto" : "smooth",
    });
  }, [thread.length, chat.isStreaming]);

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chat.isStreaming) return;
    void chat.send(input);
    setInput("");
  };

  return (
    <PageShell>
      <PageHeader
        title="Playground"
        subtitle="Converse com seus agentes e ajuste os parâmetros antes de publicar."
      >
        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground"
          onClick={() => chat.reset()}
        >
          <RotateCcw data-icon="inline-start" />
          Limpar sessão
        </Button>
      </PageHeader>

      <Tabs defaultValue="chat" className="mt-6">
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="imagem">Imagem</TabsTrigger>
          <TabsTrigger value="voz">Voz</TabsTrigger>
        </TabsList>

        {/* ── Aba Chat ──────────────────────────────────────────────── */}
        <TabsContent value="chat" className="mt-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            {/* Coluna esquerda: conversa */}
            <Card className="flex min-h-[560px] flex-1 flex-col gap-0 overflow-hidden py-0">
              {/* Header do chat */}
              <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-2 h-9 gap-2 px-2"
                    >
                      <span className="flex size-7 items-center justify-center rounded-md bg-heat/12 text-[12px] font-semibold text-heat-text">
                        {initials(activeAgent.name)}
                      </span>
                      <span className="flex flex-col items-start leading-tight">
                        <span className="text-sm font-medium">
                          {activeAgent.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {activeAgent.role}
                        </span>
                      </span>
                      <ChevronDown className="size-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Trocar de agente</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {agentsList.map((a) => (
                      <DropdownMenuItem
                        key={a.id}
                        onClick={() => setAgentName(a.name)}
                        className="flex-col items-start gap-0.5"
                      >
                        <span className="text-sm font-medium">{a.name}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {a.role}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Badge
                  variant="outline"
                  className="gap-1 border-border text-[11px] font-normal"
                >
                  <Bot className="size-3 text-muted-foreground" />
                  Projeto {project?.name ?? "—"}
                </Badge>
              </div>

              {/* Mensagens */}
              <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
                {thread.map((msg, i) =>
                  msg.role === "user" ? (
                    <div key={i} className="flex justify-end">
                      <div className="max-w-[78%] space-y-1">
                        <div className="rounded-lg rounded-br-sm bg-secondary px-3.5 py-2.5 text-sm text-secondary-foreground">
                          {msg.text}
                        </div>
                        {msg.time && (
                          <p className="pr-1 text-right font-mono text-[11px] text-muted-foreground">
                            {msg.time}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex items-start gap-2.5">
                      <Avatar className="mt-0.5 size-7 shrink-0">
                        <AvatarFallback className="bg-heat/12 text-[11px] font-semibold text-heat-text">
                          {initials(activeAgent.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="max-w-[78%] space-y-1.5">
                        {msg.tool && (
                          /* text-heat-text é o token laranja calibrado para
                             texto pequeno (AA >=4.5:1); heat vivo falha aqui. */
                          <span className="heat-tint inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium text-heat-text">
                            <Wrench className="size-3" />
                            {msg.tool}
                          </span>
                        )}
                        <div className="rounded-lg rounded-tl-sm border border-border bg-card px-3.5 py-2.5 text-sm text-foreground">
                          {msg.text}
                        </div>
                        {msg.time && (
                          <p className="pl-1 font-mono text-[11px] text-muted-foreground">
                            {msg.time}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )}
                {/* Cursor de streaming: a resposta está nascendo. */}
                {chat.isStreaming && (
                  <div className="flex items-center gap-2 pl-9 font-mono text-[11px] text-muted-foreground">
                    <span className="inline-block size-1.5 animate-pulse rounded-full bg-heat" />
                    {activeAgent.name} está respondendo…
                  </div>
                )}
                {chat.error && (
                  <div className="flex items-center gap-2 rounded-md border border-crimson/30 bg-crimson/5 px-3 py-2 text-[13px]">
                    <TriangleAlert className="size-4 shrink-0 text-crimson" />
                    {chat.error}
                  </div>
                )}
                <div ref={threadEndRef} />
              </div>

              {/* Composer */}
              <div className="border-t border-border p-3">
                <form onSubmit={onSend} className="flex items-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0 text-muted-foreground"
                  >
                    <Paperclip className="size-4" />
                    <span className="sr-only">Anexar arquivo</span>
                  </Button>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Digite sua mensagem…"
                    className="h-9 flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0 text-muted-foreground"
                  >
                    <Mic className="size-4" />
                    <span className="sr-only">Gravar áudio</span>
                  </Button>
                  <Button
                    type="submit"
                    size="icon"
                    disabled={chat.isStreaming || input.trim() === ""}
                    className="size-9 shrink-0 bg-heat text-heat-foreground hover:bg-heat-hover"
                  >
                    <ArrowUp className="size-4" />
                    <span className="sr-only">Enviar</span>
                  </Button>
                </form>
                <p className="mt-2 px-1 text-[11px] text-muted-foreground">
                  As respostas são geradas por IA e podem conter imprecisões.
                </p>
              </div>
            </Card>

            {/* Coluna direita: configuração + debug */}
            <div className="w-full space-y-3 lg:w-[320px] lg:shrink-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Configuração</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Modelo */}
                  <div className="space-y-1.5">
                    <Label className="text-[13px] text-muted-foreground">
                      Modelo
                    </Label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="opus">
                          <span className="font-mono">Claude Opus 4.8</span>
                        </SelectItem>
                        <SelectItem value="sonnet">
                          <span className="font-mono">Claude Sonnet 4.6</span>
                        </SelectItem>
                        <SelectItem value="haiku">
                          <span className="font-mono">Claude Haiku 4.5</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Temperatura */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[13px] text-muted-foreground">
                        Temperatura
                      </Label>
                      <span className="font-mono text-[13px] tabular text-foreground">
                        {temperature.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-heat"
                    />
                    <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
                      <span>Preciso</span>
                      <span>Criativo</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Session ID */}
                  <div className="space-y-1.5">
                    <Label className="text-[13px] text-muted-foreground">
                      Session ID
                    </Label>
                    <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-2.5 py-1.5">
                      <span className="truncate font-mono text-[12px] text-foreground">
                        {chat.sessionId || "—"}
                      </span>
                      <Circle className="size-2 shrink-0 fill-current text-forest-text" />
                    </div>
                  </div>

                  {/* Switches */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">Memória</p>
                        <p className="text-[11px] text-muted-foreground">
                          Lembra do histórico do contato
                        </p>
                      </div>
                      <Switch checked={memory} onCheckedChange={setMemory} />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">Ferramentas</p>
                        <p className="text-[11px] text-muted-foreground">
                          Permite chamar CRM e Agenda
                        </p>
                      </div>
                      <Switch checked={tools} onCheckedChange={setTools} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Debug</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {/* Valores reais da última troca — "—" antes da primeira. */}
                  {[
                    { label: "Tokens (entrada)", value: chat.debug?.inputTokens },
                    { label: "Tokens (saída)", value: chat.debug?.outputTokens },
                    {
                      label: "Latência",
                      value: chat.debug?.latencyMs,
                      suffix: " ms",
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between text-[13px]"
                    >
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-mono tabular text-foreground">
                        {row.value != null ? `${fmt(row.value)}${row.suffix ?? ""}` : "—"}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-muted-foreground">Status</span>
                    <Badge
                      variant="outline"
                      className="gap-1 border-border text-[11px] font-normal"
                    >
                      <Circle
                        className={`size-2 fill-current ${
                          chat.debug == null
                            ? "text-muted-foreground"
                            : chat.debug.ok
                              ? "text-forest-text"
                              : "text-crimson"
                        }`}
                      />
                      {chat.debug == null
                        ? "Aguardando"
                        : chat.debug.ok
                          ? "OK · 200"
                          : "Erro"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Aba Imagem ────────────────────────────────────────────── */}
        <TabsContent value="imagem" className="mt-4">
          <ComingSoon
            icon={<ImageIcon className="size-6 text-muted-foreground" />}
            title="Geração de imagem"
            description="Gere e edite imagens diretamente no playground."
          />
        </TabsContent>

        {/* ── Aba Voz ───────────────────────────────────────────────── */}
        <TabsContent value="voz" className="mt-4">
          <ComingSoon
            icon={<AudioLines className="size-6 text-muted-foreground" />}
            title="Conversa por voz"
            description="Teste seus agentes com entrada e saída de áudio."
          />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}

function ComingSoon({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="min-h-[480px]">
      <CardContent className="flex h-full min-h-[440px] flex-col items-center justify-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-xl border border-border bg-muted/40">
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-base font-medium">{title}</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <Badge
          variant="outline"
          className="mt-1 gap-1 border-border text-[11px] font-normal"
        >
          <Sparkles className="size-3 text-heat" />
          Em breve no protótipo
        </Badge>
      </CardContent>
    </Card>
  );
}
