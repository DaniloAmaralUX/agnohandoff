"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "./client";
import { USE_MOCK } from "@/lib/config";
import { studioRules as mockRules } from "@/lib/data";
import { queryKeys } from "./query-keys";
import {
  payloadRulesResponseSchema,
  payloadRuleSchema,
  interpretResponseSchema,
  type ApiPayloadRule,
} from "./schemas";
import { ApiError } from "./errors";

/* View da tela Studio. O backend só tem payload rules; regras de "Voz"
   existem apenas na demo (gap no HANDOFF). */
export type StudioRuleView = {
  id: string;
  name: string;
  scope: string;
  trigger: string;
  active: boolean;
};

const SCOPE_PT: Record<string, string> = {
  both: "Payload",
  inbound: "Entrada",
  outbound: "Saída",
};

export function mapApiRule(r: ApiPayloadRule): StudioRuleView {
  const scope = r.scope ?? "both";
  return {
    id: String(r.id),
    name: r.name ?? "",
    scope: SCOPE_PT[scope] ?? scope,
    trigger:
      r.created_by_nl ||
      r.description ||
      (r.trigger ? JSON.stringify(r.trigger) : ""),
    active: r.is_active !== false,
  };
}

function fromMock(): StudioRuleView[] {
  return mockRules.map((r) => ({ ...r }));
}

export function useStudioRules() {
  return useQuery({
    queryKey: queryKeys.studio.allRules(),
    queryFn: async (): Promise<StudioRuleView[]> => {
      if (USE_MOCK) return fromMock();
      const { data, error } = await api.GET("/api/v1/payload-rules");
      if (error) throw new ApiError(0, "Falha ao carregar as regras.", error);
      const parsed = payloadRulesResponseSchema.safeParse(data);
      if (!parsed.success) {
        throw new ApiError(0, "Resposta de regras em formato inesperado.", parsed.error);
      }
      return (parsed.data.rules ?? []).map(mapApiRule);
    },
  });
}

/* Liga/desliga com atualização otimista (mesmo padrão de useToggleAgent). */
export function useToggleStudioRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 250));
        return active;
      }
      const { error } = await api.PUT("/api/v1/payload-rules/{rule_id}", {
        params: { path: { rule_id: id } },
        body: { is_active: active },
      });
      if (error) throw new ApiError(0, "Falha ao atualizar a regra.", error);
      return active;
    },
    onMutate: async ({ id, active }) => {
      await qc.cancelQueries({ queryKey: queryKeys.studio.allRules() });
      const prev = qc.getQueryData<StudioRuleView[]>(queryKeys.studio.allRules());
      qc.setQueryData<StudioRuleView[]>(queryKeys.studio.allRules(), (old) =>
        old?.map((r) => (r.id === id ? { ...r, active } : r)),
      );
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.studio.allRules(), ctx.prev);
      toast.error("Não foi possível atualizar a regra. Alteração revertida.");
    },
    onSettled: () => {
      if (!USE_MOCK) qc.invalidateQueries({ queryKey: queryKeys.studio.allRules() });
    },
  });
}

// Deriva um nome curto de regra a partir da primeira frase do prompt.
export function ruleNameFromPrompt(prompt: string) {
  const first = prompt.trim().split(/[.\n]/)[0].trim();
  if (first.length <= 48) return first;
  return `${first.slice(0, 47).trimEnd()}…`;
}

/* Gerar regra por linguagem natural:
   modo API = POST /payload-rules/interpret (IA traduz o texto) e cada regra
   interpretada é criada via POST /payload-rules; demo cria localmente. */
export function useGenerateStudioRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { instruction: string }): Promise<StudioRuleView[]> => {
      if (USE_MOCK) {
        return [
          {
            id: `r_${Date.now()}`,
            name: ruleNameFromPrompt(input.instruction),
            scope: "Payload",
            trigger: input.instruction,
            active: true,
          },
        ];
      }
      const { data, error } = await api.POST("/api/v1/payload-rules/interpret", {
        body: { instruction: input.instruction },
      });
      if (error) throw new ApiError(0, "Falha ao interpretar a instrução.", error);
      const parsed = interpretResponseSchema.safeParse(data);
      if (!parsed.success || (parsed.data.rules ?? []).length === 0) {
        throw new ApiError(0, "A IA não devolveu nenhuma regra utilizável.", data);
      }
      // Cria cada regra interpretada; ignora itens fora do contrato.
      const created: StudioRuleView[] = [];
      for (const raw of parsed.data.rules ?? []) {
        const body = raw as Record<string, unknown>;
        const { data: createdData, error: createErr } = await api.POST(
          "/api/v1/payload-rules",
          {
            body: {
              name: String(body.name ?? ruleNameFromPrompt(input.instruction)),
              description: (body.description as string | undefined) ?? null,
              trigger: (body.trigger as Record<string, unknown>) ?? {},
              action: (body.action as Record<string, unknown>) ?? {},
              scope: String(body.scope ?? "both"),
              order_index: Number(body.order_index ?? 0),
              is_active: body.is_active !== false,
              created_by_nl: input.instruction,
            },
          },
        );
        if (createErr) continue;
        const rule = payloadRuleSchema.safeParse(createdData);
        if (rule.success) created.push(mapApiRule(rule.data));
      }
      if (created.length === 0) {
        throw new ApiError(0, "Nenhuma regra pôde ser criada.", data);
      }
      return created;
    },
    onSuccess: (created) => {
      qc.setQueryData<StudioRuleView[]>(queryKeys.studio.allRules(), (old) => [
        ...created,
        ...(old ?? []),
      ]);
      toast.success(
        created.length === 1 ? "Regra criada." : `${created.length} regras criadas.`,
        { description: "Ative ou ajuste na lista à esquerda." },
      );
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Não foi possível gerar a regra.",
      );
    },
    onSettled: () => {
      if (!USE_MOCK) qc.invalidateQueries({ queryKey: queryKeys.studio.allRules() });
    },
  });
}
