import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

const { getMock, flags } = vi.hoisted(() => ({
  getMock: vi.fn(),
  flags: { useMock: true },
}));
vi.mock("./client", () => ({ api: { GET: getMock } }));
vi.mock("@/lib/config", () => ({
  get USE_MOCK() {
    return flags.useMock;
  },
  get USE_API() {
    return !flags.useMock;
  },
  API_URL: "",
}));

import { useConversations, mapApiConversation, timeAgo } from "./conversations";
import { mapHistoryMessage, useChatHistory } from "./chat";
import { ApiError } from "./errors";

function wrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

describe("timeAgo", () => {
  const now = Date.parse("2026-07-07T12:00:00Z");

  it("formata minutos, horas e dias em pt-BR", () => {
    expect(timeAgo("2026-07-07T11:58:00Z", now)).toBe("há 2 min");
    expect(timeAgo("2026-07-07T09:00:00Z", now)).toBe("há 3 h");
    expect(timeAgo("2026-07-02T12:00:00Z", now)).toBe("há 5 dias");
    expect(timeAgo("2026-07-06T12:00:00Z", now)).toBe("há 1 dia");
    expect(timeAgo("2026-07-07T11:59:40Z", now)).toBe("agora");
  });

  it("é resiliente a datas ausentes ou inválidas", () => {
    expect(timeAgo(null, now)).toBe("—");
    expect(timeAgo("not-a-date", now)).toBe("—");
  });
});

describe("mapApiConversation", () => {
  const now = Date.parse("2026-07-07T12:00:00Z");

  it("mapeia campos do backend para a view da caixa de entrada", () => {
    const view = mapApiConversation(
      {
        id: "c1",
        session_id: "sess_1",
        user_external_id: "+55 11 98765-4321",
        channel_type: "whatsapp",
        tokens: 320,
        agent_used: "Sofia",
        latency_ms: 900,
        status: "completed",
        created_at: "2026-07-07T11:50:00Z",
      },
      now,
    );
    expect(view).toMatchObject({
      id: "c1",
      contact: "+55 11 98765-4321",
      channel: "WhatsApp",
      agent: "Sofia",
      preview: "320 tokens · 900 ms",
      time: "há 10 min",
      status: "Resolvido",
      sessionId: "sess_1",
    });
  });

  it("status desconhecido vira Ativo; error vira Erro; sem métricas tem fallback", () => {
    expect(mapApiConversation({ id: 1, status: "error" }, now).status).toBe("Erro");
    const v = mapApiConversation({ id: 2 }, now);
    expect(v.status).toBe("Ativo");
    expect(v.contact).toBe("Anônimo");
    expect(v.preview).toBe("Sem métricas registradas");
  });
});

describe("useConversations", () => {
  beforeEach(() => {
    getMock.mockReset();
    flags.useMock = true;
  });
  afterEach(() => vi.clearAllMocks());

  it("modo mock: retorna conversas do seed sem chamar a API", async () => {
    const { result } = renderHook(() => useConversations(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
    expect(getMock).not.toHaveBeenCalled();
  });

  it("modo API: passa limit/offset e valida com Zod", async () => {
    flags.useMock = false;
    getMock.mockResolvedValue({
      data: { conversations: [{ id: "c1", channel_type: "widget", status: "completed" }], total: 1 },
      error: undefined,
    });
    const { result } = renderHook(() => useConversations(20, 0), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getMock).toHaveBeenCalledWith(
      "/api/v1/conversations",
      expect.objectContaining({ params: { query: { limit: 20, offset: 0 } } }),
    );
    expect(result.current.data?.[0]?.channel).toBe("Web Widget");
  });

  it("modo API: payload inválido lança ApiError", async () => {
    flags.useMock = false;
    getMock.mockResolvedValue({ data: { conversations: [{ tokens: "x" }] }, error: undefined });
    const { result } = renderHook(() => useConversations(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
  });
});

describe("mapHistoryMessage", () => {
  it("aceita content ou text; role != user vira agent", () => {
    expect(mapHistoryMessage({ role: "user", content: "oi" })).toEqual({ role: "user", text: "oi" });
    expect(mapHistoryMessage({ role: "assistant", text: "olá" })).toEqual({ role: "agent", text: "olá" });
  });

  it("descarta entradas sem texto ou não-objeto", () => {
    expect(mapHistoryMessage({ role: "user" })).toBeNull();
    expect(mapHistoryMessage("str")).toBeNull();
    expect(mapHistoryMessage(null)).toBeNull();
  });
});

describe("useChatHistory", () => {
  beforeEach(() => {
    getMock.mockReset();
    flags.useMock = false;
  });
  afterEach(() => vi.clearAllMocks());

  it("busca e mapeia mensagens da sessão, filtrando lixo", async () => {
    getMock.mockResolvedValue({
      data: {
        session_id: "sess_1",
        messages: [{ role: "user", content: "oi" }, { junk: true }, { role: "assistant", content: "olá!" }],
        total_messages: 3,
      },
      error: undefined,
    });
    const { result } = renderHook(() => useChatHistory("sess_1"), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([
      { role: "user", text: "oi" },
      { role: "agent", text: "olá!" },
    ]);
  });

  it("fica desabilitado sem sessionId (e em modo mock)", () => {
    const { result } = renderHook(() => useChatHistory(undefined), { wrapper: wrapper() });
    expect(result.current.fetchStatus).toBe("idle");
    expect(getMock).not.toHaveBeenCalled();
  });
});
