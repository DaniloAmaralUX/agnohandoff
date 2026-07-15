# AgnoHub — Handoff para os devs (painel React)

Este é o guia técnico do handoff de um **protótipo avançado React com integração inicial** — design system completo, todas as telas, e o padrão de integração com a API estabelecido, com parte das telas já consumindo o backend real. **O estado exato de cada tela (Ligada/Parcial/Mock) vive em [`STATUS.md`](./STATUS.md)** — este documento explica a arquitetura, o que resta para finalizar a integração e o que o backend precisa expor.

- Status por tela: **`STATUS.md`** · Documentação de design (viva): rota **`/design`** · Fluxos: **`/fluxos`** · Setup/scripts: **`README.md`** · Board: **`ISSUES.md`**
- Design source = o **código** (tokens em `src/app/globals.css`).

---

## 1. Arquitetura de integração (a camada de dados)

```
src/lib/
  config.ts     # USE_MOCK / USE_API a partir de NEXT_PUBLIC_API_URL
  auth.ts       # sessão X-API-Key: get/set/clear/validate
  project-context.tsx # ProjectProvider: projeto ativo (seletor na topbar)
  api/
    schema.ts   # tipos GERADOS do OpenAPI  (pnpm gen:api — não editar à mão)
    client.ts   # openapi-fetch tipado; injeta header X-API-Key
    projects.ts # useProjects()  -> padrão FLAT (+ slugify, create real)
    agents.ts   # useAgents()    -> padrão ANINHADO (projeto ativo -> agentes)
    workspaces.ts / channels.ts / api-keys.ts / conversations.ts
    chat.ts     # useChatSession(): streaming SSE + fallback; useChatHistory()
    platform.ts # useProjectInfo(): org_id p/ o X-Org-Id do billing
    billing.ts / studio.ts / memory.ts / register.ts
```

- **Type-safety end-to-end:** `schema.ts` é gerado do `/openapi.json` do backend → o front **não desalinha** do back. Regenerar: `pnpm gen:api` (backend rodando).
- **Modo mock↔API:** `USE_MOCK` (sem `NEXT_PUBLIC_API_URL`) usa `src/lib/data.ts` (demo do stakeholder segue vivo); `USE_API` consome a FastAPI real.
- **Server-state:** TanStack Query (cache, loading/erro, refetch). Provider em `src/app/layout.tsx`.

---

## 2. Como ligar uma tela {#como-ligar-uma-tela}

**Referências já prontas:** `projects.ts`/`projects/page.tsx` (flat) e `agents.ts`/`agents/page.tsx` (aninhado). Para ligar as demais, replique:

**Passo 1 — hook** (`src/lib/api/<recurso>.ts`):
```ts
"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
import { USE_MOCK } from "@/lib/config";
import { <mock> as mock } from "@/lib/data";

export type XView = { /* shape que a TELA usa (normalizado) */ };

export function useX() {
  return useQuery({
    queryKey: ["x"],
    queryFn: async (): Promise<XView[]> => {
      if (USE_MOCK) return mapMock(mock);
      const { data, error } = await api.GET("/api/v1/manage/<rota>");
      if (error) throw new Error("Falha ao carregar…");
      return mapApi(data);           // mapeie os campos da API -> XView
    },
  });
}
```
Para recurso **aninhado** (ex.: agentes/canais por projeto): busque o pai primeiro e use `enabled` + o path param — veja `agents.ts` (`useProjects()` → `projectId` → `api.GET("/api/v1/manage/projects/{project_id}/agents", { params:{ path:{ project_id } } })`).

> **Resolvido:** o projeto ativo agora vem do **seletor na topbar** (`ProjectProvider` em `src/lib/project-context.tsx`, persistido em localStorage). Hooks aninhados (agentes, canais, regras, memória) leem de `useActiveProject()` — fallback no primeiro projeto quando nada foi selecionado.

**Passo 2 — tela** (`src/app/(app)/<rota>/page.tsx`): `"use client"`, troque o import de `@/lib/data` pelo hook, e trate os 3 estados:
```tsx
const { data = [], isLoading, isError, refetch } = useX();
// isLoading -> <Skeleton/>   | isError -> banner + botão refetch   | data.length===0 -> vazio
```

**Passo 3 — verifique:** `pnpm verify` + olho no preview (com a FastAPI de pé).

> **Cuidado com o gap de campos:** a tela pode esperar campos que a API ainda não devolve (ex.: *memória* e *nº de tools* por agente). Trate como opcional e abra uma issue (ver §4). Nunca invente dado.

---

## 3. Contrato de API (o que já existe)

- **Base/OpenAPI:** FastAPI (`api.main:app`, dev :9090). Spec navegável em **`/docs`** / **`/openapi.json`** (fonte de verdade dos tipos).
- **Auth:** header **`X-API-Key: proj_…`** (chave de projeto). CORS liberado.
- **Já cobre (~65%):** `GET/POST/PATCH/DELETE /api/v1/manage/projects` · `…/projects/{id}/agents` · `…/projects/{id}/channels` · `…/manage/api-keys` · `…/manage/workspaces` · `GET /api/v1/project/info` · `GET /api/v1/conversations` · `POST /api/v1/chat/message` (+ `/chat/message/stream` SSE · `GET /chat/history?session_id=`) · `/api/v1/payload-rules` (CRUD + `/reorder` + `/interpret`) · `/api/v1/billing/plans|purchase|subscribe` · `/api/v1/users/{id}/profile` + `/memory`.

