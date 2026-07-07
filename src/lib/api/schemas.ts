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

/** Envelope do POST /manage/projects: { project: {...}, created: true }. */
export const projectCreatedSchema = z.object({ project: projectSchema });

/* ── /project/info ─────────────────────────────────────────────────────────
   Duas variantes no backend: com projeto (project_id, name, org_id) ou
   org-only (org_id, org_name, status). org_id é o que o billing precisa. */
export const projectInfoSchema = z.object({
  org_id: z.union([z.string(), z.number()]).nullish(),
  org_name: z.string().nullish(),
  project_id: z.union([z.string(), z.number()]).nullish(),
  name: z.string().nullish(),
});
export type ApiProjectInfo = z.infer<typeof projectInfoSchema>;

/* ── Workspace ─────────────────────────────────────────────────────────────
   management.py: {id, name, slug, description, is_active} (+org_id na lista). */
export const workspaceSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  slug: z.string().nullish(),
  description: z.string().nullish(),
  is_active: z.boolean().nullish(),
});
export type ApiWorkspace = z.infer<typeof workspaceSchema>;

export const workspacesResponseSchema = z.object({
  workspaces: z.array(workspaceSchema).nullish(),
});
export const workspaceCreatedSchema = z.object({ workspace: workspaceSchema });

/* ── Canal ─────────────────────────────────────────────────────────────────
   _channel_dict: channel_type ∈ whatsapp|widget|api|telegram. No create, o
   envelope traz webhook_token/webhook_url_example UMA única vez. */
export const channelSchema = z.object({
  id: z.union([z.string(), z.number()]),
  project_id: z.union([z.string(), z.number()]).nullish(),
  name: z.string(),
  channel_type: z.string().nullish(),
  is_active: z.boolean().nullish(),
  session_strategy: z.string().nullish(),
  outbound_webhook_url: z.string().nullish(),
  allowed_domains: z.array(z.string()).nullish(),
});
export type ApiChannel = z.infer<typeof channelSchema>;

export const channelsResponseSchema = z.object({
  channels: z.array(channelSchema).nullish(),
});
export const channelCreatedSchema = z.object({
  channel: channelSchema,
  webhook_token: z.string().nullish(),
  webhook_url_example: z.string().nullish(),
});
export type ApiChannelCreated = z.infer<typeof channelCreatedSchema>;

/* ── API Keys ──────────────────────────────────────────────────────────────
   Lista traz só o preview; o POST devolve a chave crua UMA única vez. */
export const apiKeySchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string().nullish(),
  key_preview: z.string().nullish(),
  project_id: z.union([z.string(), z.number()]).nullish(),
  is_active: z.boolean().nullish(),
  created_at: z.string().nullish(),
});
export type ApiKeyItem = z.infer<typeof apiKeySchema>;

export const apiKeysResponseSchema = z.object({
  api_keys: z.array(apiKeySchema).nullish(),
});
export const apiKeyCreatedSchema = z.object({
  api_key: z.string(),
  key_preview: z.string().nullish(),
  name: z.string().nullish(),
  project_id: z.union([z.string(), z.number()]).nullish(),
});
export type ApiKeyCreated = z.infer<typeof apiKeyCreatedSchema>;

/* ── Conversas ─────────────────────────────────────────────────────────────
   platform.py: tokens = input+output somados; created_at ISO. */
export const conversationSchema = z.object({
  id: z.union([z.string(), z.number()]),
  session_id: z.string().nullish(),
  user_external_id: z.string().nullish(),
  channel_type: z.string().nullish(),
  tokens: z.number().nullish(),
  agent_used: z.string().nullish(),
  tools_called: z.string().nullish(),
  latency_ms: z.number().nullish(),
  status: z.string().nullish(),
  created_at: z.string().nullish(),
});
export type ApiConversation = z.infer<typeof conversationSchema>;

export const conversationsResponseSchema = z.object({
  conversations: z.array(conversationSchema).nullish(),
  total: z.number().nullish(),
});

