"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
import { USE_MOCK } from "@/lib/config";
import { queryKeys } from "./query-keys";
import { chatHistoryResponseSchema } from "./schemas";
import { ApiError } from "./errors";
import type { ChatMessage } from "@/lib/data";

/* Histórico de sessão (Redis no backend). O shape das mensagens não é
   contratado no OpenAPI — mapeamos defensivamente: role user fica à esquerda,
   qualquer outro (assistant/agent) vira "agent". */
export function mapHistoryMessage(m: unknown): ChatMessage | null {
  if (typeof m !== "object" || m === null) return null;
  const rec = m as Record<string, unknown>;
  const text =
    (typeof rec.content === "string" && rec.content) ||
    (typeof rec.text === "string" && rec.text) ||
    "";
  if (!text) return null;
  return {
    role: rec.role === "user" ? "user" : "agent",
    text,
  };
}

export function useChatHistory(sessionId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.chat.history(sessionId ?? "none"),
    enabled: !USE_MOCK && Boolean(sessionId),
    queryFn: async (): Promise<ChatMessage[]> => {
      const { data, error } = await api.GET("/api/v1/chat/history", {
        params: { query: { session_id: sessionId as string } },
      });
      if (error) throw new ApiError(0, "Falha ao carregar o histórico.", error);
      const parsed = chatHistoryResponseSchema.safeParse(data);
      if (!parsed.success) {
        throw new ApiError(0, "Histórico em formato inesperado.", parsed.error);
      }
      return (parsed.data.messages ?? [])
        .map(mapHistoryMessage)
        .filter((m): m is ChatMessage => m !== null);
    },
  });
}
