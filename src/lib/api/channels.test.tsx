import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

const { getMock, postMock, flags } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  flags: { useMock: true },
}));
vi.mock("./client", () => ({ api: { GET: getMock, POST: postMock } }));
vi.mock("@/lib/config", () => ({
  get USE_MOCK() {
    return flags.useMock;
  },
  get USE_API() {
    return !flags.useMock;
  },
  API_URL: "",
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

import { useChannels, useCreateChannel, mapApiChannel } from "./channels";
import { useProjects } from "./projects";
import { ApiError } from "./errors";

function wrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

/* Respostas da API para o par projetos -> canais (padrão aninhado). */
function mockProjectsThen(channelsPayload: unknown) {
  getMock.mockImplementation((path: string) => {
    if (path === "/api/v1/manage/projects") {
      return Promise.resolve({
        data: { projects: [{ id: "prj_1", name: "Sofia" }] },
        error: undefined,
      });
    }
    return Promise.resolve({ data: channelsPayload, error: undefined });
  });
}

describe("mapApiChannel", () => {
  it("traduz channel_type e is_active para os rótulos da UI", () => {
    expect(
      mapApiChannel(
        { id: 1, name: "Zap", channel_type: "whatsapp", is_active: true, outbound_webhook_url: "https://x" },
        "Sofia",
      ),
    ).toEqual({
      id: "1",
      type: "WhatsApp",
      label: "Zap",
      project: "Sofia",
      status: "Conectado",
      detail: "https://x",
    });
  });

  it("is_active=false vira Desconectado e detail vazio vira travessão", () => {
    const view = mapApiChannel({ id: "c2", name: "W", channel_type: "widget", is_active: false });
    expect(view.status).toBe("Desconectado");
    expect(view.type).toBe("Web Widget");
    expect(view.detail).toBe("—");
  });

  it("mantém channel_type desconhecido como veio", () => {
    expect(mapApiChannel({ id: 3, name: "X", channel_type: "sms" }).type).toBe("sms");
  });
});

describe("useChannels", () => {
  beforeEach(() => {
    getMock.mockReset();
    flags.useMock = true;
  });
  afterEach(() => vi.clearAllMocks());

  it("modo mock: retorna canais do seed sem chamar a API", async () => {
    const { result } = renderHook(() => useChannels(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
    expect(getMock).not.toHaveBeenCalled();
  });

  it("modo API: projeto ativo -> canais, valida e mapeia", async () => {
    flags.useMock = false;
    mockProjectsThen({
      channels: [{ id: "ch_1", name: "Zap", channel_type: "whatsapp", is_active: true }],
      total: 1,
    });
    const { result } = renderHook(() => useChannels(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0]).toMatchObject({
      id: "ch_1",
      type: "WhatsApp",
      status: "Conectado",
      project: "Sofia",
    });
  });

  it("modo API: payload inválido lança ApiError", async () => {
    flags.useMock = false;
    mockProjectsThen({ channels: [{ id: 1 }] });
    const { result } = renderHook(() => useChannels(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
  });
});

describe("useCreateChannel", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    flags.useMock = true;
  });
  afterEach(() => vi.clearAllMocks());

  it("modo mock: cria localmente com status Pendente", async () => {
    const { result } = renderHook(() => useCreateChannel(), { wrapper: wrapper() });
    const created = await result.current.mutateAsync({
      label: "Novo Zap",
      type: "WhatsApp",
      project: "Sofia",
    });
    expect(created.status).toBe("Pendente");
    expect(postMock).not.toHaveBeenCalled();
  });

  it("modo API: resolve o projeto pelo nome e envia channel_type do backend", async () => {
    flags.useMock = false;
    mockProjectsThen({ channels: [] });
    postMock.mockResolvedValue({
      data: {
        channel: { id: "ch_9", name: "Novo Zap", channel_type: "whatsapp", is_active: true },
        created: true,
        webhook_token: "whk_abc",
        webhook_url_example: "/api/v1/webhook/whatsapp/whk_abc",
      },
      error: undefined,
    });
    const { result } = renderHook(
      () => ({ projects: useProjects(), create: useCreateChannel() }),
      { wrapper: wrapper() },
    );
    await waitFor(() => expect(result.current.projects.isSuccess).toBe(true));
    const created = await result.current.create.mutateAsync({
      label: "Novo Zap",
      type: "WhatsApp",
      project: "Sofia",
    });
    expect(postMock).toHaveBeenCalledWith(
      "/api/v1/manage/projects/{project_id}/channels",
      expect.objectContaining({
        params: { path: { project_id: "prj_1" } },
        body: expect.objectContaining({
          name: "Novo Zap",
          channel_type: "whatsapp",
        }),
      }),
    );
    expect(created.webhookToken).toBe("whk_abc");
  });

  it("modo API: erro do backend vira ApiError", async () => {
    flags.useMock = false;
    mockProjectsThen({ channels: [] });
    postMock.mockResolvedValue({ data: undefined, error: { detail: "boom" } });
    const { result } = renderHook(() => useCreateChannel(), { wrapper: wrapper() });
    await expect(
      result.current.mutateAsync({ label: "X", type: "API", project: "Sofia" }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