/* ── Chat ──────────────────────────────────────────────────────────────────
   POST /chat/message (bloqueante) e eventos do SSE /chat/message/stream:
   data: {"type":"token","content":…} · {"type":"done",…} · [DONE]. */
export const chatMessageResponseSchema = z.object({
  job_id: z.string().nullish(),
  session_id: z.string().nullish(),
  response: z.string().nullish(),
  input_tokens: z.number().nullish(),
  output_tokens: z.number().nullish(),
  processing_time_ms: z.number().nullish(),
  success: z.boolean().nullish(),
});
export type ApiChatMessageResponse = z.infer<typeof chatMessageResponseSchema>;

export const chatStreamEventSchema = z.object({
  type: z.string(),
  content: z.string().nullish(),
  job_id: z.string().nullish(),
  session_id: z.string().nullish(),
});
export type ApiChatStreamEvent = z.infer<typeof chatStreamEventSchema>;

export const chatHistoryResponseSchema = z.object({
  session_id: z.string().nullish(),
  messages: z.array(z.unknown()).nullish(),
  total_messages: z.number().nullish(),
});

/* ── Billing ───────────────────────────────────────────────────────────────
   /billing/plans é público; /billing/balance exige header X-Org-Id. */
export const billingPlanSchema = z.object({
  id: z.union([z.string(), z.number()]).nullish(),
  name: z.string().nullish(),
  display_name: z.string().nullish(),
  price_brl: z.number().nullish(),
  monthly_credits: z.number().nullish(),
  max_projects: z.number().nullish(),
  max_agents: z.number().nullish(),
  byok: z.boolean().nullish(),
});
export type ApiBillingPlan = z.infer<typeof billingPlanSchema>;

export const billingPlansResponseSchema = z.object({
  plans: z.array(billingPlanSchema).nullish(),
});

export const billingBalanceSchema = z.object({
  plan: z.string().nullish(),
  total_tokens: z.number().nullish(),
  used_tokens: z.number().nullish(),
  available: z.number().nullish(),
  usage_pct: z.number().nullish(),
  is_suspended: z.boolean().nullish(),
  period_end: z.string().nullish(),
});
export type ApiBillingBalance = z.infer<typeof billingBalanceSchema>;

/* ── Studio — payload rules ────────────────────────────────────────────────
   studio.py: rule.to_dict(); trigger/action são dicts livres. */
export const payloadRuleSchema = z.object({
  id: z.union([z.string(), z.number()]),
  project_id: z.union([z.string(), z.number()]).nullish(),
  name: z.string(),
  description: z.string().nullish(),
  trigger: z.record(z.string(), z.unknown()).nullish(),
  action: z.record(z.string(), z.unknown()).nullish(),
  scope: z.string().nullish(),
  order_index: z.number().nullish(),
  is_active: z.boolean().nullish(),
  created_by_nl: z.string().nullish(),
  created_at: z.string().nullish(),
});
export type ApiPayloadRule = z.infer<typeof payloadRuleSchema>;

export const payloadRulesResponseSchema = z.object({
  rules: z.array(payloadRuleSchema).nullish(),
  total: z.number().nullish(),
});

export const interpretResponseSchema = z.object({
  instruction: z.string().nullish(),
  rules: z.array(z.unknown()).nullish(),
  count: z.number().nullish(),
});

/* ── /auth/register ────────────────────────────────────────────────────────
   A api_key crua aparece UMA única vez — o onboarding grava via setApiKey()
   e exibe com botão de copiar antes de navegar. */
export const registerResponseSchema = z.object({
  org_id: z.union([z.string(), z.number()]).nullish(),
  org_name: z.string().nullish(),
  plan: z.string().nullish(),
  api_key: z.string(),
  dashboard_url: z.string().nullish(),
});
export type ApiRegisterResponse = z.infer<typeof registerResponseSchema>;
