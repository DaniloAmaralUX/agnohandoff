import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

const { getMock, postMock, deleteMock, flags } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  deleteMock: vi.fn(),
  flags: { useMock: true },
}));
vi.mock("./client", () => ({
  api: { GET: getMock, POST: postMock, DELETE: deleteMock },
}));
vi.mock("@/lib/config", () => ({
  get USE_MOCK() {
    return flags.useMock;
  },
  get USE_API() {
    return !flags.useMock;
  },
  API_URL: "",
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { useApiKeys, useCreateApiKey, useRevokeApiKey, mapApiKey } from "./api-keys";
import { ApiError } from "./errors";

function wrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

describe("mapApiKey", () => {
  it("normaliza campos e trata is_active ausente como ativa", () => {
    expect(mapApiKey({ id: 1, name: "Painel", key_preview: "proj_ab···cd" })).toEqual({
      id: "1",
      name: "Painel",
      preview: "proj_ab···cd",
      active: true,
    });
    expect(mapApiKey({ id: 2, is_active: false }).active).toBe(false);
  });
});

describe("useApiKeys", () => {
  beforeEach(() => {
    getMock.mockReset();
    flags.useMock = true;
  });
  afterEach(() => vi.clearAllMocks());

  it("modo mock: devolve a chave de demonstração sem chamar a API", async () => {
    const { result } = renderHook(() => useApiKeys(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0]?.preview).toContain("pk_demo");
    expect(getMock).not.toHaveBeenCalled();
  });

  it("modo API: valida e mapeia o envelope {api_keys}", async () => {
    flags.useMock = false;
    getMock.mockResolvedValue({
      data: { api_keys: [{ id: "k1", name: "Painel", key_preview: "proj_12···89", is_active: true }] },
      error: undefined,
    });
    const { result } = renderHook(() => useApiKeys(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([
      { id: "k1", name: "Painel", preview: "proj_12···89", active: true },
    ]);
  });

  it("modo API: payload inválido lança ApiError", async () => {
    flags.useMock = false;
    getMock.mockResolvedValue({ data: { api_keys: [{ name: 1 }] }, error: undefined });
    const { result } = renderHook(() => useApiKeys(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
  });
});

describe("useCreateApiKey / useRevokeApiKey", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    deleteMock.mockReset();
    flags.useMock = true;
  });
  afterEach(() => vi.clearAllMocks());

  it("modo mock: gera chave local pk_demo sem chamar a API", async () => {
    const { result } = renderHook(() => useCreateApiKey(), { wrapper: wrapper() });
    const created = await result.current.mutateAsync({ name: "Painel" });
    expect(created.raw).toMatch(/^pk_demo_/);
    expect(created.preview).toContain("···");
    expect(postMock).not.toHaveBeenCalled();
  });

  it("modo API: erro no POST vira ApiError; preview derivado quando falta", async () => {
    flags.useMock = false;
    getMock.mockResolvedValue({ data: { projects: [] }, error: undefined });
    postMock.mockResolvedValueOnce({ data: undefined, error: { detail: "limite" } });
    const { result } = renderHook(() => useCreateApiKey(), { wrapper: wrapper() });
    await expect(result.current.mutateAsync({ name: "Painel" })).rejects.toBeInstanceOf(ApiError);

    postMock.mockResolvedValueOnce({
      data: { api_key: "proj_abcdefgh1234", created: true },
      error: undefined,
    });
    const created = await result.current.mutateAsync({ name: "Painel" });
    expect(created.preview).toBe("proj_abc···1234");
  });

  it("modo API: POST devolve a chave crua uma única vez", async () => {
    flags.useMock = false;
    getMock.mockResolvedValue({ data: { projects: [] }, error: undefined });
    postMock.mockResolvedValue({
      data: { api_key: "proj_secret123", key_preview: "proj_sec···123", created: true },
      error: undefined,
    });
    const { result } = renderHook(() => useCreateApiKey(), { wrapper: wrapper() });
    const created = await result.current.mutateAsync({ name: "Painel" });
    expect(created).toEqual({ raw: "proj_secret123", preview: "proj_sec···123" });
  });

  it("modo API: revoga via DELETE e erro vira ApiError", async () => {
    flags.useMock = false;
    deleteMock.mockResolvedValueOnce({ data: { revoked: true }, error: undefined });
    const { result } = renderHook(() => useRevokeApiKey(), { wrapper: wrapper() });
    await result.current.mutateAsync({ id: "k1" });
    expect(deleteMock).toHaveBeenCalledWith(
      "/api/v1/manage/api-keys/{key_id}",
      expect.objectContaining({ params: { path: { key_id: "k1" } } }),
    );

    deleteMock.mockResolvedValueOnce({ data: undefined, error: { detail: "nope" } });
    await expect(result.current.mutateAsync({ id: "k2" })).rejects.toBeInstanceOf(ApiError);
  });
});
