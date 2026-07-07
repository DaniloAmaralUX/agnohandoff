"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "./client";
import { USE_MOCK } from "@/lib/config";
import { channels as mockChannels } from "@/lib/data";
import { useActiveProject } from "@/lib/project-context";
import { queryKeys } from "./query-keys";
import {
  channelsResponseSchema,
  channelCreatedSchema,
  type ApiChannel,
} from "./schemas";
import { ApiError } from "./errors";

/* View normalizada. type usa os rótulos da UI; o backend fala
   whatsapp|widget|api|telegram (Instagram existe só no mock — gap no HANDOFF). */
export type ChannelView = {
  id: string;
  type: string;
  label: string;
  project: string;
  status: "Conectado" | "Pendente" | "Desconectado" | string;
  detail: string;
};

/** Resultado do create em modo API — o webhook_token aparece UMA única vez. */
export type ChannelCreated = ChannelView & {
  webhookToken?: string;
  webhookUrlExample?: string;
};

const TYPE_PT: Record<string, string> = {
  whatsapp: "WhatsApp",
  widget: "Web Widget",
  api: "API",
  telegram: "Telegram",
};

const TYPE_API: Record<string, string> = {
  WhatsApp: "whatsapp",
  "Web Widget": "widget",
  API: "api",
  Telegram: "telegram",
};

export function mapApiChannel(c: ApiChannel, projectName?: string): ChannelView {
  const type = c.channel_type ?? "";
  return {
    id: String(c.id),
    type: TYPE_PT[type] ?? type,
    label: c.name ?? "",
    project: projectName ?? "",
    status: c.is_active === false ? "Desconectado" : "Conectado",
    detail: c.outbound_webhook_url || "—",
  };
}

function fromMock(): ChannelView[] {
  return mockChannels.map((c) => ({ ...c }));
}

/* Padrão ANINHADO: canais pertencem ao projeto ativo (seletor na topbar). */
export function useChannels() {
  const { projectId, project } = useActiveProject();
  return useQuery({
    queryKey: queryKeys.channels.list(projectId ?? "mock"),
    enabled: USE_MOCK || Boolean(projectId),
    queryFn: async (): Promise<ChannelView[]> => {
      if (USE_MOCK) return fromMock();
      const { data, error } = await api.GET(
        "/api/v1/manage/projects/{project_id}/channels",
        { params: { path: { project_id: projectId as string } } },
      );
      if (error) throw new ApiError(0, "Falha ao carregar canais.", error);
      const parsed = channelsResponseSchema.safeParse(data);
      if (!parsed.success) {
        throw new ApiError(0, "Resposta de canais em formato inesperado.", parsed.error);
      }
      return (parsed.data.channels ?? []).map((c) =>
        mapApiChannel(c, project?.name),
      );
    },
  });
}

export function useCreateChannel() {
  const qc = useQueryClient();
  const { projectId, projects } = useActiveProject();
  return useMutation({
    mutationFn: async (input: {
      label: string;
      type: string;
      project: string;
      detail?: string;
    }): Promise<ChannelCreated> => {
      if (USE_MOCK) {
        return {
          id: `ch_${Date.now()}`,
          type: input.type,
          label: input.label,
          project: input.project,
          status: "Pendente",
          detail: input.detail?.trim() || "Aguardando configuração",
        };
      }
      // O form seleciona o projeto pelo nome; resolve para o id real
      // (fallback: projeto ativo da topbar).
      const targetId =
        projects.find((p) => p.name === input.project)?.id ?? projectId;
      const { data, error } = await api.POST(
        "/api/v1/manage/projects/{project_id}/channels",
        {
          params: { path: { project_id: targetId as string } },
          body: {
            name: input.label,
            channel_type: TYPE_API[input.type] ?? "api",
            session_strategy: "user_per_day",
            outbound_webhook_url: input.detail?.trim() || null,
          },
        },
      );
      if (error) throw new ApiError(0, "Falha ao criar o canal.", error);
      const parsed = channelCreatedSchema.safeParse(data);
      if (!parsed.success) {
        throw new ApiError(0, "Resposta de criação em formato inesperado.", parsed.error);
      }
      return {
        ...mapApiChannel(parsed.data.channel, input.project),
        webhookToken: parsed.data.webhook_token ?? undefined,
        webhookUrlExample: parsed.data.webhook_url_example ?? undefined,
      };
    },
    onSuccess: (created) => {
      qc.setQueriesData<ChannelView[]>(
        { queryKey: queryKeys.channels.all() },
        (old) => [created, ...(old ?? [])],
      );
      toast.success("Canal adicionado.", {
        description: created.webhookToken
          ? `Webhook token (copie agora): ${created.webhookToken}`
          : "Conclua a configuração para conectá-lo.",
        ...(created.webhookToken
          ? {
              duration: 12000,
              action: {
                label: "Copiar",
                onClick: () => {
                  navigator.clipboard
                    ?.writeText(created.webhookToken ?? "")
                    .catch(() => {});
                },
              },
            }
          : {}),
      });
    },
    onError: () => {
      toast.error("Não foi possível criar o canal.");
    },
    onSettled: () => {
      if (!USE_MOCK) qc.invalidateQueries({ queryKey: queryKeys.channels.all() });
    },
  });
}