Telas **ligadas na API:** Projetos ✅ · Agentes ✅ · Workspaces ✅ · Canais + API Keys ✅ · Conversas ✅ (lista + histórico da sessão; ações humanas são locais — sem PATCH no backend) · Playground ✅ (SSE token a token com fallback) · Memória ✅ (salva via `PATCH /manage/projects/{id}`) · Faturamento ✅ (saldo/planos/compra/assinatura; histórico ilustrativo) · Studio ✅ (CRUD + `interpret` NL) · Onboarding ✅ (`POST /auth/register`, key exibida uma vez). **Aguardando endpoint** (mock com aviso): Ferramentas, MCP, Analytics, Deploy, Configurações da org.

> **Nuances de auth:** rotas de billing usam header **`X-Org-Id`** (o org vem de `GET /project/info` via `useProjectInfo`) — não `X-API-Key`. O SSE do chat é POST (EventSource não serve): `useChatSession` lê o body com `ReadableStream` (parser em `extractSseEvents`).

---

## 4. Gap — o que o BACKEND precisa expor {#gap}

Endpoints ausentes hoje (o admin Streamlit acessa o banco direto; o React precisa de API):

| Endpoint a criar | Para a tela | Prioridade |
|---|---|---|
| `/api/v1/manage/tools` (CRUD `CustomTool`) | Ferramentas | Alta |
| `/api/v1/manage/mcp-servers` (CRUD `MCPServer` + testar) | MCP | Alta |
| `/api/v1/manage/organization` (GET/PATCH settings da org) | Configurações | Alta |
| `/api/v1/analytics/*` (agregações: tokens/dia, top agentes, latência) | Analytics | Média |
| `/api/v1/billing/transactions` (histórico) | Faturamento | Baixa |
| `/api/v1/deploy/*` (status/modos de deploy) | Deploy | Baixa |

> **Memória** saiu da tabela acima: `/api/v1/users/{id}/profile` e `/memory` **já existem** — a tela **liga** neles (verificar se cobrem o caso de administração), não é endpoint a criar.

**Gaps de campo (endpoints existem, faltam campos):**
- `AgentConfig` na listagem: expor **flag de memória** e **contagem de tools** (a tela de Agentes já os mostra quando presentes).
- Projeto: **contagem de agentes/canais** — hoje o mapper (`projects.ts`) não popula no modo API, então o card esconde os contadores. Incluir na resposta (ou resolver client-side).
- `GET /conversations`: filtros (role, agente) + paginação melhor + dados de voz.
- Projeto: resolver `workspace_id` → nome (ou incluir o nome do workspace na resposta).

---

## 5. Auth (referência)
`/login` valida a chave em `GET /api/v1/project/info`; ok → `setApiKey` + redirect; erro → aviso. `AuthGuard` (`src/components/auth-guard.tsx`) barra rotas **só em modo API**. Logout na sidebar. **Estender** para o fluxo definitivo (expiração/refresh, talvez cookie httpOnly em vez de localStorage). Ver `ISSUES.md`.

---

## 5.1 Decisões arquiteturais e riscos conhecidos (leia antes de estender)

Decisões conscientes do protótipo que o dev deve **revisitar** antes de produção:

| Decisão | Risco | Recomendação |
|---|---|---|
| **Sessão = X-API-Key em `localStorage`** (`src/lib/auth.ts`) — espelha o modelo do admin Streamlit | XSS pode exfiltrar a chave; chave de projeto funciona como login administrativo | Migrar para cookie httpOnly + expiração/refresh; separar papel administrativo de chave de integração |
| **Cache TanStack global, sem isolamento por conta** (`src/lib/api/query-provider.tsx`) | Trocar de chave pode exibir dados da sessão anterior até o refetch | Limpar o cache (`queryClient.clear()`) no logout/login/registro; em produção, incluir a identidade na `queryKey` ou recriar o client por sessão |
| **401 não encerra a sessão automaticamente** | Sessão inválida continua exibindo cache até o usuário navegar | Handler global de 401 → limpar chave + redirect `/login`; fluxo definitivo de expiração no `ISSUES.md §Auth` |
| **Dual-mode `USE_MOCK`** (`src/lib/config.ts`) — demo sem backend é feature, não gambiarra | Tela pode "parecer" persistir; toasts explicitam "demo" | Manter até o fim da integração; specs em `docs/solutions/mock-api-dual-mode.md` |
| **"Super Admin" sem controle de papel** (`/super-admin`, fora do AuthGuard) | Qualquer pessoa com o link vê a tela (dados mock) | Não ligar em dados reais antes de existir RBAC no backend |

---

