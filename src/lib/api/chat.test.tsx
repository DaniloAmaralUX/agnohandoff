import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

const { postMock, flags } = vi.hoisted(() => ({
  postMock: vi.fn(),
  flags: { useMock: true },
}));
vi.mock("./client", () => ({ api: { GET: vi.fn(), POST: postMock } }));
vi.mock("@/lib/config", () => ({
  get USE_MOCK() {
    return flags.useMock;
  },
  get USE_API() {
    return !flags.useMock;
  },
  API_URL: "http://api.test",
}));
vi.mock("@/lib/auth", () => ({ getApiKey: () => "proj_test" }));

import { extractSseEvents, useChatSession } from "./chat";
import { ApiError } from "./errors";

describe("extractSseEvents", () => {
  it("separa eventos completos e devolve o resto do buffer", () => {
    const { events, rest } = extractSseEvents(
      'data: {"type":"token","content":"Oi"}\n\ndata: {"type":"token","content":" tudo"}\n\ndata: {"type":',
    );
    expect(events).toEqual(['{"type":"token","content":"Oi"}', '{"type":"token","content":" tudo"}']);
    expect(rest).toBe('data: {"type":');
  });

  it("reconhece o marcador [DONE] e ignora linhas não-data", () => {
    const { events } = extractSseEvents("event: x\ndata: [DONE]\n\n");
    expect(events).toEqual(["[DONE]"]);
  });

  it("buffer sem evento completo fica inteiro no rest", () => {
    const { events, rest } = extractSseEvents("data: {parcial");
    expect(events).toEqual([]);
    expect(rest).toBe("data: {parcial");
  });
});

function streamOf(chunks: string[]): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const ch of chunks) controller.enqueue(enc.encode(ch));
      controller.close();
    },
  });
}

describe("useChatSession — modo demo", () => {
  beforeEach(() => {
    flags.useMock = true;
  });
  afterEach(() => vi.clearAllMocks());

  it("simula streaming: user entra na hora, agent nasce por partes", async () => {
    const { result } = renderHook(() => useChatSession());
    act(() => {
      void result.current.send("Oi, preciso remarcar.");
    });
    expect(result.current.messages[0]).toMatchObject({ role: "user" });
    expect(result.current.isStreaming).toBe(true);
    await waitFor(() => expect(result.current.isStreaming).toBe(false), {
      timeout: 3000,
    });
    const agentMsg = result.current.messages.at(-1);
    expect(agentMsg?.role).toBe("agent");
    expect(agentMsg?.text).toContain("Dra. Helena");
    expect(result.current.debug?.ok).toBe(true);
  });

  it("reset limpa mensagens e troca o session id", async () => {
    const { result } = renderHook(() => useChatSession());
    const firstSession = result.current.sessionId;
    act(() => {
      void result.current.send("oi");
    });
    await waitFor(() => expect(result.current.isStreaming).toBe(false), {
      timeout: 3000,
    });
    act(() => result.current.reset());
    expect(result.current.messages).toEqual([]);
    expect(result.current.sessionId).not.toBe(firstSession);
    expect(result.current.debug).toBeNull();
  });
});

describe("useChatSession — modo API", () => {
  beforeEach(() => {
    flags.useMock = false;
    postMock.mockReset();
    vi.unstubAllGlobals();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("consome o SSE token a token, mesmo fragmentado entre chunks", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      body: streamOf([
        'data: {"type":"token","content":"Olá"}\n\ndata: {"type":"tok',
        'en","content":", tudo bem?"}\n\n',
        'data: {"type":"done","job_id":"j1","session_id":"sess_srv"}\n\ndata: [DONE]\n\n',
      ]),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useChatSession());
    await act(async () => {
      await result.current.send("oi");
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/api/v1/chat/message/stream",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-API-Key": "proj_test" }),
      }),
    );
    const agentMsg = result.current.messages.at(-1);
    expect(agentMsg).toEqual({ role: "agent", text: "Olá, tudo bem?" });
    expect(result.current.sessionId).toBe("sess_srv");
    expect(result.current.debug?.ok).toBe(true);
  });

  it("stream indisponível cai no POST /chat/message (fallback)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503, body: null }));
    postMock.mockResolvedValue({
      data: {
        job_id: "j1",
        session_id: "sess_fb",
        response: "Resposta completa.",
        input_tokens: 12,
        output_tokens: 34,
        processing_time_ms: 900,
        success: true,
      },
      error: undefined,
    });

    const { result } = renderHook(() => useChatSession());
    await act(async () => {
      await result.current.send("oi");
    });
    expect(result.current.messages.at(-1)).toEqual({
      role: "agent",
      text: "Resposta completa.",
    });
    expect(result.current.debug).toMatchObject({
      inputTokens: 12,
      outputTokens: 34,
      latencyMs: 900,
      ok: true,
    });
    expect(result.current.sessionId).toBe("sess_fb");
  });

  it("stream e fallback falhando vira erro legível no estado", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("net down")));
    postMock.mockResolvedValue({ data: undefined, error: { detail: "boom" } });

    const { result } = renderHook(() => useChatSession());
    await act(async () => {
      await result.current.send("oi");
    });
    expect(result.current.error).toBeTruthy();
    expect(result.current.debug?.ok).toBe(false);
    expect(result.current.messages).toHaveLength(1); // só a mensagem do usuário
  });

  it("payload inesperado no fallback também vira erro", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new ApiError(0, "sem stream")));
    postMock.mockResolvedValue({ data: { response: 42 }, error: undefined });

    const { result } = renderHook(() => useChatSession());
    await act(async () => {
      await result.current.send("oi");
    });
    expect(result.current.error).toBeTruthy();
    expect(result.current.debug?.ok).toBe(false);
  });
});
