"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "./client";
import { USE_MOCK } from "@/lib/config";
import { projects as mockProjects } from "@/lib/data";
import { queryKeys } from "./query-keys";
import {
  projectsResponseSchema,
  projectCreatedSchema,
  type ApiProject,
} from "./schemas";
import { ApiError } from "./errors";

/* View normalizada que a tela renderiza — igual para mock e API. */
export type ProjectView = {
  id: string;
  name: string;
  description: string;
  status: "Ativo" | "Rascunho" | "Pausado" | string;
  workspace: string;
  /** Id completo do workspace — permite resolver o nome via useWorkspaces. */
  workspaceId?: string;
  agents?: number;
  channels?: number;
  /** Config de memória (só em modo API) — consumida pela tela /memory. */
  memoryStrategy?: string;
  contextWindow?: number;
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
    workspaceId: p.workspace_id ?? undefined,
    memoryStrategy: p.memory_strategy ?? undefined,
    contextWindow: p.context_window_size ?? undefined,
  };
}

function fromMock(): ProjectView[] {
  return mockProjects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    workspace: p.workspace,
    workspaceId: p.workspaceId,
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

/* Slug válido para o backend (^[a-z0-9-]+$, 2..100). */
export function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return slug.length >= 2 ? slug : `projeto-${slug}`.slice(0, 100);
}

/* REFERÊNCIA — criação: adiciona um projeto ao cache de forma otimista.
   Em modo mock cria localmente; em modo API faz POST /manage/projects
   (o backend responde {project: {...}}, status inicial "draft"). */
export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      workspace: string;
    }): Promise<ProjectView> => {
      if (USE_MOCK) {
        return {
          id: `prj_${Date.now()}`,
          name: input.name,
          description: input.description ?? "",
          status: "Rascunho",
          workspace: input.workspace,
          agents: 0,
          channels: 0,
        };
      }
      const { data, error } = await api.POST("/api/v1/manage/projects", {
        body: {
          name: input.name,
          slug: slugify(input.name),
          description: input.description || null,
          // Defaults do builder — o usuário refina depois em Memória/Builder.
          agno_type: "agent",
          memory_strategy: "hybrid",
          context_strategy: "adaptive",
          context_window_size: 10,
        },
      });
      if (error) throw new ApiError(0, "Falha ao criar o projeto.", error);
      const parsed = projectCreatedSchema.safeParse(data);
      if (!parsed.success) {
        throw new ApiError(0, "Resposta de criação em formato inesperado.", parsed.error);
      }
      return mapApiProject(parsed.data.project);
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
    onError: (err) => {
      toast.error(
        err instanceof ApiError && err.status === 409
          ? "Já existe um projeto com esse nome."
          : "Não foi possível criar o projeto.",
      );
    },
    onSettled: () => {
      if (!USE_MOCK) qc.invalidateQueries({ queryKey: queryKeys.projects.all() });
    },
  });
}
