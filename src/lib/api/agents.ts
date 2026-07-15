"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "./client";
import { USE_MOCK } from "@/lib/config";
import { agents as mockAgents } from "@/lib/data";
import { useActiveProject } from "@/lib/project-context";
import { queryKeys } from "./query-keys";
import { agentsResponseSchema, type ApiAgent } from "./schemas";
import { ApiError } from "./errors";

/* View normalizada (mock e API convergem para o mesmo shape que a tela usa). */
export type AgentView = {
  id: string;
  name: string;
  role: string;
  model: string;
  status: "Publicado" | "Rascunho" | "Treinando" | string;
  memory?: boolean; // a API ainda não retorna — vira tarefa do dev (ver HANDOFF)
  tools?: number; // idem
  tone: string;
};

const tones = ["heat", "bluetron", "forest", "amethyst", "honey"];

/* Converte um agente da API (já validado por Zod) na view. O tom é derivado
   do índice — a API ainda não expõe um tom de avatar (ver HANDOFF). */
export function mapApiAgent(a: ApiAgent, index: number): AgentView {
  return {
    id: String(a.id),
    name: a.name ?? "",
    role: a.role ?? "",
    model: a.model_id ?? "",
    status: a.is_active ? "Publicado" : "Rascunho",
    tone: tones[index % tones.length],
  };
}

function fromMock(): AgentView[] {
  return mockAgents.map((a) => ({
    id: a.id,
    name: a.name,
    role: a.role,
    model: a.model,
    status: a.status,
    memory: a.memory,
    tools: a.tools,
    tone: a.avatarTone,
  }));
}

/* Padrão ANINHADO: agentes pertencem a um projeto.
   O projeto vem do seletor na topbar (useActiveProject) — fallback no
   primeiro da lista quando nada foi selecionado (mesma semântica de antes). */
export function useAgents() {
  const { projectId } = useActiveProject();

  return useQuery({
    queryKey: queryKeys.agents.list(projectId ?? "mock"),
    enabled: USE_MOCK || Boolean(projectId),
    queryFn: async (): Promise<AgentView[]> => {
      if (USE_MOCK) return fromMock();
      const { data, error } = await api.GET(
        "/api/v1/manage/projects/{project_id}/agents",
        { params: { path: { project_id: projectId as string } } },
      );
      if (error) throw new ApiError(0, "Falha ao carregar agentes.", error);
      const parsed = agentsResponseSchema.safeParse(data);
      if (!parsed.success) {
        throw new ApiError(
          0,
          "Resposta de agentes em formato inesperado.",
          parsed.error,
        );
      }
      return (parsed.data.agents ?? []).map(mapApiAgent);
    },
  });
}

/* REFERÊNCIA — mutação OTIMISTA: publica/despublica o agente.
   Atualiza a UI na hora (onMutate), reverte em erro (onError), toast.
   Em modo API: PATCH is_active no agente do projeto ativo. */
export function useToggleAgent() {
  const qc = useQueryClient();
  const { projectId } = useActiveProject();
  return useMutation({
    mutationFn: async ({ id, publish }: { id: string; publish: boolean }) => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 450));
        return publish;
      }
      const { error } = await api.PATCH(
        "/api/v1/manage/projects/{project_id}/agents/{agent_id}",
        {
          params: { path: { project_id: projectId as string, agent_id: id } },
          body: { is_active: publish },
        },
      );
      if (error) throw new ApiError(0, "Falha ao atualizar o agente.", error);
      return publish;
    },
    onMutate: async ({ id, publish }) => {
      await qc.cancelQueries({ queryKey: queryKeys.agents.all() });
      const prev = qc.getQueriesData<AgentView[]>({
        queryKey: queryKeys.agents.all(),
      });
      qc.setQueriesData<AgentView[]>({ queryKey: queryKeys.agents.all() }, (old) =>
        old?.map((a) => (a.id === id ? { ...a, status: publish ? "Publicado" : "Rascunho" } : a)),
      );
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      ctx?.prev?.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error("Não foi possível atualizar o agente. Alteração revertida.");
    },
    onSuccess: (publish) => {
      toast.success(publish ? "Agente publicado." : "Agente movido para rascunho.", {
        description: USE_MOCK ? "Demo: não persiste ao recarregar." : undefined,
      });
    },
    onSettled: () => {
      if (!USE_MOCK) qc.invalidateQueries({ queryKey: queryKeys.agents.all() });
    },
  });
}
