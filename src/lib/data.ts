/* ============================================================================
   AgnoHub — dados de exemplo do protótipo (mock).
   Baseado no seed real: Org Vitalmed (PRO), workspaces, projeto Sofia, agentes,
   canal WhatsApp. Enriquecido para uma demo verossímil ao stakeholder.
   Nada aqui toca o backend — é 100% presentation.
   ============================================================================ */

export type Plan = "Free" | "Starter" | "Pro" | "Scale";

export const org = {
  name: "Vitalmed",
  plan: "Pro" as Plan,
  logoInitials: "VM",
  seats: 8,
  seatsUsed: 5,
};

export type Workspace = {
  id: string;
  name: string;
  description: string;
  projects: number;
  members: number;
};

export const workspaces: Workspace[] = [
  { id: "ws_atend", name: "Atendimento Clínico", description: "Triagem, agendamento e suporte ao paciente", projects: 2, members: 4 },
  { id: "ws_com", name: "Comercial", description: "Qualificação de leads e pós-venda", projects: 1, members: 3 },
];

export type Project = {
  id: string;
  name: string;
  workspaceId: string;
  workspace: string;
  description: string;
  agents: number;
  channels: number;
  status: "Ativo" | "Rascunho" | "Pausado";
};

export const projects: Project[] = [
  { id: "prj_sofia", name: "Sofia", workspaceId: "ws_atend", workspace: "Atendimento Clínico", description: "Assistente principal de triagem e agendamento", agents: 3, channels: 2, status: "Ativo" },
  { id: "prj_recep", name: "Recepção 24h", workspaceId: "ws_atend", workspace: "Atendimento Clínico", description: "Cobertura noturna e finais de semana", agents: 1, channels: 1, status: "Rascunho" },
  { id: "prj_leo", name: "Léo", workspaceId: "ws_com", workspace: "Comercial", description: "SDR virtual para qualificação de leads", agents: 2, channels: 2, status: "Ativo" },
];

export type Agent = {
  id: string;
  name: string;
  role: string;
  project: string;
  model: string;
  status: "Publicado" | "Rascunho" | "Treinando";
  memory: boolean;
  tools: number;
  avatarTone: "heat" | "bluetron" | "forest" | "amethyst" | "honey";
};

export const agents: Agent[] = [
  { id: "agt_sofia", name: "Sofia", role: "Triagem de sintomas", project: "Sofia", model: "Claude Opus 4.8", status: "Publicado", memory: true, tools: 4, avatarTone: "heat" },
  { id: "agt_agenda", name: "Dr. Agenda", role: "Agendamento de consultas", project: "Sofia", model: "Claude Sonnet 4.6", status: "Publicado", memory: true, tools: 3, avatarTone: "bluetron" },
  { id: "agt_fin", name: "Financeiro", role: "Faturas e convênios", project: "Sofia", model: "Claude Haiku 4.5", status: "Rascunho", memory: false, tools: 2, avatarTone: "forest" },
  { id: "agt_leo", name: "Léo", role: "Qualificação de leads", project: "Léo", model: "Claude Sonnet 4.6", status: "Publicado", memory: true, tools: 5, avatarTone: "amethyst" },
];

export type Channel = {
  id: string;
  type: "WhatsApp" | "Web Widget" | "Telegram" | "Instagram";
  label: string;
  project: string;
  status: "Conectado" | "Pendente" | "Desconectado";
  detail: string;
};

export const channels: Channel[] = [
  { id: "ch_wa", type: "WhatsApp", label: "WhatsApp Business", project: "Sofia", status: "Conectado", detail: "+55 11 98765-4321" },
  { id: "ch_web", type: "Web Widget", label: "Widget do site", project: "Sofia", status: "Conectado", detail: "vitalmed.com.br" },
  { id: "ch_tg", type: "Telegram", label: "Bot Telegram", project: "Léo", status: "Pendente", detail: "@vitalmed_leo_bot" },
  { id: "ch_ig", type: "Instagram", label: "Direct do Instagram", project: "Léo", status: "Desconectado", detail: "@vitalmed" },
];

