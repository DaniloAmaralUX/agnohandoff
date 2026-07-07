import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

/* Exercita os queryFns de useProjects/useAgents nos dois modos (mock e API),
   incluindo o caminho de erro (payload inválido -> ApiError). O client HTTP é
   mockado para controlar as respostas do openapi-fetch. */

// vi.hoisted: estes valores precisam existir antes das factories de vi.mock,
// que são içadas para o topo do módulo.
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

import { useProjects, mapApiProject } from "./projects";
import { useAgents } from "./agents";
import { ApiError } from "./errors";

function wrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

describe("useProjects", () => {
  beforeEach(() => {
    getMock.mockReset();
    flags.useMock = true;
  });
  afterEach(() => vi.clearAllMocks());

  it("modo mock: retorna projetos do seed sem chamar a API", async () => {
    const { result } = renderHook(() => useProjects(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
    expect(getMock).not.toHaveBeenCalled();
  });

  it("modo API: valida com Zod e mapeia a resposta", async () => {
    flags.useMock = false;
    getMock.mockResolvedValue({
      data: { projects: [{ id: "prj_1", name: "Sofia", status: "active", workspace_id: "ws_atendimento" }] },
      error: undefined,
    });
    const { result } = renderHook(() => useProjects(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([
      mapApiProject({ id: "prj_1", name: "Sofia", status: "active", workspace_id: "ws_atendimento" }),
    ]);
  });

  it("modo API: payload inválido lança ApiError", async () => {
    flags.useMock = false;
    getMock.mockResolvedValue({ data: { projects: [{ name: 123 }] }, error: undefined });
    const { result } = renderHook(() => useProjects(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
  });

  it("modo API: erro do openapi-fetch lança ApiError", async () => {
    flags.useMock = false;
    getMock.mockResolvedValue({ data: undefined, error: { detail: "boom" } });
    const { result } = renderHook(() => useProjects(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
  });
});

describe("useAgents", () => {
  beforeEach(() => {
    getMock.mockReset();
    flags.useMock = true;
  });
  afterEach(() => vi.clearAllMocks());

  it("modo mock: retorna agentes do seed", async () => {
    const { result } = renderHook(() => useAgents(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
  });

  it("modo API: busca projeto -> agentes, valida e mapeia", async () => {
    flags.useMock = false;
    getMock.mockImplementation((path: string) => {
      if (path === "/api/v1/manage/projects") {
        return Promise.resolve({ data: { projects: [{ id: "prj_1", name: "Sofia" }] }, error: undefined });
      }
      return Promise.resolve({
        data: { agents: [{ id: "agt_1", name: "Sofia", role: "Triagem", model_id: "m", is_active: true }] },
        error: undefined,
      });
    });
    const { result } = renderHook(() => useAgents(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0]).toMatchObject({ id: "agt_1", name: "Sofia", status: "Publicado" });
  });

  it("modo API: agentes com payload inválido lança ApiError", async () => {
    flags.useMock = false;
    getMock.mockImplementation((path: string) => {
      if (path === "/api/v1/manage/projects") {
        return Promise.resolve({ data: { projects: [{ id: "prj_1", name: "Sofia" }] }, error: undefined });
      }
      return Promise.resolve({ data: { agents: [{ id: "a" }] }, error: undefined });
    });
    const { result } = renderHook(() => useAgents(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
  });
});
