"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  Circle,
  Send,
  UserPlus,
  Check,
  Wrench,
  MessageCircle,
  Globe,
  Camera,
  ArrowLeft,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader, PageShell } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  conversations as seedConversations,
  playgroundThread,
  type Conversation,
  type ChatMessage,
} from "@/lib/data";
import { cn } from "@/lib/utils";
import { statusDot } from "@/lib/constants";
import { EmptyState } from "@/components/bits";

const channelIcon: Record<Conversation["channel"], typeof MessageCircle> = {
  WhatsApp: MessageCircle,
  "Web Widget": Globe,
  Telegram: Send,
  Instagram: Camera,
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

type Filtro = "todas" | "ativas" | "resolvidas";

export default function ConversationsPage() {
  const [items, setItems] = useState<Conversation[]>(seedConversations);
  const [selectedId, setSelectedId] = useState(seedConversations[0].id);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");
  // Conversas assumidas por um humano — habilitam o composer para responder.
  const [assumidas, setAssumidas] = useState<Set<string>>(new Set());
  // Mensagens enviadas manualmente, por conversa (mock: só nesta sessão).
  const [respostas, setRespostas] = useState<Record<string, ChatMessage[]>>({});
  const [rascunho, setRascunho] = useState("");
  // Master-detail responsivo: em telas <lg mostramos ou a lista ou o thread.
  // Ao tocar numa conversa no mobile, alternamos para o thread; um botão
  // "Voltar" leva de volta à lista.
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");
  // Auto-scroll: mensagem mais recente deve nascer visível.
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  // Deep-linking: o filtro vive na URL (?filtro=), bookmarkável e compartilhável.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("filtro");
    if (p === "ativas" || p === "resolvidas") setFiltro(p);
  }, []);
  const changeFiltro = (f: Filtro) => {
    setFiltro(f);
    const params = new URLSearchParams(window.location.search);
    if (f === "todas") params.delete("filtro");
    else params.set("filtro", f);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  };

  const filtradas = items.filter((c) => {
    const matchBusca =
      busca.trim() === "" ||
      c.contact.toLowerCase().includes(busca.toLowerCase()) ||
      c.preview.toLowerCase().includes(busca.toLowerCase());
    const matchFiltro =
      filtro === "todas" ||
      (filtro === "ativas" && c.status !== "Resolvido") ||
      (filtro === "resolvidas" && c.status === "Resolvido");
    return matchBusca && matchFiltro;
  });

  const selected = items.find((c) => c.id === selectedId) ?? items[0];
  const ChannelIcon = channelIcon[selected.channel];
  const assumida = assumidas.has(selected.id);
  const resolvida = selected.status === "Resolvido";

  // Muda o status da conversa selecionada no estado local.
  const setStatus = (status: Conversation["status"]) =>
    setItems((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, status } : c))
    );

  const assumir = () => {
    setStatus("Ativo");
    setAssumidas((prev) => new Set(prev).add(selected.id));
    toast.success("Você assumiu a conversa.", {
      description: "O agente foi pausado — agora você responde.",
    });
  };

  const resolver = () => {
    setStatus("Resolvido");
    toast.success("Conversa marcada como resolvida.");
  };

  const enviar = () => {
    const texto = rascunho.trim();
    if (!texto) return;
    const now = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setRespostas((prev) => ({
      ...prev,
      [selected.id]: [
        ...(prev[selected.id] ?? []),
        { role: "user", text: texto, time: now },
      ],
    }));
    setRascunho("");
  };

  // Thread exibido = transcrição de exemplo + respostas manuais desta conversa.
  const thread: ChatMessage[] = [
    ...playgroundThread,
    ...(respostas[selected.id] ?? []),
  ];

  // Rola até o fim ao selecionar conversa ou receber/enviar mensagem — respeita
  // prefers-reduced-motion (behavior 'auto' evita animação para quem pediu).
  useEffect(() => {
    const reduce = typeof window !== "undefined"
      && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    threadEndRef.current?.scrollIntoView({
      block: "end",
      behavior: reduce ? "auto" : "smooth",
    });
  }, [selectedId, thread.length]);

  return (
    <PageShell>
      <PageHeader
        title="Conversas"
        subtitle="Caixa de entrada unificada de todos os canais da Vitalmed."
      />

      {/*
        Master-detail responsivo:
        - lg+: duas colunas visíveis (lista + thread).
        - <lg: renderiza só uma coluna por vez conforme mobileView.
      */}
      <div className="mt-6 grid gap-3 lg:grid-cols-[380px_1fr]">
        {/* ── Lista ─────────────────────────────────────────────── */}
        <Card
          className={cn(
            "flex h-[calc(100vh-13rem)] flex-col gap-0 overflow-hidden py-0",
            mobileView === "thread" && "hidden lg:flex",
          )}
        >
          <div className="space-y-3 border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar contato ou mensagem…"
                className="pl-8"
              />
            </div>
            <Tabs
              value={filtro}
              onValueChange={(v) => changeFiltro(v as Filtro)}
            >
              <TabsList className="w-full">
                <TabsTrigger value="todas">Todas</TabsTrigger>
                <TabsTrigger value="ativas">Ativas</TabsTrigger>
                <TabsTrigger value="resolvidas">Resolvidas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {filtradas.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="Nenhuma conversa encontrada"
                description={
                  busca.trim()
                    ? `Nada corresponde a “${busca}”.`
                    : "Ajuste os filtros para ver mais itens."
                }
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBusca("");
                      changeFiltro("todas");
                    }}
                  >
                    {busca.trim() ? "Limpar busca" : "Ver todas"}
                  </Button>
                }
                className="min-h-0 border-0 bg-transparent px-4 py-8"
              />
            ) : (
              filtradas.map((c) => {
                const CIcon = channelIcon[c.channel];
                const ativa = c.id === selectedId;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedId(c.id);
                      // No mobile, tocar num item revela o thread em tela cheia.
                      setMobileView("thread");
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 border-b border-border px-3 py-2.5 text-left transition-colors hover:bg-accent",
                      ativa && "bg-accent"
                    )}
                  >
                    <Avatar className="size-8 shrink-0">
                      <AvatarFallback className="bg-secondary text-[11px] font-medium text-secondary-foreground">
                        {initials(c.contact)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-medium">
                          {c.contact}
                        </p>
                        <CIcon className="size-3 shrink-0 text-muted-foreground" />
                        <span className="ml-auto whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                          {c.time}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <p className="truncate text-[12px] text-muted-foreground">
                          {c.preview}
                        </p>
                        {c.unread && (
                          <span
                            className="ml-auto flex size-1.5 shrink-0 items-center justify-center rounded-full bg-heat"
                            role="status"
                          >
                            <span className="sr-only">Não lida</span>
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5">
                        <Badge
                          variant="outline"
                          className="gap-1 border-border text-[11px] font-normal"
                        >
                          <Circle
                            className={cn(
                              "size-2 fill-current",
                              statusDot(c.status)
                            )}
                          />
                          {c.status}
                        </Badge>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        {/* ── Transcrição ───────────────────────────────────────── */}
        <Card
          className={cn(
            "flex h-[calc(100vh-13rem)] flex-col gap-0 overflow-hidden py-0",
            mobileView === "list" && "hidden lg:flex",
          )}
        >
          {/* Header da conversa */}
          <div className="flex items-center justify-between gap-3 border-b border-border p-3">
            <div className="flex min-w-0 items-center gap-3">
              {/* Voltar para a lista (só visível em telas <lg). */}
              <Button
                variant="ghost"
                size="icon"
                aria-label="Voltar para a lista"
                onClick={() => setMobileView("list")}
                className="-ml-1 size-9 shrink-0 lg:hidden"
              >
                <ArrowLeft className="size-4" />
              </Button>
              <Avatar className="size-9 shrink-0">
                <AvatarFallback className="bg-secondary text-[12px] font-medium text-secondary-foreground">
                  {initials(selected.contact)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {selected.contact}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ChannelIcon className="size-3" />
                    {selected.channel}
                  </span>
                  <span className="hidden text-border sm:inline">·</span>
                  {/* Meta do agente é útil mas secundário — esconde no mobile
                      para que o header não esmague as ações principais. */}
                  <span className="hidden sm:inline">
                    Agente <span className="font-medium text-foreground">{selected.agent}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {/* "Atribuir" é ação com escopo de conversa — vive aqui, junto de
                  Assumir/Resolver, não no header da página (que tem escopo global).
                  Em telas estreitas fica escondido para dar espaço às ações principais. */}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.success("Conversa atribuída a você.", {
                    description: `${selected.contact} agora aparece na sua fila.`,
                  })
                }
                className="hidden sm:inline-flex"
              >
                <UserPlus data-icon="inline-start" />
                Atribuir
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={assumir}
                disabled={assumida || resolvida}
              >
                <UserPlus data-icon="inline-start" />
                {assumida ? "Assumida" : "Assumir"}
              </Button>
              {resolvida ? (
                /* Confirmação legível em vez de disabled+opacity: dot forest
                   + rótulo em foreground. Leitura clara para vidente e AT. */
                <Badge
                  variant="outline"
                  className="gap-1.5 h-8 border-border px-2.5 text-[12px] font-normal text-foreground"
                >
                  <Circle className="size-2 fill-current text-forest-text" />
                  Resolvida
                </Badge>
              ) : (
                <Button
                  size="sm"
                  onClick={resolver}
                  className="bg-heat text-heat-foreground hover:bg-heat-hover"
                >
                  <Check data-icon="inline-start" />
                  Resolver
                </Button>
              )}
            </div>
          </div>

          {/* Corpo — bolhas */}
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            <div className="flex justify-center">
              <span className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                Hoje
              </span>
            </div>
            {thread.map((m, i) => {
              // Convenção de inbox de atendimento:
              //  - contato (user) à ESQUERDA em bolha neutra;
              //  - lado Vitalmed (agent/operador) à DIREITA em bolha da marca.
              const isContact = m.role === "user";
              return (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col gap-1",
                    isContact ? "items-start" : "items-end"
                  )}
                >
                  {m.tool && (
                    /* 11px + text-heat-text (heat vivo em texto pequeno não
                       passa AA; --heat-text é o token dedicado). */
                    <span className="inline-flex items-center gap-1 rounded-md heat-tint px-1.5 py-0.5 font-mono text-[11px] text-heat-text">
                      <Wrench className="size-2.5" />
                      {m.tool}
                    </span>
                  )}
                  <div
                    className={cn(
                      // Distinção por LADO, não por massa de cor: contato à
                      // esquerda (card com borda), Vitalmed à direita (secondary
                      // neutro). Evita blocos grandes de fill laranja no corpo
                      // do chat (regressão pega na review; admin = contido).
                      "max-w-[78%] rounded-lg px-3 py-2 text-[13px] leading-relaxed",
                      isContact
                        ? "border border-border bg-card text-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {m.text}
                  </div>
                  {m.time && (
                    <span className="px-1 font-mono text-[11px] text-muted-foreground">
                      {m.time}
                    </span>
                  )}
                </div>
              );
            })}
            {/* Âncora de auto-scroll: nasce visível a última mensagem. */}
            <div ref={threadEndRef} />
          </div>

          {/* Rodapé — composer */}
          <div className="border-t border-border p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                enviar();
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={rascunho}
                onChange={(e) => setRascunho(e.target.value)}
                disabled={!assumida}
                placeholder={
                  assumida
                    ? "Responder…"
                    : "Responder… (assuma a conversa para digitar)"
                }
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Enviar resposta"
                disabled={!assumida || rascunho.trim() === ""}
                className="size-9 bg-heat text-heat-foreground hover:bg-heat-hover"
              >
                <Send className="size-4" />
              </Button>
            </form>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {assumida ? (
                <span>
                  Você assumiu esta conversa — o agente{" "}
                  <span className="font-medium text-foreground">
                    {selected.agent}
                  </span>{" "}
                  está pausado.
                </span>
              ) : (
                <span>
                  O agente{" "}
                  <span className="font-medium text-foreground">
                    {selected.agent}
                  </span>{" "}
                  está respondendo automaticamente.
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
