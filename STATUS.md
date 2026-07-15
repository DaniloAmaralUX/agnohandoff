# STATUS — verdade por tela (fonte única de integração)

> **Posicionamento:** este repositório é um **protótipo avançado React com integração inicial ao backend**. NÃO é um frontend de produção. Toda tela funciona em **modo demo** (mock, sem persistência); a coluna abaixo descreve o comportamento em **modo API**.
>
> **Frontend:** branch `claude/determined-gauss-sgvjcs` (2026-07-15) · **Backend de referência:** `clvschaves/agnohub` — SHA: _a fixar pelo dev com acesso ao repo_; contrato validado contra o `schema.ts` gerado do OpenAPI real em 2026-07-07 (ver §Validação).

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

## Validação de contrato (feita contra `src/lib/api/schema.ts`)

**Fonte:** `schema.ts` é gerado do `/openapi.json` do backend real (`pnpm gen:api`); último regen em **2026-07-07** (data do commit). É o melhor retrato do contrato disponível neste repositório. **Ação do dev:** com acesso a `clvschaves/agnohub`, fixar o SHA do backend aqui e re-rodar `pnpm gen:api` para revalidar.

| # | Suspeita | Veredito | Evidência |
|---|---|---|---|
| 1 | `PUT /payload-rules/{id}` com body parcial `{is_active}` | ✅ **Refutada** — todos os campos de `PayloadRuleUpdate` são opcionais | `schema.ts:1215-1234` × `studio.ts:78-79` |
| 2 | Billing por header `X-Org-Id` | ✅ **Refutada** — header é parâmetro obrigatório das 3 rotas no contrato | `schema.ts:2461-2573` × `billing.ts:73,133,169` |
| 3 | `channel_type` de rótulos PT / Instagram | ⚠ **Confirmada em parte** — `channel_type` é string livre (sem enum); "instagram" passa no tipo mas não tem cobertura declarada; `session_strategy` fixo coincide com o default do contrato | `schema.ts:928-933` × `channels.ts:41-46,119` |
| 4 | Shape dos eventos SSE do chat | ◻ **Indecidível pelo contrato** — rota existe, mas response é `unknown` (OpenAPI não modela event-stream); shape `token`/`done` vive só no frontend | `schema.ts:1568,1587` × `chat.ts:54-59` |
| 5 | `GET /conversations` esconde erro via `.nullish()` | ◻ **Indecidível** — response 200 é `unknown` no contrato; opcionalidade e campos de status/preview são convenção defensiva do frontend, não garantia | `schema.ts:1745-1766` × `schemas.ts:133-150` |
| 6 | Onboarding coleta dados que o register ignora | ⚠ **Confirmada** — `RegisterRequest` aceita só `name/email/password/org_name`; passos Workspace/Agente/Canal exigem chamadas separadas pós-registro | `schema.ts:1336-1345` × `register.ts:38-43` |
| 7 | `project_id` nas API keys | ✅ POST **exige** `project_id`; ◻ na listagem a response é `unknown` — presença por item é inferência do frontend | `schema.ts:832-837,2336` × `api-keys.ts:75` |

**Implicações registradas no backlog:** onboarding completo = orquestrar `/manage/workspaces` + `.../agents` + `.../channels` após o register (US no `docs/BACKLOG.md`); tipar as respostas `unknown` no OpenAPI do backend é gap prioritário (conversations, api-keys).

## Divisão de responsabilidade das docs

- **`STATUS.md` (este arquivo):** status de **integração** por tela — fonte única.
- **Rota `/design` + `system.ts`:** status de **design** (adesão ao design system).
- **`HANDOFF.md`:** arquitetura, contrato de API, gaps de backend, decisões e riscos.
- **`ISSUES.md`:** backlog acionável.
