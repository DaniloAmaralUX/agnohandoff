"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "./client";
import { USE_MOCK } from "@/lib/config";
import { useActiveProject } from "@/lib/project-context";
import { queryKeys } from "./query-keys";
import { apiKeysResponseSchema, apiKeyCreatedSchema, type ApiKeyItem } from "./schemas";
import { ApiError } from "./errors";

export type ApiKeyView = {
  id: string;
  name: string;
  preview: string;
  active: boolean;
};

/** Resultado do create — a chave crua (`raw`) aparece UMA única vez. */
export type ApiKeyCreatedView = { raw: string; preview: string };

export function mapApiKey(k: ApiKeyItem): ApiKeyView {
  return {
    id: String(k.id),
    name: k.name ?? "",
    preview: k.key_preview ?? "",
    active: k.is_active !== false,
  };
}

/* Mock espelha a chave de demonstração exibida na tela de Canais. */
function fromMock(): ApiKeyView[] {
  return [
    {
      id: "key_demo",
      name: "Painel",
      preview: "pk_demo_DEMO···0000",
      active: true,
    },
  ];
}

export function useApiKeys() {
  return useQuery({
    queryKey: queryKeys.apiKeys.all(),
    queryFn: async (): Promise<ApiKeyView[]> => {
      if (USE_MOCK) return fromMock();
      const { data, error } = await api.GET("/api/v1/manage/api-keys");
      if (error) throw new ApiError(0, "Falha ao carregar as chaves.", error);
      const parsed = apiKeysResponseSchema.safeParse(data);
      if (!parsed.success) {
        throw new ApiError(0, "Resposta de chaves em formato inesperado.", parsed.error);
      }
      return (parsed.data.api_keys ?? []).map(mapApiKey);
    },
  });
}

/* "Regenerar" no backend = criar uma chave nova e revogar a anterior
   (não existe PATCH). A revogação da antiga fica a cargo do chamador,
   que sabe qual é a chave em uso. */
export function useCreateApiKey() {
  const qc = useQueryClient();
  const { projectId } = useActiveProject();
  return useMutation({
    mutationFn: async (input: { name: string }): Promise<ApiKeyCreatedView> => {
      if (USE_MOCK) {
        const rand = Math.random().toString(36).slice(2, 34);
        return {
          raw: `pk_demo_${rand}`,
          preview: `pk_demo_${rand.slice(0, 4)}···${rand.slice(-4)}`,
        };
      }
      const { data, error } = await api.POST("/api/v1/manage/api-keys", {
        body: { name: input.name, project_id: projectId as string },
      });
      if (error) throw new ApiError(0, "Falha ao gerar a chave.", error);
      const parsed = apiKeyCreatedSchema.safeParse(data);
      if (!parsed.success) {
        throw new ApiError(0, "Resposta de criação em formato inesperado.", parsed.error);
      }
      return {
        raw: parsed.data.api_key,
        preview:
          parsed.data.key_preview ??
          `${parsed.data.api_key.slice(0, 8)}···${parsed.data.api_key.slice(-4)}`,
      };
    },
    onError: () => {
      toast.error("Não foi possível gerar a chave.");
    },
    onSettled: () => {
      if (!USE_MOCK) qc.invalidateQueries({ queryKey: queryKeys.apiKeys.all() });
    },
  });
}

export function useRevokeApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string }): Promise<void> => {
      if (USE_MOCK) return;
      const { error } = await api.DELETE("/api/v1/manage/api-keys/{key_id}", {
        params: { path: { key_id: input.id } },
      });
      if (error) throw new ApiError(0, "Falha ao revogar a chave.", error);
    },
    onError: () => {
      toast.error("Não foi possível revogar a chave anterior.");
    },
    onSettled: () => {
      if (!USE_MOCK) qc.invalidateQueries({ queryKey: queryKeys.apiKeys.all() });
    },
  });
}
