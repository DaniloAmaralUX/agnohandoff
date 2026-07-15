"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
import { API_URL, USE_MOCK } from "@/lib/config";
import { getApiKey } from "@/lib/auth";
import { queryKeys } from "./query-keys";
import {
  chatHistoryResponseSchema,
  chatMessageResponseSchema,
  chatStreamEventSchema,
} from "./schemas";
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

/* ── Streaming SSE ─────────────────────────────────────────────────────────
   POST /chat/message/stream responde text/event-stream:
     data: {"type":"token","content":"…"}\n\n
     data: {"type":"done","job_id":"…","session_id":"…"}\n\n
     data: [DONE]\n\n
   EventSource não serve (é GET) — lemos o body com ReadableStream. */

/** Separa eventos SSE completos do resto do buffer (chunks chegam fragmentados). */
export function extractSseEvents(buffer: string): { events: string[]; rest: string } {
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";
  const events = parts
    .map((block) =>
      block
        .split("\n")
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.slice(5).trim())
        .join("\n"),
    )
    .filter((e) => e.length > 0);
  return { events, rest };
}

export type ChatDebug = {
  inputTokens?: number;
  outputTokens?: number;
  latencyMs?: number;
  ok: boolean;
};

const MOCK_REPLY =
  "Claro! Encontrei sua consulta com a Dra. Helena amanhã às 10h. " +
  "Para qual data você gostaria de remarcar?";

function newSessionId() {
  return `sess_${Math.random().toString(36).slice(2, 12)}`;
}

/* Estado de uma sessão de chat do Playground: mensagens, streaming token a
   token, painel de debug e ciclo de vida (reset/abort). Modo demo simula o
   streaming com a mesma mecânica de UI. */
export function useChatSession() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [debug, setDebug] = React.useState<ChatDebug | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  // Gerado pós-mount: Math.random() no inicializador rodaria também no SSR e
  // divergiria do cliente (hydration mismatch).
  const [sessionId, setSessionId] = React.useState<string>("");
  React.useEffect(() => {
    setSessionId((prev) => prev || newSessionId());
  }, []);
  const abortRef = React.useRef<AbortController | null>(null);
  const mockTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const appendAgentText = React.useCallback((delta: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "agent") {
        return [...prev.slice(0, -1), { ...last, text: last.text + delta }];
      }
      return [...prev, { role: "agent", text: delta }];
    });
  }, []);

  const stop = React.useCallback(() => {
    abortRef.current?.abort();
    if (mockTimerRef.current) clearInterval(mockTimerRef.current);
    setIsStreaming(false);
  }, []);

  const reset = React.useCallback(() => {
    stop();
    setMessages([]);
    setDebug(null);
    setError(null);
    setSessionId(newSessionId());
  }, [stop]);

  const send = React.useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || isStreaming) return;
      setError(null);
      const time = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setMessages((prev) => [...prev, { role: "user", text: message, time }]);
      setIsStreaming(true);
      const startedAt = Date.now();

      if (USE_MOCK) {
        // Demo: revela a resposta canônica palavra a palavra.
        const words = MOCK_REPLY.split(" ");
        let i = 0;
        mockTimerRef.current = setInterval(() => {
          appendAgentText((i === 0 ? "" : " ") + words[i]);
          i += 1;
          if (i >= words.length) {
            if (mockTimerRef.current) clearInterval(mockTimerRef.current);
            setDebug({
              inputTokens: message.length,
              outputTokens: MOCK_REPLY.length,
              latencyMs: Date.now() - startedAt,
              ok: true,
            });
            setIsStreaming(false);
          }
        }, 24);
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      let outputTokens = 0;
      try {
        const res = await fetch(`${API_URL}/api/v1/chat/message/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": getApiKey(),
          },
          body: JSON.stringify({ message, session_id: sessionId, channel: "api" }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          throw new ApiError(res.status, `Streaming indisponível (${res.status}).`);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const { events, rest } = extractSseEvents(buffer);
          buffer = rest;
          for (const raw of events) {
            if (raw === "[DONE]") continue;
            let parsedEvent: unknown;
            try {
              parsedEvent = JSON.parse(raw);
            } catch {
              continue; // evento malformado não derruba o stream
            }
            const ev = chatStreamEventSchema.safeParse(parsedEvent);
            if (!ev.success) continue;
            if (ev.data.type === "token" && ev.data.content) {
              outputTokens += 1;
              appendAgentText(ev.data.content);
            }
            if (ev.data.type === "done" && ev.data.session_id) {
              setSessionId(ev.data.session_id);
            }
          }
        }
        setDebug({
          outputTokens: outputTokens || undefined,
          latencyMs: Date.now() - startedAt,
          ok: true,
        });
      } catch (err) {
        if (controller.signal.aborted) return; // parado pelo usuário — sem erro
        // Fallback: resposta completa via POST /chat/message (sem streaming).
        try {
          const { data, error: postErr } = await api.POST("/api/v1/chat/message", {
            body: { message, session_id: sessionId, channel: "api" },
          });
          if (postErr) throw new ApiError(0, "Falha ao enviar a mensagem.", postErr);
          const parsed = chatMessageResponseSchema.safeParse(data);
          if (!parsed.success) {
            throw new ApiError(0, "Resposta de chat em formato inesperado.", parsed.error);
          }
          appendAgentText(parsed.data.response ?? "");
          if (parsed.data.session_id) setSessionId(parsed.data.session_id);
          setDebug({
            inputTokens: parsed.data.input_tokens ?? undefined,
            outputTokens: parsed.data.output_tokens ?? undefined,
            latencyMs: parsed.data.processing_time_ms ?? Date.now() - startedAt,
            ok: true,
          });
        } catch (fallbackErr) {
          setDebug({ latencyMs: Date.now() - startedAt, ok: false });
          setError(
            fallbackErr instanceof ApiError
              ? fallbackErr.message
              : "Não foi possível falar com o agente.",
          );
          void err; // o erro original do stream já foi superado pelo fallback
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [appendAgentText, isStreaming, sessionId],
  );

  return { messages, send, stop, reset, isStreaming, debug, error, sessionId };
}
