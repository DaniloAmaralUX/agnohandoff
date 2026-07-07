"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "./client";
import { USE_MOCK } from "@/lib/config";
import { PLAN, planUsage } from "@/lib/plan-data";
import { useProjectInfo } from "./platform";
import { queryKeys } from "./query-keys";
import {
  billingPlansResponseSchema,
  billingBalanceSchema,
  type ApiBillingPlan,
} from "./schemas";
import { ApiError } from "./errors";

/* ── Saldo ────────────────────────────────────────────────────────────────
   GET /billing/balance autentica por header X-Org-Id (não X-API-Key) —
   o org_id vem de useProjectInfo. */
export type BalanceView = {
  plan: string;
  total: number;
  used: number;
  available: number;
  usagePct: number;
  isSuspended: boolean;
  periodEnd?: string;
};

export function mapApiBalance(b: {
  plan?: string | null;
  total_tokens?: number | null;
  used_tokens?: number | null;
  available?: number | null;
  usage_pct?: number | null;
  is_suspended?: boolean | null;
  period_end?: string | null;
}): BalanceView {
  const total = b.total_tokens ?? 0;
  const used = b.used_tokens ?? 0;
  return {
    plan: b.plan ?? "—",
    total,
    used,
    available: b.available ?? Math.max(0, total - used),
    usagePct: b.usage_pct ?? (total > 0 ? +((used / total) * 100).toFixed(1) : 0),
    isSuspended: b.is_suspended ?? false,
    periodEnd: b.period_end ?? undefined,
  };
}

function balanceFromMock(): BalanceView {
  return {
    plan: PLAN.name,
    total: planUsage.total,
    used: planUsage.used,
    available: planUsage.remaining,
    usagePct: planUsage.percent,
    isSuspended: false,
    periodEnd: PLAN.renewsOn,
  };
}

export function useBillingBalance() {
  const { data: info } = useProjectInfo();
  const orgId = info?.orgId;
  return useQuery({
    queryKey: queryKeys.billing.balance(orgId ?? "mock"),
    enabled: USE_MOCK || Boolean(orgId),
    queryFn: async (): Promise<BalanceView> => {
      if (USE_MOCK) return balanceFromMock();
      const { data, error } = await api.GET("/api/v1/billing/balance", {
        params: { header: { "X-Org-Id": orgId as string } },
      });
      if (error) throw new ApiError(0, "Falha ao carregar o saldo.", error);
      const parsed = billingBalanceSchema.safeParse(data);
      if (!parsed.success) {
        throw new ApiError(0, "Resposta de saldo em formato inesperado.", parsed.error);
      }
      return mapApiBalance(parsed.data);
    },
  });
}

/* ── Planos ───────────────────────────────────────────────────────────────
   GET /billing/plans é público. Em modo API os cards nascem daqui. */
export type BillingPlanView = {
  id: string;
  name: string;
  priceBrl: number;
  monthlyCredits: number;
  maxProjects: number;
  maxAgents: number;
  byok: boolean;
};

export function mapApiBillingPlan(p: ApiBillingPlan): BillingPlanView {
  return {
    id: p.id != null ? String(p.id) : "",
    name: p.display_name ?? p.name ?? "",
    priceBrl: p.price_brl ?? 0,
    monthlyCredits: p.monthly_credits ?? 0,
    maxProjects: p.max_projects ?? 0,
    maxAgents: p.max_agents ?? 0,
    byok: p.byok ?? false,
  };
}

export function useBillingPlans() {
  return useQuery({
    queryKey: queryKeys.billing.plans(),
    enabled: !USE_MOCK, // na demo os cards ricos são locais
    queryFn: async (): Promise<BillingPlanView[]> => {
      const { data, error } = await api.GET("/api/v1/billing/plans");
      if (error) throw new ApiError(0, "Falha ao carregar os planos.", error);
      const parsed = billingPlansResponseSchema.safeParse(data);
      if (!parsed.success) {
        throw new ApiError(0, "Resposta de planos em formato inesperado.", parsed.error);
      }
      return (parsed.data.plans ?? []).map(mapApiBillingPlan);
    },
  });
}

/* ── Compra de créditos ───────────────────────────────────────────────────
   package_id do backend: pack_500k | pack_2m | pack_10m | pack_50m.
   Pagamento default: Pix — a resposta traz pix_qr_url para finalizar. */
export function usePurchasePack() {
  const { data: info } = useProjectInfo();
  return useMutation({
    mutationFn: async (input: { packageId: string }) => {
      const { data, error } = await api.POST("/api/v1/billing/purchase", {
        params: { header: { "X-Org-Id": info?.orgId as string } },
        body: { package_id: input.packageId, payment_method: "pix", installments: 1 },
      });
      if (error) throw new ApiError(0, "Falha ao iniciar a compra.", error);
      return data as {
        order_id?: string;
        status?: string;
        amount_brl?: number;
        pix_qr_url?: string | null;
        message?: string;
      };
    },
    onSuccess: (order) => {
      toast.success(order?.message || "Pedido criado — finalize o pagamento.", {
        duration: 12000,
        ...(order?.pix_qr_url
          ? {
              action: {
                label: "Abrir Pix",
                onClick: () => window.open(order.pix_qr_url as string, "_blank"),
              },
            }
          : {}),
      });
    },
    onError: () => {
      toast.error("Não foi possível iniciar a compra.");
    },
  });
}

export function useSubscribePlan() {
  const { data: info } = useProjectInfo();
  return useMutation({
    mutationFn: async (input: { planId: string }) => {
      const { data, error } = await api.POST("/api/v1/billing/subscribe", {
        params: { header: { "X-Org-Id": info?.orgId as string } },
        body: { plan_id: input.planId, payment_method: "credit_card" },
      });
      if (error) throw new ApiError(0, "Falha ao assinar o plano.", error);
      return data as { status?: string; plan?: string; message?: string };
    },
    onSuccess: (sub) => {
      toast.success(sub?.message || `Assinatura ${sub?.plan ?? ""} iniciada.`);
    },
    onError: () => {
      toast.error("Não foi possível mudar o plano.");
    },
  });
}
