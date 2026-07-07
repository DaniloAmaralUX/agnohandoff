"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
import { USE_MOCK } from "@/lib/config";
import { org } from "@/lib/data";
import { queryKeys } from "./query-keys";
import { projectInfoSchema, type ApiProjectInfo } from "./schemas";
import { ApiError } from "./errors";

/* View do /project/info — a fonte do org_id que o billing usa como header
   X-Org-Id (o backend autentica billing por org, não por API key). */
export type ProjectInfoView = {
  orgId: string;
  projectId?: string;
  name?: string;
};

export function mapApiProjectInfo(info: ApiProjectInfo): ProjectInfoView {
  return {
    orgId: String(info.org_id ?? ""),
    projectId: info.project_id != null ? String(info.project_id) : undefined,
    name: info.name ?? info.org_name ?? undefined,
  };
}

function fromMock(): ProjectInfoView {
  return { orgId: "org_vitalmed", projectId: "prj_sofia", name: org.name };
}

export function useProjectInfo() {
  return useQuery({
    queryKey: queryKeys.platform.info(),
    staleTime: 5 * 60_000, // org_id não muda durante a sessão
    queryFn: async (): Promise<ProjectInfoView> => {
      if (USE_MOCK) return fromMock();
      const { data, error } = await api.GET("/api/v1/project/info");
      if (error) throw new ApiError(0, "Falha ao carregar dados da conta.", error);
      const parsed = projectInfoSchema.safeParse(data);
      if (!parsed.success) {
        throw new ApiError(
          0,
          "Resposta de /project/info em formato inesperado.",
          parsed.error,
        );
      }
      return mapApiProjectInfo(parsed.data);
    },
  });
}
