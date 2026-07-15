# STATUS — verdade por tela (fonte única de integração)

> **Posicionamento:** este repositório é um **protótipo avançado React com integração inicial ao backend**. NÃO é um frontend de produção. Toda tela funciona em **modo demo** (mock, sem persistência); a coluna abaixo descreve o comportamento em **modo API**.
>
> **Frontend:** branch `claude/determined-gauss-sgvjcs` (2026-07-15) · **Backend de referência:** `clvschaves/agnohub` — SHA: _pendente de validação (ver §Validação)_.

**Como esta tabela foi derivada (método):** para cada rota, inspecionamos os hooks de `src/lib/api/*.ts` usados pela página — existência de ramo API real (`api.GET/POST/PATCH/DELETE`), mutações reais vs. `toast` local, e tratamento de loading/erro/vazio. Vereditos vêm do código, não de intenção. Ao mudar uma tela, **atualize esta tabela no mesmo PR**.

**Legenda:** **Ligada** = leitura e mutações principais reais · **Parcial** = leitura real, mutações locais ou campos faltando · **Mock** = só `lib/data.ts`, sem ramo API.

## Resumo: 8 Ligadas · 3 Parciais · 13 Mock (24 rotas)

| Rota | Status | Endpoints reais usados | Ressalvas / o que falta |
|------|--------|------------------------|--------------------------|
| `/login` | **Ligada** | `GET /api/v1/project/info` | Valida chave real; sessão via `setApiKey` (localStorage — ver HANDOFF §5.1) |
| `/onboarding` | **Ligada** | `POST /auth/register` | Cria org+projeto+key reais; trata 409; key exibida uma vez. ⚠ passos Workspace/Agente/Canal coletam dados que o payload não envia |
| `/projects` | **Ligada** | `GET`/`POST /api/v1/manage/projects` | Select de workspace ainda usa mock; contagens agentes/canais só no mock (gap de campo) |
| `/workspaces` | **Ligada** | `GET`/`POST /api/v1/manage/workspaces` · `GET /manage/projects` | `members` e contagens demo-only; botões Abrir/Configurar sem ação |
| `/channels` | **Ligada** | `GET`/`POST .../channels` · `GET`/`POST`/`DELETE /manage/api-keys` | Reconectar/Configurar/Testar só toast (sem endpoint); rotação de chave = POST nova + DELETE antiga |
| `/billing` | **Ligada** | `GET /billing/balance` · `GET /billing/plans` · `POST /billing/purchase` · `POST /billing/subscribe` | Histórico de transações ilustrativo (sem endpoint); faturas/CSV só toast; auth por `X-Org-Id` |
| `/playground` | **Ligada** | `POST /chat/message/stream` (SSE) + fallback `POST /chat/message` · agentes reais | Controles Modelo/Temperatura/Memória/Tools são locais, não vão no request; abas Imagem/Voz "em breve" |
| `/studio` | **Ligada** | `GET`/`POST /payload-rules` · `PUT /payload-rules/{id}` · `POST /payload-rules/interpret` | Regras de "Voz" só na demo; preview YAML decorativo |
| `/agents` | **Parcial** | `GET .../projects/{id}/agents` | Leitura real com L/E/V; "Conversas hoje" hardcoded; memória/nº tools ausentes na API (gap de campo) |
| `/conversations` | **Parcial** | `GET /conversations` · `GET /chat/history` | Assumir/Resolver/Atribuir/resposta são locais (sem PATCH no backend); preview sem texto da última mensagem |
| `/memory` | **Parcial** | `PATCH /manage/projects/{id}` | Salva estratégia+janela reais; métricas ilustrativas; Retenção/Embeddings não persistem |
| `/dashboard` | Mock | — | Depende de `/api/v1/analytics/*` (não existe); sem estados L/E/V |
| `/analytics` | Mock | — | Depende de `/api/v1/analytics/*` |
| `/agents/[id]` (Builder) | Mock | — | Editor não persiste (endpoint `PATCH .../agents/{id}` existe — ligar é o próximo passo natural, ver ISSUES) |
| `/tools` | Mock | — | Depende de `/api/v1/manage/tools` (não existe) |
| `/mcp` | Mock | — | Depende de `/api/v1/manage/mcp-servers` (não existe) |
| `/settings` | Mock | — | Depende de `/api/v1/manage/organization` (não existe) |
| `/deploy` | Mock | — | Depende de `/api/v1/deploy/*` (não existe) |
| `/integrations` | Mock | — | Sem endpoint; PAT/conectar são estado local |
| `/super-admin` | Mock | — | Sem RBAC no backend; não ligar antes disso (HANDOFF §5.1) |
| `/` (landing) | Mock | — | Estática; nada a integrar |
| `/design` | Mock | — | Style guide vivo (estático por natureza) |
| `/fluxos` | Mock | — | Roteiros estáticos |
| `/handoff` | Mock | — | Redirect para `/design` |

## Validação contra o backend (⚠ pendências)

Suspeitas de contrato levantadas por inspeção do frontend — a confirmar/refutar contra o código do backend (`clvschaves/agnohub`), com arquivo:linha dos dois lados:

1. `useToggleStudioRule` faz `PUT /payload-rules/{id}` com body parcial `{ is_active }` (`src/lib/api/studio.ts`) — backend aceita PUT parcial?
2. Billing autentica por header `X-Org-Id` (`src/lib/api/billing.ts`) — confirmar contrato de auth por org.
3. `useCreateChannel` envia `session_strategy: "user_per_day"` fixo e mapeia `channel_type` de rótulos PT; Instagram só existe no mock (`src/lib/api/channels.ts`) — validar enum e default.
4. SSE do chat: shape `token`/`done`/`[DONE]` e fallback silencioso (`src/lib/api/chat.ts`) — validar contra o emissor real.
5. `GET /conversations`: schema tolera resposta sem lista (`.nullish()` + `?? []` em `src/lib/api/schemas.ts`) — resposta 200 sem a chave viraria lista vazia silenciosa; confirmar shape real (status/preview).
6. `POST /auth/register`: payload envia só `name/email/password/org_name` (`src/lib/api/register.ts`) — confirmar quais campos o backend aceita (workspace/agente/canal do onboarding).

## Divisão de responsabilidade das docs

- **`STATUS.md` (este arquivo):** status de **integração** por tela — fonte única.
- **Rota `/design` + `system.ts`:** status de **design** (adesão ao design system).
- **`HANDOFF.md`:** arquitetura, contrato de API, gaps de backend, decisões e riscos.
- **`ISSUES.md`:** backlog acionável.