export type Tool = {
  id: string;
  name: string;
  kind: "MCP" | "Python" | "HTTP";
  description: string;
  status: "Ativo" | "Inativo";
};

export const tools: Tool[] = [
  { id: "t_crm", name: "CRM Vitalmed", kind: "MCP", description: "Consulta e cria registros de pacientes no CRM", status: "Ativo" },
  { id: "t_agenda", name: "Agenda Médica", kind: "MCP", description: "Verifica horários e agenda consultas", status: "Ativo" },
  { id: "t_cep", name: "Buscar CEP", kind: "HTTP", description: "Resolve endereço a partir do CEP", status: "Ativo" },
  { id: "t_calc", name: "Calcular reembolso", kind: "Python", description: "Calcula reembolso de convênio", status: "Inativo" },
];

export type Conversation = {
  id: string;
  contact: string;
  channel: Channel["type"];
  agent: string;
  preview: string;
  time: string;
  status: "Resolvido" | "Ativo" | "Aguardando";
  unread?: boolean;
};

export const conversations: Conversation[] = [
  { id: "c1", contact: "Maria Oliveira", channel: "WhatsApp", agent: "Sofia", preview: "Perfeito, consulta confirmada para quinta às 14h. Até lá!", time: "há 2 min", status: "Resolvido" },
  { id: "c2", contact: "João Santos", channel: "WhatsApp", agent: "Dr. Agenda", preview: "Você prefere manhã ou tarde para o retorno?", time: "há 8 min", status: "Ativo", unread: true },
  { id: "c3", contact: "Ana Costa", channel: "Web Widget", agent: "Sofia", preview: "Estou com dor de cabeça há 3 dias e um pouco de febre...", time: "há 12 min", status: "Ativo", unread: true },
  { id: "c4", contact: "Carlos Lima", channel: "WhatsApp", agent: "Financeiro", preview: "O convênio Unimed cobre esse procedimento?", time: "há 34 min", status: "Aguardando" },
  { id: "c5", contact: "Beatriz Souza", channel: "Telegram", agent: "Léo", preview: "Obrigada pelas informações sobre o plano!", time: "há 1 h", status: "Resolvido" },
  { id: "c6", contact: "Pedro Alves", channel: "Web Widget", agent: "Sofia", preview: "Qual o endereço da unidade Moema?", time: "há 2 h", status: "Resolvido" },
];

export type Metric = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  hint: string;
};

export const metrics: Metric[] = [
  { label: "Conversas (7d)", value: "1.284", delta: "+12,4%", trend: "up", hint: "vs. semana anterior" },
  { label: "Taxa de resolução", value: "87%", delta: "+3,1%", trend: "up", hint: "sem intervenção humana" },
  { label: "Resposta média", value: "1,8s", delta: "-0,4s", trend: "up", hint: "primeira resposta" },
  // Alinhado ao plano canônico (src/lib/plan-data.ts): 152K de 2M = 7,6%.
  { label: "Tokens (mês)", value: "152K", delta: "7,6% do limite", trend: "up", hint: "plano Pro · 2M" },
];

// #84: analytics repetia 4 KPIs do dashboard. Aqui KPIs próprios da tela —
// leitura de performance (latência, custo, handoff) e não sanidade diária.
// #8: labels sem sufixo temporal ("7d"/"mês") — os cards reagem ao seletor
// global de período; o rótulo diz "no período" implicitamente via CardDescription.
export const analyticsMetrics: Metric[] = [
  { label: "Latência p95", value: "1,4s", delta: "-120ms", trend: "up", hint: "no período" },
  { label: "Custo estimado", value: "R$ 486", delta: "+8,2%", trend: "down", hint: "no período" },
  { label: "Handoff humano", value: "13%", delta: "-2,1pp", trend: "up", hint: "conversas escaladas" },
  { label: "Tokens consumidos", value: "152K", delta: "7,6% do limite", trend: "up", hint: "plano Pro · 2M" },
];

