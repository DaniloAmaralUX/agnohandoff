/* Dados do plano da organização — FONTE ÚNICA (mock).
   Antes: cada tela declarava seu próprio preço/cota/consumo, o que gerava
   três narrativas diferentes (R$ 590 em Billing, R$ 890 em Settings, 4,2M
   em Dashboard) — pego pela auditoria de design como #6 do Top prioridades.

   Ao ligar na API real, o dev troca este módulo por um hook (`usePlan()`)
   contra `GET /billing/plans/current` sem mexer nas telas. */

export const PLAN = {
  name: "Pro" as const,
  priceLabel: "R$ 590",
  priceSuffix: "/mês",
  seats: 12,
  tokensPerMonth: 2_000_000,
  tokensUsed: 152_000,
  renewsOn: "2026-08-01",
} as const;

/* Agregados prontos p/ UI — sempre consistentes por construção. */
export const planUsage = {
  total: PLAN.tokensPerMonth,
  used: PLAN.tokensUsed,
  remaining: PLAN.tokensPerMonth - PLAN.tokensUsed,
  percent: +((PLAN.tokensUsed / PLAN.tokensPerMonth) * 100).toFixed(1),
};

/* Formatação pt-BR de token curto: 2_000_000 -> "2M"; 152_000 -> "152K".
   Uso em métricas curtas do dashboard. */
export function shortTokens(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "M";
  if (n >= 1_000) return (n / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 0 }) + "K";
  return n.toLocaleString("pt-BR");
}
