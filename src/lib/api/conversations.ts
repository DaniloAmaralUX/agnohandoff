"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
import { USE_MOCK } from "@/lib/config";
import { conversations as mockConversations } from "@/lib/data";
import { queryKeys } from "./query-keys";
import { conversationsResponseSchema, type ApiConversation } from "./schemas";
import { ApiError } from "./errors";

/* View normalizada. O backend não devolve o texto da última mensagem —
   o preview em modo API mostra a meta operacional (tokens · latência),
   que é o que o endpoint expõe (gap de campo anotado no HANDOFF). */
export type ConversationView = {
  id: string;
  contact: string;
  channel: string;
  agent: string;
  preview: string;
  time: string;
  status: "Resolvido" | "Ativo" | "Aguardando" | string;
  unread?: boolean;
  /** Presente só em modo API — permite carregar o histórico da sessão. */
  sessionId?: string;
};

const CHANNEL_PT: Record<string, string> = {
  whatsapp: "WhatsApp",
  widget: "Web Widget",
  api: "API",
  telegram: "Telegram",
};

const STATUS_PT: Record<string, string> = {
  completed: "Resolvido",
  error: "Erro",
};

/** "há 2 min", "há 3 h", "há 5 dias" — relativo a `now` (injetável p/ teste). */
export function timeAgo(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  const diffMin = Math.max(0, Math.round((now - t) / 60_000));
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `há ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  return `há ${diffD} ${diffD === 1 ? "dia" : "dias"}`;
}

export function mapApiConversation(c: ApiConversation, now = Date.now()): ConversationView {
  const channel = c.channel_type ?? "";
  const status = c.status ?? "";
  const meta = [
    c.tokens != null ? `${c.tokens} tokens` : null,
    c.latency_ms != null ? `${c.latency_ms} ms` : null,
  ].filter(Boolean);
  return {
    id: String(c.id),
    contact: c.user_external_id || "Anônimo",
    channel: CHANNEL_PT[channel] ?? channel,
    agent: c.agent_used ?? "—",
    preview: meta.length > 0 ? meta.join(" · ") : "Sem métricas registradas",
    time: timeAgo(c.created_at, now),
    status: STATUS_PT[status] ?? "Ativo",
    sessionId: c.session_id ?? undefined,
  };
}

export function useConversations(limit = 50, offset = 0) {
  return useQuery({
    queryKey: queryKeys.conversations.list(limit, offset),
    queryFn: async (): Promise<ConversationView[]> => {
      if (USE_MOCK) return mockConversations.map((c) => ({ ...c }));
      const { data, error } = await api.GET("/api/v1/conversations", {
        params: { query: { limit, offset } },
      });
      if (error) throw new ApiError(0, "Falha ao carregar as conversas.", error);
      const parsed = conversationsResponseSchema.safeParse(data);
      if (!parsed.success) {
        throw new ApiError(0, "Resposta de conversas em formato inesperado.", parsed.error);
      }
      const now = Date.now();
      return (parsed.data.conversations ?? []).map((c) => mapApiConversation(c, now));
    },
  });
}
