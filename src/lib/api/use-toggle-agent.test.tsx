import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useToggleAgent, type AgentView } from "./agents";
import { queryKeys } from "./query-keys";

/* Silencia os toasts do sonner (efeito colateral fora de escopo do teste). */
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const AGENT: AgentView = {
  id: "agt_1",
  name: "Sofia",
  role: "Triagem",
  model: "claude-opus-4-8",
  status: "Rascunho",
  tone: "heat",
};

function makeWrapper(qc: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

function seededClient(): QueryClient {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  // Semeia a lista de agentes sob a chave aninhada (padrão ["agents", projectId]).
  qc.setQueryData<AgentView[]>(queryKeys.agents.list("mock"), [{ ...AGENT }]);
  return qc;
}

describe("useToggleAgent — atualização otimista", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("aplica a mudança na hora (onMutate) e confirma no sucesso", async () => {
    const qc = seededClient();
    const { result } = renderHook(() => useToggleAgent(), { wrapper: makeWrapper(qc) });

    act(() => {
      result.current.mutate({ id: "agt_1", publish: true });
    });

    // Otimista: a UI já reflete "Publicado" antes de o mutationFn resolver.
    await waitFor(() =>
      expect(qc.getQueryData<AgentView[]>(queryKeys.agents.list("mock"))?.[0].status).toBe("Publicado"),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // Continua "Publicado" após o sucesso (sem invalidação no modo mock).
    expect(qc.getQueryData<AgentView[]>(queryKeys.agents.list("mock"))?.[0].status).toBe("Publicado");
  });

  it("reverte o cache (onError) quando o mutationFn falha", async () => {
    const qc = seededClient();

    // Força a falha APENAS do mutationFn (que agenda um setTimeout de 450ms):
    // rejeitamos esse timer específico e deixamos os demais (ex.: o GC interno
    // do TanStack, que usa delays bem maiores) seguirem no timer real.
    const realSetTimeout = globalThis.setTimeout;
    const spy = vi
      .spyOn(globalThis, "setTimeout")
      .mockImplementation(((fn: (...a: unknown[]) => void, delay?: number, ...rest: unknown[]) => {
        if (delay === 450) throw new Error("boom");
        return realSetTimeout(fn, delay, ...rest);
      }) as typeof globalThis.setTimeout);

    const { result } = renderHook(() => useToggleAgent(), { wrapper: makeWrapper(qc) });

    act(() => {
      result.current.mutate({ id: "agt_1", publish: true });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Rollback: voltou ao estado semeado ("Rascunho").
    expect(qc.getQueryData<AgentView[]>(queryKeys.agents.list("mock"))?.[0].status).toBe("Rascunho");

    spy.mockRestore();
  });
});
