import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";

const { postMock, setApiKeyMock, flags } = vi.hoisted(() => ({
  postMock: vi.fn(),
  setApiKeyMock: vi.fn(),
  flags: { useMock: true },
}));
vi.mock("./client", () => ({ api: { POST: postMock } }));
vi.mock("@/lib/config", () => ({
  get USE_MOCK() {
    return flags.useMock;
  },
  get USE_API() {
    return !flags.useMock;
  },
  API_URL: "",
}));
vi.mock("@/lib/auth", () => ({ setApiKey: setApiKeyMock }));

import { useRegister } from "./register";
import { ApiError } from "./errors";

function wrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

describe("useRegister", () => {
  beforeEach(() => {
    postMock.mockReset();
    setApiKeyMock.mockReset();
    flags.useMock = true;
  });
  afterEach(() => vi.clearAllMocks());

  it("modo mock: cria org demo e grava a chave via setApiKey", async () => {
    const { result } = renderHook(() => useRegister(), { wrapper: wrapper() });
    const created = await result.current.mutateAsync({
      name: "Vitalmed",
      email: "a@b.co",
      password: "12345678",
    });
    expect(created.apiKey).toMatch(/^agnohub_demo_/);
    expect(setApiKeyMock).toHaveBeenCalledWith(created.apiKey);
    expect(postMock).not.toHaveBeenCalled();
  });

  it("modo API: POST /auth/register e mapeia a resposta (key crua uma vez)", async () => {
    flags.useMock = false;
    postMock.mockResolvedValue({
      data: {
        org_id: "org_1",
        org_name: "Vitalmed",
        plan: "starter",
        api_key: "agnohub_secret",
        dashboard_url: "http://x/?api_key=agnohub_secret",
      },
      error: undefined,
    });
    const { result } = renderHook(() => useRegister(), { wrapper: wrapper() });
    const created = await result.current.mutateAsync({
      name: "Danilo",
      email: "d@vitalmed.com.br",
      password: "12345678",
      orgName: "Vitalmed",
    });
    expect(postMock).toHaveBeenCalledWith(
      "/auth/register",
      expect.objectContaining({
        body: {
          name: "Danilo",
          email: "d@vitalmed.com.br",
          password: "12345678",
          org_name: "Vitalmed",
        },
      }),
    );
    expect(created).toEqual({
      orgId: "org_1",
      orgName: "Vitalmed",
      plan: "starter",
      apiKey: "agnohub_secret",
    });
    expect(setApiKeyMock).toHaveBeenCalledWith("agnohub_secret");
  });

  it("modo API: erro (ex.: e-mail já usado) vira ApiError e não grava chave", async () => {
    flags.useMock = false;
    postMock.mockResolvedValue({ data: undefined, error: { detail: "Email já cadastrado" } });
    const { result } = renderHook(() => useRegister(), { wrapper: wrapper() });
    await expect(
      result.current.mutateAsync({ name: "X", email: "x@y.co", password: "12345678" }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(setApiKeyMock).not.toHaveBeenCalled();
  });

  it("modo API: payload sem api_key vira ApiError", async () => {
    flags.useMock = false;
    postMock.mockResolvedValue({ data: { org_id: "o" }, error: undefined });
    const { result } = renderHook(() => useRegister(), { wrapper: wrapper() });
    await expect(
      result.current.mutateAsync({ name: "X", email: "x@y.co", password: "12345678" }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
