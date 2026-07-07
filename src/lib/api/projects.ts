"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "./client";
import { USE_MOCK } from "@/lib/config";
import { projects as mockProjects } from "@/lib/data";
import { queryKeys } from "./query-keys";
import { projectsResponseSchema, type ApiProject } from "./schemas";
import { ApiError } from "./errors";

/* View normalizada que a tela renderiza — igual para mock e API. */
export type ProjectView = {
  id: string;
  name: string;
  description: string;
  status: "Ativo" | "Rascunho" | "Pausado" | string;
  workspace: string;
  agents?: number;
  channels?: number;
};

const STATUS_PT: Record<string, string> = {
  active: "Ativo",
  draft: "Rascunho",
  paused: "Pausado",
  archived: "Arquivado",
};

/* Converte um projeto da API (já validado por Zod) na view. */
export function mapApiProject(p: ApiProject): ProjectView {
  const status = p.status ?? "";
  return {
    id: String(p.id),
    name: p.name ?? "",
    description: p.description ?? "",
    status: STATUS_PT[status] ?? status,
    workspace: (p.workspace_id ?? "—").slice(0, 8),
  };
}

function fromMock(): ProjectView[] {
  return mockProjects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    workspace: p.workspace,
    agents: p.agents,
    channels: p.channels,
  }));
}

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all(),
    queryFn: async (): Promise<ProjectView[]> => {
      if (USE_MOCK) return fromMock();
      const { data, error } = await api.GET("/api/v1/manage/projects");
      if (error) throw new ApiError(0, "Falha ao carregar projetos.", error);
      const parsed = projectsResponseSchema.safeParse(data);
      if (!parsed.success) {
        throw new ApiError(
          0,
          "Resposta de projetos em formato inesperado.",
          parsed.error,
        );
      }
      return (parsed.data.projects ?? []).map(mapApiProject);
    },
  });
}

/* REFERÊNCIA — criação: adiciona um projeto ao cache de forma otimista.
   Em modo mock cria localmente; em modo API o dev troca o mutationFn por um
   POST /manage/projects (ver HANDOFF). Mesmo padrão de useToggleAgent. */
export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      workspace: string;
    }): Promise<ProjectView> => {
      // Em modo API: POST /manage/projects aqui.
      return {
        id: `prj_${Date.now()}`,
        name: input.name,
        description: input.description ?? "",
        status: "Rascunho",
        workspace: input.workspace,
        agents: 0,
        channels: 0,
      };
    },
    onSuccess: (created) => {
      qc.setQueryData<ProjectView[]>(queryKeys.projects.all(), (old) => [
        created,
        ...(old ?? []),
      ]);
      toast.success("Projeto criado.", {
        description: "Configure agentes e canais para começar.",
      });
    },
  });
}
