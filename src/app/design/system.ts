/* ══ Fonte única da verdade do design system do AgnoHub ══════════════
   O que DIZEMOS aplicar (COMMITMENTS) + as melhorias mapeadas (ROADMAP).
   Renderizado na seção "Status & Adesão" de /design. Mantido por sessão
   de design; o sinal MEDIDO vem de `pnpm design:audit` (audit.json).
   ═══════════════════════════════════════════════════════════════════ */

export type Adesao = "aplicado" | "parcial" | "pendente";
export type RoadStatus = "feito" | "em-progresso" | "planejado";
export type Prioridade = "alta" | "média" | "baixa";

export type Area =
  | "Cor & tokens"
  | "Tipografia"
  | "Motion"
  | "Acessibilidade"
  | "Estados"
  | "Microcopy"
  | "Componentes"
  | "Fluxos/UX";

export const AREAS: Area[] = [
  "Cor & tokens",
  "Tipografia",
  "Motion",
  "Acessibilidade",
  "Estados",
  "Microcopy",
  "Componentes",
  "Fluxos/UX",
];

export type Commitment = {
  area: Area;
  rule: string;
  status: Adesao;
  where?: string;
  note?: string;
};

/* O que prometemos aplicar — status honesto (conferir com `pnpm design:audit`). */
export const COMMITMENTS: Commitment[] = [
  // Cor & tokens
  { area: "Cor & tokens", rule: "Tokens em OKLCH (não hex)", status: "aplicado", where: "globals.css" },
  { area: "Cor & tokens", rule: "Split semântico: fills/charts = vivo; texto e dots = -text (WCAG AA)", status: "aplicado", note: "sweep completo (67 usos); audit: 0" },
  { area: "Cor & tokens", rule: "Heat como acento único", status: "aplicado" },
  { area: "Cor & tokens", rule: "Escalas 50–900 (bg/border/text)", status: "aplicado", where: "globals.css", note: "6 rampas OKLCH; utilities bg-heat-100 etc." },
  // Tipografia
  { area: "Tipografia", rule: "Geist Sans (UI) + Geist Mono (técnico)", status: "aplicado" },
  { area: "Tipografia", rule: "Números tabulares em métricas/tabelas", status: "aplicado", where: ".tabular" },
  { area: "Tipografia", rule: "Headings com tracking negativo", status: "aplicado" },
  // Motion
  { area: "Motion", rule: "Vocabulário de easing/duração (ease-enter/exit/spring)", status: "aplicado", where: "globals.css @theme" },
  { area: "Motion", rule: "Respeita prefers-reduced-motion", status: "aplicado" },
  { area: "Motion", rule: "Sem `transition: all` (listar propriedades)", status: "aplicado", note: "sweep completo (badge/tabs/switch/progress/sidebar/fluxos); os 2 hits do audit são o texto desta regra" },
  { area: "Motion", rule: "Motion só quando comunica (~70% sem motion)", status: "aplicado" },
  { area: "Motion", rule: "Optimistic UI em toggles", status: "aplicado", where: "useToggleAgent (referência)", note: "toggle Publicado no card do agente" },
  // Acessibilidade
  { area: "Acessibilidade", rule: "Foco visível (focus-visible ring)", status: "aplicado" },
  { area: "Acessibilidade", rule: "Semântica nativa + Radix antes de ARIA", status: "aplicado" },
  { area: "Acessibilidade", rule: "aria-label em botões só-ícone", status: "aplicado", note: "audit: 0 sem nome" },
  { area: "Acessibilidade", rule: "Skip-to-content no layout (app)", status: "aplicado", where: "(app)/layout.tsx" },
  { area: "Acessibilidade", rule: "Alvos de toque ≥ 44px", status: "aplicado", note: "closes de modal + sub-itens/ações da sidebar (pointer-coarse: 44px só em touch)" },
  { area: "Acessibilidade", rule: 'translate="no" em nomes/tokens/IDs', status: "aplicado", note: "IDs/tokens visíveis (model, PAT)" },
  // Estados
  { area: "Estados", rule: "Loading = skeleton que espelha o layout", status: "parcial", note: "referência (Projetos/Agentes) sim; telas mock são instantâneas — aplicar ao ligar cada tela à API" },
  { area: "Estados", rule: "Erro = banner + retry", status: "parcial", note: "referência sim; telas mock não têm caminho de erro — aplicar ao ligar à API" },
  { area: "Estados", rule: "Vazio = EmptyState + CTA", status: "parcial", where: "Projetos/Agentes + DataTable (emptyMessage)" },
  // Microcopy
  { area: "Microcopy", rule: "Voz ativa e orientada à ação", status: "aplicado" },
  { area: "Microcopy", rule: "Reticências reais `…` (não `...`)", status: "aplicado", note: "audit: 0" },
  { area: "Microcopy", rule: "nbsp em métricas/atalhos", status: "aplicado", note: "valores atuais são tokens únicos (1,8s / 6,7M) — sem quebra" },
  { area: "Microcopy", rule: "Erros que guiam a saída (problema + solução)", status: "aplicado", note: "banners com retry; login orienta" },
  // Componentes
  { area: "Componentes", rule: "Base shadcn/Radix", status: "aplicado" },
  { area: "Componentes", rule: "Helpers reutilizáveis (StatusBadge/ToneAvatar/EmptyState)", status: "aplicado", where: "bits.tsx" },
  { area: "Componentes", rule: "Hover-lift em cards clicáveis", status: "aplicado", where: "Projetos/Agentes/Workspaces/Fluxos", note: "só clicáveis — cards informativos ficam flat de propósito" },
  { area: "Componentes", rule: "⌘K command menu", status: "aplicado", where: "command-menu.tsx" },
  // Fluxos/UX
  { area: "Fluxos/UX", rule: "Toda tela oferece próximo passo", status: "aplicado", note: "todos os fluxos ligados no mock (padrão de ação): zero CTA morto" },
  { area: "Fluxos/UX", rule: "Confirmação em ações destrutivas", status: "parcial" },
  { area: "Fluxos/UX", rule: "Estado na URL (filtros/sort/página)", status: "parcial", where: "conversas (referência)", note: "replicar ao ligar as telas com filtro" },
];

