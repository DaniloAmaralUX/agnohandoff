# Board — AgnoHub painel React

Tarefas para virar issues no GitHub Project. Cada item é acionável. Contexto/padrões em [`HANDOFF.md`](./HANDOFF.md).

## 🔌 Frontend — ligar telas na API (replicar o padrão)
Padrão e exemplos em HANDOFF §2. Cada uma: hook em `src/lib/api/*` + `page.tsx` client + estados loading/erro/vazio + `pnpm verify`.

- [x] **Canais** — `channels.ts` + `api-keys.ts` (regenerar = POST nova + DELETE antiga; `webhook_token` exibido uma vez). ✅
- [x] **Workspaces** — `workspaces.ts` (contagem de projetos derivada; members é demo-only). ✅
- [x] **Conversas** — `conversations.ts` (+ `useChatHistory` p/ o thread real). Assumir/Responder/Resolver seguem **locais** (sem PATCH no backend — ver gaps). ✅
- [x] **Playground** — `chat.ts`: `useChatSession()` com **streaming SSE** token a token (fetch+ReadableStream) e fallback p/ `POST /chat/message`; debug com tokens/latência reais. ✅
- [x] **Faturamento** — `billing.ts` (saldo com `X-Org-Id`, planos reais, purchase Pix, subscribe). Histórico continua ilustrativo (sem endpoint). ✅
- [x] **Studio** — `studio.ts` (CRUD + toggle otimista + `/interpret` NL cria regras reais). ✅
- [x] **Memória** — config salva via `PATCH /manage/projects/{id}` (estratégias reais do backend em modo API); métricas seguem ilustrativas. ✅
- [x] **Onboarding/registro** — `register.ts` → `POST /auth/register` (senha no passo 1, key exibida uma vez). ✅
- [ ] **Agent Builder** (`/agents/[id]`) — form real (RHF+zod) → `PATCH /manage/projects/{id}/agents/{agentId}` (name, role, instructions, model, temperature, flags). O `useToggleAgent` já faz o PATCH de `is_active`.

## 🛠️ Backend — endpoints que faltam (bloqueiam telas)
Ver HANDOFF §4. O admin Streamlit acessa o banco direto; o React precisa de API.

- [ ] **`/api/v1/manage/tools`** — CRUD `CustomTool` → tela **Ferramentas**. *(alta)*
- [ ] **`/api/v1/manage/mcp-servers`** — CRUD `MCPServer` + testar conexão → **MCP**. *(alta)*
- [ ] **`/api/v1/manage/organization`** — GET/PATCH settings da org → **Configurações**. *(alta)*
- [ ] **`/api/v1/analytics/*`** — agregações (tokens/dia, top agentes, latência, custo) → **Analytics**. *(média)*
- [ ] **`/api/v1/billing/transactions`** — histórico de créditos → **Faturamento**. *(baixa)*
- [ ] **`/api/v1/deploy/*`** — status/modos de deploy → **Deploy**. *(baixa)*

## 🧩 Backend — campos faltantes (endpoint existe)
- [ ] `AgentConfig` na listagem: expor **flag de memória** e **contagem de tools** (a tela já usa quando presentes).
- [ ] `GET /conversations`: filtros (role/agente) + paginação + dados de voz.
- [ ] Projeto: incluir **nome do workspace** (hoje só `workspace_id`).

## 🔐 Auth (evoluir a referência)
- [ ] Fluxo de auth definitivo: expiração/refresh de sessão; avaliar **cookie httpOnly** no lugar de localStorage.
- [x] Tela de **registro** real ligada a `POST /auth/register` (senha + key exibida uma vez + sessão autenticada). ✅
- [ ] Estados de sessão expirada (401 → volta pro `/login`).
- [ ] Seleção de **projeto no login por org-key** (`agnohub_…` autentica a org; o seletor da topbar já cobre a troca).

