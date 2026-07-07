/* Factory central de query-keys do TanStack Query.
   Uma única fonte de verdade para as chaves de cache — evita arrays inline
   divergentes ("agents" digitado à mão em N lugares) e mantém coerentes o
   fetch, a mutação otimista e a invalidação.

   Padrão ANINHADO preservado: agentes pertencem a um projeto, então a chave
   inclui o projectId (ou "mock" no modo demo) — ver useAgents. */

export const queryKeys = {
  projects: {
    all: () => ["projects"] as const,
  },
  agents: {
    /** Prefixo — bate com todas as listas de agentes (qualquer projeto).
        Usado em cancelQueries/getQueriesData/setQueriesData/invalidateQueries. */
    all: () => ["agents"] as const,
    /** Lista de agentes de um projeto específico (ou "mock" no modo demo). */
    list: (projectId: string) => ["agents", projectId] as const,
  },
} as const;
