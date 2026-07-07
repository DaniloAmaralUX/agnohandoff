import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

/* Exercita os queryFns de useProjects/useAgents nos dois modos (mock e API),
   incluindo o caminho de erro (payload inválido -> ApiError). O client HTTP é
   mockado para controlar as respostas do openapi-fetch. */

// vi.hoisted: estes valores precisam existir antes das factories de vi.mock,
// que são içadas para o topo do módulo.
const { getMock, postMock, patchMock, flags } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  patchMock: vi.fn(),
  flags: { useMock: true },
}));
vi.mock("./client", () => ({
  api: { GET: getMock, POST: postMock, PATCH: patchMock },
}));

/* Toasts fora do escopo destes testes. */
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/lib/config", () => ({
  get USE_MOCK() {
    return flags.useMock;
  },
  get USE_API() {
    return !flags.useMock;
  },
  API_URL: "",
}));

import { useProjects, useCreateProject, mapApiProject } from "./projects";
import { useAgents, useToggleAgent } from "./agents";
import { useProjectInfo } from "./platform";
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

describe("useProjectInfo", () => {
  beforeEach(() => {
    getMock.mockReset();
    flags.useMock = true;
  });
  afterEach(() => vi.clearAllMocks());

  it("modo mock: devolve o org da demo sem chamar a API", async () => {
    const { result } = renderHook(() => useProjectInfo(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.orgId).toBe("org_vitalmed");
    expect(getMock).not.toHaveBeenCalled();
  });

  it("modo API: mapeia org_id/project_id/name da resposta", async () => {
    flags.useMock = false;
    getMock.mockResolvedValue({
      data: { org_id: "org_1", project_id: "prj_1", name: "Sofia" },
      error: undefined,
    });
    const { result } = renderHook(() => useProjectInfo(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ orgId: "org_1", projectId: "prj_1", name: "Sofia" });
  });

  it("modo API: variante org-only usa org_name como nome", async () => {
    flags.useMock = false;
    getMock.mockResolvedValue({
      data: { org_id: "org_1", org_name: "Vitalmed", status: "authenticated" },
      error: undefined,
    });
    const { result } = renderHook(() => useProjectInfo(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ orgId: "org_1", projectId: undefined, name: "Vitalmed" });
  });

  it("modo API: payload inválido lança ApiError", async () => {
    flags.useMock = false;
    getMock.mockResolvedValue({ data: { org_id: {} }, error: undefined });
    const { result } = renderHook(() => useProjectInfo(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
  });
});

describe("useCreateProject — modo API", () => {
  beforeEach(() => {
    postMock.mockReset();
    flags.useMock = false;
  });
  afterEach(() => vi.clearAllMocks());

  it("faz POST com slug derivado e mapeia o envelope {project}", async () => {
    postMock.mockResolvedValue({
      data: { project: { id: "prj_9", name: "Nova Ala", status: "draft" } },
      error: undefined,
    });
    const { result } = renderHook(() => useCreateProject(), { wrapper: wrapper() });
    await result.current.mutateAsync({ name: "Nova Ala", workspace: "ws" });
    expect(postMock).toHaveBeenCalledWith(
      "/api/v1/manage/projects",
      expect.objectContaining({
        body: expect.objectContaining({ name: "Nova Ala", slug: "nova-ala" }),
      }),
    );
  });

  it("erro do backend vira ApiError (ex.: slug duplicado)", async () => {
    postMock.mockResolvedValue({ data: undefined, error: { detail: "Slug já existe" } });
    const { result } = renderHook(() => useCreateProject(), { wrapper: wrapper() });
    await expect(
      result.current.mutateAsync({ name: "Nova Ala", workspace: "ws" }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});

describe("useToggleAgent — modo API", () => {
  beforeEach(() => {
    getMock.mockReset();
    patchMock.mockReset();
    flags.useMock = false;
  });
  afterEach(() => vi.clearAllMocks());

  it("faz PATCH is_active no agente do projeto ativo", async () => {
    getMock.mockResolvedValue({
      data: { projects: [{ id: "prj_1", name: "Sofia" }] },
      error: undefined,
    });
    patchMock.mockResolvedValue({ data: { agent: {}, updated: true }, error: undefined });
    // Renderiza projects junto para esperar o projeto ativo resolver
    // (dependência do path do PATCH) antes de disparar a mutação.
    const { result } = renderHook(
      () => ({ projects: useProjects(), toggle: useToggleAgent() }),
      { wrapper: wrapper() },
    );
    await waitFor(() => expect(result.current.projects.isSuccess).toBe(true));
    await result.current.toggle.mutateAsync({ id: "agt_1", publish: true });
    await waitFor(() =>
      expect(patchMock).toHaveBeenCalledWith(
        "/api/v1/manage/projects/{project_id}/agents/{agent_id}",
        expect.objectContaining({
          params: { path: { project_id: "prj_1", agent_id: "agt_1" } },
          body: { is_active: true },
        }),
      ),
    );
  });
});