## ✅ Qualidade / infra
- [ ] **Storybook**: o `storybook init` falhou no ambiente local (Windows/Node25 — módulo nativo `oxc-resolver`). Provável sucesso no CI Linux; adicionar catálogo (o `/handoff` cobre enquanto isso).
- [x] Ampliar testes: unit dos mappers/hooks de `api/*` (153 testes; gate 85%/80% por glob em `api/**`, incluindo o parser SSE). ✅
- [ ] E2E dos fluxos autenticados (com backend de teste) + `pnpm gen:api` contra o openapi.json real quando o backend estiver de pé.
- [ ] Observabilidade (erros de API → toast + log).
- [ ] Conectar o `.github/workflows/ci.yml` (já pronto) ao repositório.

## 🎨 Design (fase seguinte, com o designer)

> **Fonte de verdade viva:** status + adesão destas melhorias em `src/app/design/system.ts` → renderizado na rota **`/design` § Status & Adesão**; sinal **medido** por `pnpm design:audit`. Esta lista é o detalhamento; o retrato atual está lá.
Achados da revisão de design — ver [`DESIGN-HANDOFF.md`](./DESIGN-HANDOFF.md). Contraste **recalculado à mão** (WCAG 2); tokens são o sistema visual Firecrawl → **não** alterar sem decisão do designer.

**Contraste / tokens — Tokens v2 (parcial):**
- [x] **Migração OKLCH** de todos os tokens + `--crimson`/`--destructive` escurecidos p/ AA (texto de erro 4.64:1, botão 4.88:1, dark 4.62:1). ✅
- [x] Variantes **`-text`** (forest/honey/bluetron/amethyst) criadas e aplicadas nos chips do `bits.tsx` (`TONE`/`ToneAvatar`). ✅
- [ ] **Sweep `-text`:** migrar os mapas de tint **duplicados por página** (`dashboard`/`channels`/`tools`/`deploy`/`studio`) e os `text-forest`/`text-amethyst`/etc. usados como **texto/checkmark** para as variantes `-text`; consolidar em `bits.tsx` (remover cópias locais de `statusDot`/tint). *(média)*
- [ ] Heat como texto pequeno segue ~3.2:1 (ok p/ botão) — não usar Heat em texto pequeno. *(baixa)*
- Nota: `muted-foreground` **passa** (~5:1) — sem ação.

**Acessibilidade estrutural (não muda o visual):**
- [ ] **Skip-to-content link** no layout `(app)` (WCAG 2.4.1). *(alta)*
- [ ] `aria-hidden` no ícone "X" de Dialog/Sheet (hoje é anunciado ao leitor de tela). *(média)*
- [ ] Alvos de toque ≥44px: fechar de Dialog/Sheet, `SidebarMenuSubButton`, `SidebarGroupAction`. *(média)*

**Estados faltantes (parte do "ligar a tela" acima):**
- [x] loading/erro/vazio em Playground, Canais, Conversas, Workspaces, Studio. ✅
- [ ] loading/erro/vazio em Dashboard (segue mock — depende de `/analytics/*`). *(média)*

**Motion (Fase 2 — parcial):**
- [x] Vocabulário de motion (`ease-enter/exit/spring`, `animate-rise`) + `EmptyState` + hover-lift nos cards de referência. ✅ (ver `docs/solutions/motion-system.md`)
- [x] **Optimistic UI** nos toggles (`is_active` de agente e de regra do Studio) com rollback + toast. ✅
- [ ] **⌘K command menu** (`cmdk`) p/ ações admin. *(média)*
- [ ] Aplicar `EmptyState`/hover-lift nas demais telas ao ligá-las.

**Inspirado na Vercel/Geist (roadmap — ver `/design`):**
- [ ] Escalas de cor **100–1000** (bg/border/text) sobre os tokens OKLCH. *(média)*
- [ ] Sweep de **microcopy** (`…` real, nbsp em métricas/atalhos, erros que guiam a saída). *(média)*
- [ ] **A11y**: `fieldset/legend` em grupos, `aria-label` em botões-ícone, `translate="no"` em nomes/tokens, `color-scheme` no `<html>`. *(alta)*
- [ ] **Elevação** 3 níveis (card/popover/modal) + focus ring anel-duplo. *(baixa)*
- [ ] **Estado na URL** (filtros/sort/página) nas tabelas (deep-linking). *(média)*

**Refinos gerais:**
- [ ] Microinterações finas e ajustes de tela a definir com o Danilo.
