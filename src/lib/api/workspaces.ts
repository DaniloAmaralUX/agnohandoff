"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "./client";
import { USE_MOCK } from "@/lib/config";
import { workspaces as mockWorkspaces } from "@/lib/data";
import { queryKeys } from "./query-keys";
import { slugify } from "./projects";
import {
  workspacesResponseSchema,
  workspaceCreatedSchema,
  type ApiWorkspace,
} from "./schemas";
import { ApiError } from "./errors";

/* View normalizada — igual para mock e API. projects/members só existem no
   mock (o backend não agrega contagens; a tela deriva projects da lista de
   projetos e oculta members em modo API — gap anotado no HANDOFF). */
export type WorkspaceView = {
  id: string;
  name: string;
  description: string;
  projects?: number;
  members?: number;
};

export function mapApiWorkspace(w: ApiWorkspace): WorkspaceView {
  return {
    id: String(w.id),
    name: w.name ?? "",
    description: w.description ?? "",
  };
}

function fromMock(): WorkspaceView[] {
  return mockWorkspaces.map((w) => ({ ...w }));
}

export function useWorkspaces() {
  return useQuery({
    queryKey: queryKeys.workspaces.all(),
    queryFn: async (): Promise<WorkspaceView[]> => {
      if (USE_MOCK) return fromMock();
      const { data, error } = await api.GET("/api/v1/manage/workspaces");
      if (error) throw new ApiError(0, "Falha ao carregar workspaces.", error);
      const parsed = workspacesResponseSchema.safeParse(data);
      if (!parsed.success) {
        throw new ApiError(
          0,
          "Resposta de workspaces em formato inesperado.",
          parsed.error,
        );
      }
      return (parsed.data.workspaces ?? []).map(mapApiWorkspace);
    },
  });
}

export function useCreateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
    }): Promise<WorkspaceView> => {
      if (USE_MOCK) {
        return {
          id: `ws_${Date.now()}`,
          name: input.name,
          description: input.description ?? "",
          projects: 0,
          members: 1,
        };
      }
      const { data, error } = await api.POST("/api/v1/manage/workspaces", {
        body: {
          name: input.name,
          slug: slugify(input.name),
          description: input.description || null,
        },
      });
      if (error) throw new ApiError(0, "Falha ao criar o workspace.", error);
      const parsed = workspaceCreatedSchema.safeParse(data);
      if (!parsed.success) {
        throw new ApiError(0, "Resposta de criação em formato inesperado.", parsed.error);
      }
      return mapApiWorkspace(parsed.data.workspace);
    },
    onSuccess: (created) => {
      qc.setQueryData<WorkspaceView[]>(queryKeys.workspaces.all(), (old) => [
        created,
        ...(old ?? []),
      ]);
      toast.success("Workspace criado.", {
        description: "Adicione projetos e convide sua equipe.",
      });
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError && err.status === 409
          ? "Já existe um workspace com esse nome."
          : "Não foi possível criar o workspace.",
      );
    },
    onSettled: () => {
      if (!USE_MOCK) qc.invalidateQueries({ queryKey: queryKeys.workspaces.all() });
    },
  });
}
