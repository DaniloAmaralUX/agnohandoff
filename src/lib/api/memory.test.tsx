import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

const { getMock, patchMock, flags } = vi.hoisted(() => ({
  getMock: vi.fn(),
  patchMock: vi.fn(),
  flags: { useMock: true },
}));
vi.mock("./client", () => ({ api: { GET: getMock, PATCH: patchMock } }));
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

import { useUpdateProjectMemory, API_MEMORY_STRATEGIES } from "./memory";
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

describe("API_MEMORY_STRATEGIES", () => {
  it("cobre exatamente os enums do backend", () => {
    expect(API_MEMORY_STRATEGIES.map((s) => s.key)).toEqual([
      "hybrid",
      "palace_only",
      "db_only",
      "none",
    ]);
  });
});

describe("useUpdateProjectMemory", () => {
  beforeEach(() => {
    getMock.mockReset();
    patchMock.mockReset();
    flags.useMock = true;
  });
  afterEach(() => vi.clearAllMocks());

  it("modo mock: resolve sem chamar a API", async () => {
    const { result } = renderHook(() => useUpdateProjectMemory(), { wrapper: wrapper() });
    await result.current.mutateAsync({ memoryStrategy: "hybrid", contextWindow: 20 });
    expect(patchMock).not.toHaveBeenCalled();
  });

  it("modo API: PATCH no projeto ativo com os campos do backend", async () => {
    flags.useMock = false;
    getMock.mockResolvedValue({
      data: { projects: [{ id: "prj_1", name: "Sofia" }] },
      error: undefined,
    });
    patchMock.mockResolvedValue({ data: { project: {}, updated: true }, error: undefined });
    const { result } = renderHook(
      () => ({ projects: useProjects(), update: useUpdateProjectMemory() }),
      { wrapper: wrapper() },
    );
    await waitFor(() => expect(result.current.projects.isSuccess).toBe(true));
    await result.current.update.mutateAsync({ memoryStrategy: "palace_only", contextWindow: 50 });
    expect(patchMock).toHaveBeenCalledWith(
      "/api/v1/manage/projects/{project_id}",
      expect.objectContaining({
        params: { path: { project_id: "prj_1" } },
        body: { memory_strategy: "palace_only", context_window_size: 50 },
      }),
    );
  });

  it("modo API: erro do backend vira ApiError", async () => {
    flags.useMock = false;
    getMock.mockResolvedValue({ data: { projects: [{ id: "p", name: "S" }] }, error: undefined });
    patchMock.mockResolvedValue({ data: undefined, error: { detail: "nope" } });
    const { result } = renderHook(() => useUpdateProjectMemory(), { wrapper: wrapper() });
    await expect(
      result.current.mutateAsync({ memoryStrategy: "hybrid", contextWindow: 10 }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
