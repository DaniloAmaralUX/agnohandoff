"use client";

/* Contexto do projeto selecionado (HANDOFF §2: substituir o projects[0]
   hardcoded por um seletor real na topbar).

   O id vive em localStorage — mesma filosofia do api_key em auth.ts: sessão
   simples, sem servidor. O default do contexto (projectId null + setter no-op)
   permite que hooks consumidores funcionem fora do Provider (testes de unidade
   renderizam sem ele) caindo no fallback "primeiro projeto da lista". */

import * as React from "react";
import { useProjects, type ProjectView } from "@/lib/api/projects";

const STORAGE_KEY = "agnohub_project_id";

type ProjectContextValue = {
  projectId: string | null;
  setProjectId: (id: string) => void;
};

const ProjectContext = React.createContext<ProjectContextValue>({
  projectId: null,
  setProjectId: () => {},
});

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializer: lê o localStorage uma vez, no cliente. No SSR começa
  // null e o fallback (primeiro projeto) cobre até a hidratação.
  const [projectId, setProjectIdState] = React.useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(STORAGE_KEY);
  });

  const setProjectId = React.useCallback((id: string) => {
    setProjectIdState(id);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const value = React.useMemo(
    () => ({ projectId, setProjectId }),
    [projectId, setProjectId],
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useSelectedProject(): ProjectContextValue {
  return React.useContext(ProjectContext);
}

/* Projeto ativo = selecionado no contexto, ou o primeiro da lista como
   fallback (mesmo comportamento anterior do useAgents). Ponto único que os
   hooks aninhados (agentes, canais, regras, memória) consomem. */
export function useActiveProject(): {
  projectId: string | undefined;
  project: ProjectView | undefined;
  projects: ProjectView[];
  setProjectId: (id: string) => void;
  isLoading: boolean;
} {
  const { projectId, setProjectId } = useSelectedProject();
  const { data, isLoading } = useProjects();
  const projects = data ?? [];
  const project =
    projects.find((p) => p.id === projectId) ?? projects[0];
  return { projectId: project?.id, project, projects, setProjectId, isLoading };
}
