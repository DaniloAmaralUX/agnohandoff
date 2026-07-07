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
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import {
  useWorkspaces,
  useCreateWorkspace,
  mapApiWorkspace,
} from "./workspaces";
import { ApiError } from "./errors";

function wrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

describe("mapApiWorkspace", () => {
  it("coage id para string e null para string vazia", () => {
    expect(mapApiWorkspace({ id: 7, name: "Atendimento", description: null })).toEqual({
      id: "7",
      name: "Atendimento",
      description: "",
    });
  });
});

describe("useWorkspaces", () => {
  beforeEach(() => {
    getMock.mockReset();
    flags.useMock = true;
  });
  afterEach(() => vi.clearAllMocks());

  it("modo mock: retorna workspaces do seed sem chamar a API", async () => {
    const { result } = renderHook(() => useWorkspaces(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
    expect(getMock).not.toHaveBeenCalled();
  });

  it("modo API: valida com Zod e mapeia o envelope {workspaces}", async () => {
    flags.useMock = false;
    getMock.mockResolvedValue({
      data: { workspaces: [{ id: "ws_1", name: "Atendimento", description: "Triagem" }], total: 1 },
      error: undefined,
    });
    const { result } = renderHook(() => useWorkspaces(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([
      { id: "ws_1", name: "Atendimento", description: "Triagem" },
    ]);
  });

  it("modo API: payload inválido lança ApiError", async () => {
    flags.useMock = false;
    getMock.mockResolvedValue({ data: { workspaces: [{ name: 5 }] }, error: undefined });
    const { result } = renderHook(() => useWorkspaces(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
  });

  it("modo API: erro do openapi-fetch lança ApiError", async () => {
    flags.useMock = false;
    getMock.mockResolvedValue({ data: undefined, error: { detail: "boom" } });
    const { result } = renderHook(() => useWorkspaces(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
  });
});

describe("useCreateWorkspace", () => {
  beforeEach(() => {
    postMock.mockReset();
    flags.useMock = true;
  });
  afterEach(() => vi.clearAllMocks());

  it("modo mock: cria localmente sem chamar a API", async () => {
    const { result } = renderHook(() => useCreateWorkspace(), { wrapper: wrapper() });
    const created = await result.current.mutateAsync({ name: "Novo" });
    expect(created.name).toBe("Novo");
    expect(created.members).toBe(1);
    expect(postMock).not.toHaveBeenCalled();
  });

  it("modo API: POST com slug derivado e mapeia o envelope {workspace}", async () => {
    flags.useMock = false;
    postMock.mockResolvedValue({
      data: { workspace: { id: "ws_9", name: "Pós-venda", description: null } },
      error: undefined,
    });
    const { result } = renderHook(() => useCreateWorkspace(), { wrapper: wrapper() });
    const created = await result.current.mutateAsync({ name: "Pós-venda" });
    expect(postMock).toHaveBeenCalledWith(
      "/api/v1/manage/workspaces",
      expect.objectContaining({
        body: expect.objectContaining({ name: "Pós-venda", slug: "pos-venda" }),
      }),
    );
    expect(created).toEqual({ id: "ws_9", name: "Pós-venda", description: "" });
  });

  it("modo API: erro do backend vira ApiError", async () => {
    flags.useMock = false;
    postMock.mockResolvedValue({ data: undefined, error: { detail: "Slug já existe" } });
    const { result } = renderHook(() => useCreateWorkspace(), { wrapper: wrapper() });
    await expect(result.current.mutateAsync({ name: "Dup" })).rejects.toBeInstanceOf(ApiError);
  });

  it("modo API: envelope inesperado vira ApiError", async () => {
    flags.useMock = false;
    postMock.mockResolvedValue({ data: { nope: true }, error: undefined });
    const { result } = renderHook(() => useCreateWorkspace(), { wrapper: wrapper() });
    await expect(result.current.mutateAsync({ name: "X y" })).rejects.toBeInstanceOf(ApiError);
  });
});
