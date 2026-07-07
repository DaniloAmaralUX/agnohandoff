"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "./client";
import { USE_MOCK } from "@/lib/config";
import { useActiveProject } from "@/lib/project-context";
import { queryKeys } from "./query-keys";
import { ApiError } from "./errors";

/* Estratégias REAIS do backend (ProjectUpdate.memory_strategy) — em modo API
   a tela /memory mostra estas, não as conceituais da demo. */
export const API_MEMORY_STRATEGIES = [
  {
    key: "hybrid",
    name: "Híbrida (Palace + banco)",
    desc: "Memória longa em arquivos Markdown + perfil operacional no banco.",
  },
  {
    key: "palace_only",
    name: "Memory Palace",
    desc: "Só a memória longa por usuário (fatos, preferências, eventos).",
  },
  {
    key: "db_only",
    name: "Somente banco",
    desc: "Só o perfil operacional e a janela de mensagens recentes.",
  },
  {
    key: "none",
    name: "Sem memória longa",
    desc: "Cada sessão começa do zero — nada é lembrado entre conversas.",
  },
] as const;

export function useUpdateProjectMemory() {
  const qc = useQueryClient();
  const { projectId } = useActiveProject();
  return useMutation({
    mutationFn: async (input: {
      memoryStrategy: string;
      contextWindow: number;
    }): Promise<void> => {
      if (USE_MOCK) return;
      const { error } = await api.PATCH("/api/v1/manage/projects/{project_id}", {
        params: { path: { project_id: projectId as string } },
        body: {
          memory_strategy: input.memoryStrategy,
          context_window_size: input.contextWindow,
        },
      });
      if (error) throw new ApiError(0, "Falha ao salvar a memória.", error);
    },
    onSuccess: () => {
      toast.success("Configurações de memória salvas.");
    },
    onError: () => {
      toast.error("Não foi possível salvar as configurações de memória.");
    },
    onSettled: () => {
      if (!USE_MOCK) qc.invalidateQueries({ queryKey: queryKeys.projects.all() });
    },
  });
}