// Série de conversas por dia (últimos 14 dias) — para o gráfico.
export const conversationSeries = [
  148, 132, 176, 189, 165, 98, 74, 156, 203, 221, 198, 187, 142, 168,
];

export const channelSplit = [
  { name: "WhatsApp", value: 62, color: "var(--forest)" },
  { name: "Web Widget", value: 24, color: "var(--bluetron)" },
  { name: "Telegram", value: 9, color: "var(--amethyst)" },
  { name: "Instagram", value: 5, color: "var(--honey)" },
];

// Transcrição de exemplo para o Playground.
export type ChatMessage = { role: "user" | "agent"; text: string; time?: string; tool?: string };

export const playgroundThread: ChatMessage[] = [
  { role: "user", text: "Oi, preciso remarcar minha consulta de amanhã.", time: "14:02" },
  { role: "agent", text: "Claro! Encontrei sua consulta com a Dra. Helena amanhã às 10h. Para qual data você gostaria de remarcar?", time: "14:02" },
  { role: "user", text: "Pode ser na próxima segunda de manhã?", time: "14:03" },
  { role: "agent", text: "Verifiquei a agenda — há horários livres na segunda às 9h e às 11h.", time: "14:03", tool: "Agenda Médica" },
  { role: "agent", text: "Qual dos dois fica melhor para você?", time: "14:03" },
  { role: "user", text: "11h tá ótimo.", time: "14:04" },
  { role: "agent", text: "Pronto! Sua consulta foi remarcada para segunda-feira às 11h com a Dra. Helena. Enviei a confirmação no seu WhatsApp. 😊", time: "14:04", tool: "CRM Vitalmed" },
];

/* ── Deploy (14) ─────────────────────────────────────────────── */
export const deployTargets = [
  { key: "vm", name: "VM do cliente", desc: "Publique no servidor do próprio cliente (on-premise), com isolamento total." },
  { key: "cloud", name: "Cloud Run", desc: "Escala automática no Google Cloud Run — paga pelo uso." },
  { key: "export", name: "Exportar projeto", desc: "Baixe o projeto como pacote Python para rodar onde quiser." },
];

export type Deployment = {
  id: string;
  agent: string;
  target: "VM do cliente" | "Cloud Run" | "Export";
  status: "Publicado" | "Publicando" | "Falhou" | "Rascunho";
  version: string;
  url: string;
  lastDeploy: string;
};

export const deployments: Deployment[] = [
  { id: "d1", agent: "Sofia", target: "Cloud Run", status: "Publicado", version: "v12", url: "sofia.vitalmed.run.app", lastDeploy: "há 2 h" },
  { id: "d2", agent: "Dr. Agenda", target: "Cloud Run", status: "Publicado", version: "v8", url: "agenda.vitalmed.run.app", lastDeploy: "há 1 dia" },
  { id: "d3", agent: "Léo", target: "VM do cliente", status: "Publicando", version: "v3", url: "—", lastDeploy: "agora" },
  { id: "d4", agent: "Financeiro", target: "Export", status: "Rascunho", version: "—", url: "—", lastDeploy: "—" },
];

/* ── MCP Registry (05) ───────────────────────────────────────── */
export type McpServer = {
  id: string;
  name: string;
  url: string;
  auth: "none" | "bearer" | "api_key" | "basic" | "oauth2";
  status: "Conectado" | "Pendente" | "Erro";
  tools: number;
  project: string;
};

