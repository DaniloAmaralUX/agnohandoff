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
  useBillingBalance,
  useBillingPlans,
  usePurchasePack,
  useSubscribePlan,
  mapApiBalance,
  mapApiBillingPlan,
} from "./billing";
import { ApiError } from "./errors";

function wrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

/* /project/info responde org_1 nas chamadas GET que o billing dispara antes. */
function mockInfoThen(payloads: Record<string, unknown>) {
  getMock.mockImplementation((path: string) => {
    if (path === "/api/v1/project/info") {
      return Promise.resolve({ data: { org_id: "org_1" }, error: undefined });
    }
    return Promise.resolve({ data: payloads[path], error: undefined });
  });
}

describe("mapApiBalance", () => {
  it("usa os campos do backend e deriva available/pct quando faltam", () => {
    expect(
      mapApiBalance({ plan: "pro", total_tokens: 100, used_tokens: 25 }),
    ).toEqual({
      plan: "pro",
      total: 100,
      used: 25,
      available: 75,
      usagePct: 25,
      isSuspended: false,
      periodEnd: undefined,
    });
  });

  it("preserva valores explícitos do backend", () => {
    const v = mapApiBalance({
      plan: "business",
      total_tokens: 10,
      used_tokens: 2,
      available: 8,
      usage_pct: 20,
      is_suspended: true,
      period_end: "2026-08-01",
    });
    expect(v.isSuspended).toBe(true);
    expect(v.periodEnd).toBe("2026-08-01");
  });
});

describe("mapApiBillingPlan", () => {
  it("prefere display_name e coage nulls", () => {
    expect(
      mapApiBillingPlan({ id: 1, name: "pro", display_name: "Pro", price_brl: 590, monthly_credits: 2_000_000, max_projects: 0, max_agents: 0, byok: true }),
    ).toEqual({
      id: "1",
      name: "Pro",
      priceBrl: 590,
      monthlyCredits: 2_000_000,
      maxProjects: 0,
      maxAgents: 0,
      byok: true,
    });
  });
});

describe("useBillingBalance", () => {
  beforeEach(() => {
    getMock.mockReset();
    flags.useMock = true;
  });
  afterEach(() => vi.clearAllMocks());

  it("modo mock: espelha o plano canônico sem chamar a API", async () => {
    const { result } = renderHook(() => useBillingBalance(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.plan).toBe("Pro");
    expect(result.current.data?.total).toBeGreaterThan(0);
  });

  it("modo API: manda X-Org-Id vindo de /project/info", async () => {
    flags.useMock = false;
    mockInfoThen({
      "/api/v1/billing/balance": {
        plan: "pro",
        total_tokens: 2_000_000,
        used_tokens: 100_000,
        available: 1_900_000,
        usage_pct: 5,
        is_suspended: false,
      },
    });
    const { result } = renderHook(() => useBillingBalance(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getMock).toHaveBeenCalledWith(
      "/api/v1/billing/balance",
      expect.objectContaining({ params: { header: { "X-Org-Id": "org_1" } } }),
    );
    expect(result.current.data?.available).toBe(1_900_000);
  });

  it("modo API: payload inválido lança ApiError", async () => {
    flags.useMock = false;
    mockInfoThen({ "/api/v1/billing/balance": { total_tokens: "x" } });
    const { result } = renderHook(() => useBillingBalance(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
  });
});

describe("useBillingPlans", () => {
  beforeEach(() => {
    getMock.mockReset();
    flags.useMock = true;
  });
  afterEach(() => vi.clearAllMocks());

  it("na demo fica desabilitado (cards ricos são locais)", () => {
    const { result } = renderHook(() => useBillingPlans(), { wrapper: wrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("modo API: mapeia o envelope {plans}", async () => {
    flags.useMock = false;
    getMock.mockResolvedValue({
      data: { plans: [{ id: "p1", name: "starter", display_name: "Starter", price_brl: 149 }] },
      error: undefined,
    });
    const { result } = renderHook(() => useBillingPlans(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0]?.name).toBe("Starter");
  });
});

describe("usePurchasePack / useSubscribePlan", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    flags.useMock = false;
    mockInfoThen({});
  });
  afterEach(() => vi.clearAllMocks());

  it("compra manda package_id + pix com X-Org-Id", async () => {
    postMock.mockResolvedValue({
      data: { order_id: "o1", status: "pending", pix_qr_url: "https://pix" },
      error: undefined,
    });
    const { result } = renderHook(() => usePurchasePack(), { wrapper: wrapper() });
    await waitFor(() => expect(getMock).toHaveBeenCalled());
    const order = await result.current.mutateAsync({ packageId: "pack_2m" });
    expect(postMock).toHaveBeenCalledWith(
      "/api/v1/billing/purchase",
      expect.objectContaining({
        body: expect.objectContaining({ package_id: "pack_2m", payment_method: "pix" }),
      }),
    );
    expect(order.pix_qr_url).toBe("https://pix");
  });

  it("assinatura manda plan_id; erro vira ApiError", async () => {
    postMock.mockResolvedValueOnce({ data: { status: "active", plan: "Pro" }, error: undefined });
    const { result } = renderHook(() => useSubscribePlan(), { wrapper: wrapper() });
    await result.current.mutateAsync({ planId: "plan_uuid" });
    expect(postMock).toHaveBeenCalledWith(
      "/api/v1/billing/subscribe",
      expect.objectContaining({
        body: expect.objectContaining({ plan_id: "plan_uuid" }),
      }),
    );

    postMock.mockResolvedValueOnce({ data: undefined, error: { detail: "boom" } });
    await expect(result.current.mutateAsync({ planId: "x" })).rejects.toBeInstanceOf(ApiError);
  });
});
