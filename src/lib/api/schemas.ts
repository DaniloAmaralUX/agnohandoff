/* Schemas Zod que espelham as respostas da API efetivamente consumidas.
   O OpenAPI tipa os corpos de GET como `unknown` (o servidor devolve shapes em
   runtime), então validamos aqui em runtime antes de mapear para a view.

   Campos derivados de schema.ts (AgentCreate / ProjectCreate + entidade) e do
   que os mappers leem em agents.ts / projects.ts. Campos opcionais/anuláveis
   seguem o contrato (role, model_id, is_active, description, status,
   workspace_id) para que MOCK e API validem no mesmo schema. */
import { z } from "zod";

/* ── Agente ────────────────────────────────────────────────────────────────
   Consumido em agents.ts: a.id, a.name, a.role, a.model_id, a.is_active.
   No schema.ts: name (obrigatório), role (nullable), model_id (string com
   default no backend), is_active (boolean com default). id sempre presente na
   entidade de resposta. */
export const agentSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  role: z.string().nullish(),
  model_id: z.string().nullish(),
  is_active: z.boolean().nullish(),
});
export type ApiAgent = z.infer<typeof agentSchema>;

/** Envelope da lista de agentes: { agents?: [...] }. */
export const agentsResponseSchema = z.object({
  agents: z.array(agentSchema).nullish(),
});
export type ApiAgentsResponse = z.infer<typeof agentsResponseSchema>;

/* ── Projeto ───────────────────────────────────────────────────────────────
   Consumido em projects.ts: p.id, p.name, p.description, p.status,
   p.workspace_id. No schema.ts: name (obrigatório), description (nullable),
   status (nullable, string), workspace_id (nullable). */
export const projectSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  description: z.string().nullish(),
  status: z.string().nullish(),
  workspace_id: z.string().nullish(),
});
export type ApiProject = z.infer<typeof projectSchema>;

/** Envelope da lista de projetos: { projects?: [...] }. */
export const projectsResponseSchema = z.object({
  projects: z.array(projectSchema).nullish(),
});
export type ApiProjectsResponse = z.infer<typeof projectsResponseSchema>;
