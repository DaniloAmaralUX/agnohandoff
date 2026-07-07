import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

const { getMock, postMock, putMock, flags } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  putMock: vi.fn(),
  flags: { useMock: true },
}));
vi.mock("./client", () => ({ api: { GET: getMock, POST: postMock, PUT: putMock } }));
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
  useStudioRules,
  useToggleStudioRule,
  useGenerateStudioRule,
  mapApiRule,
  ruleNameFromPrompt,
} from "./studio";
import { ApiError } from "./errors";

function wrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

describe("mapApiRule", () => {
  it("traduz scope e prefere o texto NL como trigger exibido", () => {
    expect(
      mapApiRule({
        id: 1,
        name: "Normalizar telefone",
        scope: "both",
        created_by_nl: "Quando o telefone chegar, normalize.",
        is_active: true,
      }),
    ).toEqual({
      id: "1",
      name: "Normalizar telefone",
      scope: "Payload",
      trigger: "Quando o telefone chegar, normalize.",
      active: true,
    });
  });

  it("sem NL usa description ou o trigger serializado; is_active=false desativa", () => {
    expect(
      mapApiRule({ id: 2, name: "R", scope: "inbound", trigger: { field: "phone" }, is_active: false }),
    ).toMatchObject({ scope: "Entrada", trigger: '{"field":"phone"}', active: false });
  });
});

describe("ruleNameFromPrompt", () => {
  it("usa a primeira frase e trunca em 48 chars", () => {
    expect(ruleNameFromPrompt("Formatar telefone BR. Sempre.")).toBe("Formatar telefone BR");
    expect(
      ruleNameFromPrompt("a".repeat(60)).length,
    ).toBeLessThanOrEqual(48);
  });
});

describe("useStudioRules", () => {
  beforeEach(() => {
    getMock.mockReset();
    flags.useMock = true;
  });
  afterEach(() => vi.clearAllMocks());

  it("modo mock: retorna regras do seed sem chamar a API", async () => {
    const { result } = renderHook(() => useStudioRules(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
    expect(getMock).not.toHaveBeenCalled();
  });

  it("modo API: valida com Zod e mapeia {rules}", async () => {
    flags.useMock = false;
    getMock.mockResolvedValue({
      data: { rules: [{ id: "r1", name: "X", scope: "both", is_active: true }], total: 1 },
      error: undefined,
    });
    const { result } = renderHook(() => useStudioRules(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0]?.scope).toBe("Payload");
  });

  it("modo API: payload inválido lança ApiError", async () => {
    flags.useMock = false;
    getMock.mockResolvedValue({ data: { rules: [{ id: 1 }] }, error: undefined });
    const { result } = renderHook(() => useStudioRules(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
  });
});

describe("useToggleStudioRule", () => {
  beforeEach(() => {
    putMock.mockReset();
    flags.useMock = false;
  });
  afterEach(() => vi.clearAllMocks());

  it("modo API: PUT is_active na regra", async () => {
    putMock.mockResolvedValue({ data: { id: "r1" }, error: undefined });
    const { result } = renderHook(() => useToggleStudioRule(), { wrapper: wrapper() });
    await result.current.mutateAsync({ id: "r1", active: false });
    expect(putMock).toHaveBeenCalledWith(
      "/api/v1/payload-rules/{rule_id}",
      expect.objectContaining({
        params: { path: { rule_id: "r1" } },
        body: { is_active: false },
      }),
    );
  });

  it("erro do backend vira ApiError", async () => {
    putMock.mockResolvedValue({ data: undefined, error: { detail: "boom" } });
    const { result } = renderHook(() => useToggleStudioRule(), { wrapper: wrapper() });
    await expect(result.current.mutateAsync({ id: "r1", active: true })).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});

describe("useGenerateStudioRule", () => {
  beforeEach(() => {
    postMock.mockReset();
    flags.useMock = true;
  });
  afterEach(() => vi.clearAllMocks());

  it("modo mock: cria localmente a partir do prompt", async () => {
    const { result } = renderHook(() => useGenerateStudioRule(), { wrapper: wrapper() });
    const created = await result.current.mutateAsync({ instruction: "Formatar telefone BR." });
    expect(created).toHaveLength(1);
    expect(created[0].name).toBe("Formatar telefone BR");
    expect(postMock).not.toHaveBeenCalled();
  });

  it("modo API: interpreta e cria cada regra devolvida pela IA", async () => {
    flags.useMock = false;
    postMock.mockImplementation((path: string) => {
      if (path === "/api/v1/payload-rules/interpret") {
        return Promise.resolve({
          data: {
            instruction: "x",
            rules: [{ name: "Regra IA", trigger: { field: "phone" }, action: { type: "set" }, scope: "both" }],
            count: 1,
          },
          error: undefined,
        });
      }
      return Promise.resolve({
        data: { id: "r9", name: "Regra IA", scope: "both", is_active: true },
        error: undefined,
      });
    });
    const { result } = renderHook(() => useGenerateStudioRule(), { wrapper: wrapper() });
    const created = await result.current.mutateAsync({ instruction: "Normalize o telefone." });
    expect(created[0]).toMatchObject({ id: "r9", name: "Regra IA", scope: "Payload" });
    expect(postMock).toHaveBeenCalledWith(
      "/api/v1/payload-rules",
      expect.objectContaining({
        body: expect.objectContaining({ created_by_nl: "Normalize o telefone." }),
      }),
    );
  });

  it("modo API: IA sem regras utilizáveis vira ApiError", async () => {
    flags.useMock = false;
    postMock.mockResolvedValue({ data: { instruction: "x", rules: [], count: 0 }, error: undefined });
    const { result } = renderHook(() => useGenerateStudioRule(), { wrapper: wrapper() });
    await expect(result.current.mutateAsync({ instruction: "abc" })).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});