## 6. Design tokens (fonte: `src/app/globals.css`)
| Token | Valor | Uso |
|---|---|---|
| `--heat` | `#FA5D19` | acento único (CTA, foco, ativo) |
| `--heat-hover` | `#E84F10` | hover do primário |
| `--graphite`/`--foreground` | `#262626` | texto (claro) |
| `--paper`/`--background` | `#F9F9F9` | fundo (claro) |
| `--card` | `#FFFFFF` | superfícies |
| `--border` | `#E7E7E4` | hairline |
| `--muted-foreground` | `#6B6B6B` | texto secundário |
| acentos | forest `#42C366` · bluetron `#2A6DFB` · honey `#ECB730` · crimson `#EB3424` · amethyst `#9061FF` | status/dados |
| raios | 4 / 6 / 8 / 12px | `--radius-sm/md/lg/xl` |
| fontes | **Geist Sans** (UI) · **Geist Mono** (técnico) | |

Tema claro por padrão; `.dark` definido no mesmo arquivo (toggle no topbar).

---

## 7. Componentes & telas
- **Helpers:** `src/components/bits.tsx` (`StatusBadge`, `ToneAvatar`, `MonoLabel`, `statusDot`) · `page-header.tsx` (`PageShell`, `PageHeader`).
- **Shell:** `app-sidebar.tsx` (nav agrupada + switcher + logout), `topbar.tsx`.
- **Primitivos:** `src/components/ui/*` (shadcn radix-nova). Cores vêm do `globals.css`.
- **Telas:** todas as ~18 rotas existem (`src/app/(app)/*` + landing/login/handoff/fluxos/onboarding/super-admin). Catálogo vivo em **`/design`** (`/handoff` redireciona pra lá). As rotas **fora** do grupo `(app)` (landing, `/login`, `/onboarding`, `/super-admin`) **não** têm AuthGuard nem sidebar.

---

## 8. Fundação shadcn — o que é padrão e o que é do produto {#shadcn}

Tudo em `src/components/ui/*` é **shadcn/ui, style `radix-nova`**, comparado contra o upstream oficial `shadcn-ui/ui@bc07053`. O tema (tokens OKLCH) vive em `globals.css`, **fora** dos componentes — por isso dá para atualizar primitivos sem tocar na identidade visual.

**Como atualizar/adicionar componentes neste ambiente** (o registry `ui.shadcn.com` fica atrás de rede fechada — aponte a CLI para o registry oficial hospedado no GitHub):
```bash
export REGISTRY_URL=https://raw.githubusercontent.com/shadcn-ui/ui/bc0705384b51252af26dcc65425b216bf5eb063c/apps/v4/public/r
pnpm dlx shadcn@latest add <componente> --diff   # prévia (smart-merge)
pnpm dlx shadcn@latest add <componente>          # aplica
```
Skill oficial `shadcn` instalada em `.claude/skills/shadcn/` (regras de styling/forms/composição para o agente).

**Preset do design system** (recria um app-satélite com o mesmo DS num comando): código **`b2fA`** (`style nova · baseColor neutral · lucide · geist`), gerado por `shadcn preset resolve`.

**Auditoria de drift (2026-07-15) — o que é padrão vs. customizado:**

| Não tocar (customização do produto — carrega tokens/motion/pt-BR) | Padrão / drift só cosmético (sincronizável sem risco) |
|---|---|
| `button`, `card`, `dialog`, `sheet`, `tooltip`, `slider` — sombras (`--shadow-modal/overlay`, `shadow-border`), easings próprios, hit-targets, "Fechar" | `avatar`, `input`, `label`, `table`, `textarea`, `skeleton`, `separator`, `scroll-area`, `breadcrumb`, `field`, `sonner` — idênticos ao upstream |
| `sidebar` (`SidebarInset` como `<div>` + foco no fechar) e `progress` (`value` no Root) — correções de a11y intencionais deste projeto | `switch`, `tabs`, `badge` — upstream migrou para shorthand `data-*`/`transition-all`; funcionalmente idêntico, adiar até um bump de `radix-ui` |
| — | `dropdown-menu`, `select` — upstream adicionou menus translúcidos (`cn-menu-*`): **mudança visual deliberada**, não adotar às cegas |

> Componentes próprios (não-shadcn), com o porquê: `bits.tsx` (StatusBadge/ToneAvatar/MonoLabel — vocabulário de status do produto), `page-header.tsx` (PageShell/PageHeader — chrome de página), `form-sheet.tsx` (o padrão de ação §2), `memory-hub.tsx`, `command-menu.tsx`, `data-table/*` (portado de `satnaing/shadcn-admin`, MIT).

**Registry próprio (opção futura da empresa):** publicar o design system como registry consumível por `shadcn add` = adicionar um `registry.json` na raiz (`registry:base`) — repo GitHub público serve direto (`owner/repo/item`), sem servidor. Ver `docs/solutions/` se for adiante.

**Migração Radix → Base UI:** o upstream tornou Base UI o default (jul/2026), mas Radix **não** está deprecado ("you do not need to migrate") — decisão futura do dev, com skill oficial de migração disponível.
