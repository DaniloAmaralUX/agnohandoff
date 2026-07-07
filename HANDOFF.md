# AgnoHub — Handoff para os devs (painel React)

Este é o guia técnico do handoff. O **frontend de produção** está pronto (design system + todas as telas + o **padrão de integração com a API**, com 2 telas ligadas de verdade como referência). Aqui está tudo que os devs precisam para **finalizar a integração** e o que o **backend precisa expor**.

- Documentação de design (viva): rota **`/design`** · Fluxos: **`/fluxos`** · Setup/scripts: **`README.md`** · Board: **`ISSUES.md`**
- Design source = o **código** (tokens em `src/app/globals.css`).

---

## 1. Arquitetura de integração (a camada de dados)

```
src/lib/
  config.ts     # USE_MOCK / USE_API a partir de NEXT_PUBLIC_API_URL
  auth.ts       # sessão X-API-Key: get/set/clear/validate
  api/
    schema.ts   # tipos GERADOS do OpenAPI  (pnpm gen:api — não editar à mão)
    client.ts   # openapi-fetch tipado; injeta header X-API-Key
    projects.ts # useProjects()  -> padrão FLAT
    agents.ts   # useAgents()    -> padrão ANINHADO (projeto -> agentes)
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

> **Referência ≠ produção:** o `useAgents` usa o **primeiro** projeto (`projects[0]`). Ao produtizar, parametrize pelo **projeto selecionado** (um seletor na topbar) e propague o `project_id` aos hooks aninhados.

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

Telas de **referência ligadas:** Projetos ✅, Agentes ✅. As demais estão prontas em UI (modo mock) aguardando o mesmo tratamento.

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