export type RoadmapItem = {
  title: string;
  area: Area;
  status: RoadStatus;
  prioridade: Prioridade;
  note?: string;
};

/* Melhorias mapeadas — consolidado de ISSUES §Design + Fases + Vercel/Geist. */
export const ROADMAP: RoadmapItem[] = [
  { title: "Tokens v2 — OKLCH + split semântico", area: "Cor & tokens", status: "feito", prioridade: "alta" },
  { title: "Sistema de motion (vocabulário + EmptyState + hover-lift)", area: "Motion", status: "feito", prioridade: "alta" },
  { title: "Documentação de design viva (/design)", area: "Componentes", status: "feito", prioridade: "alta" },
  { title: "Sweep -text nas telas (tints/checkmarks/dots → -text)", area: "Cor & tokens", status: "feito", prioridade: "média" },
  { title: "A11y quick-wins (skip-link, aria-hidden modais, alvos ≥44px)", area: "Acessibilidade", status: "feito", prioridade: "alta" },
  { title: "A11y sweep (aria-label, color-scheme, translate=no, fieldset)", area: "Acessibilidade", status: "feito", prioridade: "alta", note: "aria-label + color-scheme + translate=no feitos; fieldset N/A (sem grupos radio/checkbox)" },
  { title: "Estados (loading/erro/vazio): padrão + referência", area: "Estados", status: "feito", prioridade: "média", note: "EmptyState/skeleton/erro-banner + Projetos/Agentes; aplicar por tela mock = board §Frontend (ligar à API)" },
  { title: "Escalas de cor 50–900 (rampas OKLCH)", area: "Cor & tokens", status: "feito", prioridade: "média" },
  { title: "Sweep de microcopy (…, nbsp, erros que guiam)", area: "Microcopy", status: "feito", prioridade: "média", note: "reticências + voz ativa + erros que guiam" },
  { title: "⌘K command menu", area: "Componentes", status: "feito", prioridade: "média" },
  { title: "Optimistic UI nos toggles", area: "Motion", status: "feito", prioridade: "média", note: "useToggleAgent: update otimista + rollback + toast" },
  { title: "Estado na URL (deep-linking em tabelas)", area: "Fluxos/UX", status: "feito", prioridade: "média", note: "referência em Conversas (filtro na URL, bookmarkável)" },
  { title: "Elevação 3 níveis + focus ring anel-duplo", area: "Componentes", status: "feito", prioridade: "baixa", note: "tokens shadow-overlay/modal; focus offset; cards flat de propósito" },
  { title: "D1 — laranja próprio + Fraunces self-hosted", area: "Tipografia", status: "feito", prioridade: "alta", note: "oklch(0.68 0.2 42) + split heat/heat-text; Fraunces via @fontsource (offline-safe); verificado visual claro/dark" },
  { title: "D2 — assinatura 'O hub que lembra' (memory hub + beams)", area: "Motion", status: "feito", prioridade: "alta", note: "beams SVG nos tokens, stagger, estático sob reduced-motion; landing" },
  { title: "DataTable compartilhado (TanStack Table)", area: "Componentes", status: "feito", prioridade: "média", note: "portado de satnaing/shadcn-admin (MIT), re-skin Firecrawl; referência na tab Projetos de /workspaces" },
  { title: "Todos os fluxos funcionam no mock (padrão de ação)", area: "Fluxos/UX", status: "feito", prioridade: "alta", note: "FormSheet + otimista + toast em ~14 telas; onboarding multi-step; builder Publicar + prévia-chat" },
];

/* Agregados */
export function adesao(area?: Area) {
  const items = area ? COMMITMENTS.filter((c) => c.area === area) : COMMITMENTS;
  const total = items.length;
  const aplicado = items.filter((c) => c.status === "aplicado").length;
  const parcial = items.filter((c) => c.status === "parcial").length;
  return { total, aplicado, parcial, pendente: total - aplicado - parcial, pct: total ? Math.round((aplicado / total) * 100) : 0 };
}

export function progressoRoadmap() {
  const total = ROADMAP.length;
  const feito = ROADMAP.filter((r) => r.status === "feito").length;
  const emProgresso = ROADMAP.filter((r) => r.status === "em-progresso").length;
  return { total, feito, emProgresso, planejado: total - feito - emProgresso, pct: total ? Math.round((feito / total) * 100) : 0 };
}
