"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "./client";
import { USE_MOCK } from "@/lib/config";
import { setApiKey } from "@/lib/auth";
import { registerResponseSchema } from "./schemas";
import { ApiError } from "./errors";

/* POST /auth/register (público) — cria org + primeiro projeto + API key.
   A chave crua vem UMA única vez; gravamos via setApiKey() na hora e a tela
   de sucesso a exibe com botão de copiar antes de navegar. */
export type RegisteredView = {
  orgId: string;
  orgName: string;
  plan: string;
  apiKey: string;
};

export function useRegister() {
  return useMutation({
    mutationFn: async (input: {
      name: string;
      email: string;
      password: string;
      orgName?: string;
    }): Promise<RegisteredView> => {
      if (USE_MOCK) {
        const rand = Math.random().toString(36).slice(2, 26);
        return {
          orgId: `org_${rand.slice(0, 6)}`,
          orgName: input.orgName || input.name,
          plan: "starter",
          apiKey: `agnohub_demo_${rand}`,
        };
      }
      const { data, error } = await api.POST("/auth/register", {
        body: {
          name: input.name,
          email: input.email,
          password: input.password,
          org_name: input.orgName || null,
        },
      });
      if (error) throw new ApiError(0, "Falha ao criar a organização.", error);
      const parsed = registerResponseSchema.safeParse(data);
      if (!parsed.success) {
        throw new ApiError(0, "Resposta de cadastro em formato inesperado.", parsed.error);
      }
      return {
        orgId: parsed.data.org_id != null ? String(parsed.data.org_id) : "",
        orgName: parsed.data.org_name ?? input.orgName ?? input.name,
        plan: parsed.data.plan ?? "starter",
        apiKey: parsed.data.api_key,
      };
    },
    onSuccess: (created) => {
      // Sessão já autenticada — a tela de sucesso exibe a chave uma vez.
      setApiKey(created.apiKey);
    },
  });
}