export const mcpServers: McpServer[] = [
  { id: "m1", name: "CRM Vitalmed", url: "https://mcp.vitalmed.com.br/crm", auth: "oauth2", status: "Conectado", tools: 8, project: "Sofia" },
  { id: "m2", name: "Agenda Médica", url: "https://mcp.vitalmed.com.br/agenda", auth: "bearer", status: "Conectado", tools: 5, project: "Sofia" },
  { id: "m3", name: "ERP Estoque", url: "https://erp.vitalmed.com.br/mcp", auth: "api_key", status: "Pendente", tools: 0, project: "Sofia" },
  { id: "m4", name: "Financeiro Legado", url: "https://legacy.vitalmed.com.br/mcp", auth: "basic", status: "Erro", tools: 0, project: "Léo" },
];

/* ── Configuração de Memória (07) ────────────────────────────── */
export const memoryStrategies = [
  { key: "buffer", name: "Buffer (janela)", desc: "Mantém as últimas N mensagens na íntegra." },
  { key: "summary", name: "Resumo", desc: "Resume conversas antigas para economizar contexto." },
  { key: "vector", name: "Vetorial (RAG)", desc: "Busca semântica no histórico via embeddings." },
];

export const memoryConfig = {
  strategy: "Resumo + Vetorial",
  window: 20,
  retention: "90 dias",
  embeddings: "text-embedding-3-large",
  longMemory: true,
};

export const memoryStats = { stored: "4.812", contacts: "1.284", avgTokens: 320 };

/* ── Studio — IDE Agêntica (15) ──────────────────────────────── */
export type StudioRule = {
  id: string;
  name: string;
  scope: "Payload" | "Voz";
  trigger: string;
  active: boolean;
};

export const studioRules: StudioRule[] = [
  { id: "r1", name: "Formatar telefone BR", scope: "Payload", trigger: "Quando o campo telefone chegar, normalize para o formato +55…", active: true },
  { id: "r2", name: "Tom empático na triagem", scope: "Voz", trigger: "Se o paciente relatar dor, responda com acolhimento antes de coletar dados.", active: true },
  { id: "r3", name: "Encerrar fora do horário", scope: "Payload", trigger: "Fora do horário comercial, informe o plantão e encerre a conversa.", active: false },
  { id: "r4", name: "Voz pausada para idosos", scope: "Voz", trigger: "Para contatos acima de 60 anos, use frases curtas e ritmo pausado.", active: true },
];

/* ── Super Admin (plataforma) ────────────────────────────────── */
export type PlatformOrg = {
  id: string;
  name: string;
  plan: Plan;
  seats: number;
  tokens: string;
  status: "Ativo" | "Suspenso";
};

export const superAdminOrgs: PlatformOrg[] = [
  { id: "o1", name: "Vitalmed", plan: "Pro", seats: 5, tokens: "4,2M", status: "Ativo" },
  { id: "o2", name: "ClinSaúde", plan: "Scale", seats: 22, tokens: "31M", status: "Ativo" },
  { id: "o3", name: "OdontoPlus", plan: "Starter", seats: 3, tokens: "480k", status: "Ativo" },
  { id: "o4", name: "MedFácil", plan: "Free", seats: 1, tokens: "92k", status: "Suspenso" },
];

export const platformMetrics = [
  { label: "Organizações", value: "128", delta: "+9", trend: "up" as const, hint: "este mês" },
  { label: "Agentes ativos", value: "1.042", delta: "+64", trend: "up" as const, hint: "em produção" },
  { label: "Tokens (mês)", value: "1,8B", delta: "+12%", trend: "up" as const, hint: "toda a plataforma" },
  { label: "MRR", value: "R$ 214k", delta: "+8%", trend: "up" as const, hint: "receita recorrente" },
];

/* ── Onboarding ──────────────────────────────────────────────── */
export const onboardingSteps = [
  { n: 1, title: "Crie sua organização", desc: "Nome, slug e e-mail do administrador." },
  { n: 2, title: "Monte um workspace", desc: "Organize seus projetos por área de negócio." },
  { n: 3, title: "Crie o primeiro agente", desc: "Instruções, modelo e personalidade em minutos." },
  { n: 4, title: "Conecte um canal", desc: "WhatsApp, site ou Telegram — e vá ao ar." },
];
