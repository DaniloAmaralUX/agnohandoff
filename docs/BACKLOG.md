# BACKLOG — Handoff AgnoHub (painel React)

Backlog derivado de [`STATUS.md`](../STATUS.md) e [`ISSUES.md`](../ISSUES.md) (com contexto de [`HANDOFF.md`](../HANDOFF.md) §4 e §5.1), destinado ao dev que assume o projeto. Cada história está pronta para virar issue no GitHub Project. Não inclui as tarefas de craft de UI já em execução nesta entrega (mobile/a11y/bugs de frontend) — o foco é o trabalho futuro: ligar telas mock, endpoints faltantes, auth definitivo, E2E e observabilidade.

**Prioridade:** **P0** = bloqueia produção · **P1** = alto valor · **P2** = melhoria.

---

## Épico 1 — Integração de telas (ligar mock na API)

Padrão de integração em HANDOFF §2: hook em `src/lib/api/*` + página client + estados loading/erro/vazio + `pnpm verify`.

### [P1] US-01 — Ligar o Agent Builder ao PATCH de agentes
**Como** administrador **quero** editar um agente e persistir no backend **para** que a configuração valha nas conversas reais.
**Contexto:** `/agents/[id]` é Mock, mas o endpoint `PATCH /api/v1/manage/projects/{id}/agents/{agentId}` já existe; `useToggleAgent` já faz o PATCH de `is_active`. Form real com RHF+zod (name, role, instructions, model, temperature, flags).
**Critérios de aceite:**
- Dado o modo API, quando salvo o form, então um `PATCH .../agents/{agentId}` é enviado com os campos alterados e a lista de agentes é revalidada.
- Dado erro da API, quando o PATCH falha, então exibo toast de erro e mantenho o form editável (sem perder dados digitados).
- Dado o modo demo (`USE_MOCK`), quando salvo, então o comportamento atual (toast "demo") é preservado.
**Dependências:** nenhuma (endpoint existe).

### [P1] US-02 — Ligar Dashboard e Analytics aos endpoints de analytics
**Como** gestor **quero** ver métricas reais (tokens/dia, top agentes, latência, custo) **para** acompanhar a operação.
**Contexto:** `/dashboard` e `/analytics` são Mock e dependem de `/api/v1/analytics/*` (não existe). Criar hook `src/lib/api/analytics.ts` seguindo o padrão de `projects.ts`.
**Critérios de aceite:**
- Dado o modo API, quando abro `/dashboard` ou `/analytics`, então os dados vêm de `GET /api/v1/analytics/*` com estados loading/erro/vazio.
- Dado erro da API, quando o fetch falha, então vejo banner de erro com botão de refetch.
- Dado o modo demo, quando abro as telas, então os dados de `lib/data.ts` continuam funcionando.
**Dependências:** US-08 (endpoint `/api/v1/analytics/*`).

### [P1] US-03 — Ligar a tela de Ferramentas ao CRUD de CustomTool
**Como** administrador **quero** criar/editar/remover ferramentas customizadas pela UI **para** não depender do admin Streamlit.
**Contexto:** `/tools` é Mock; depende de `/api/v1/manage/tools`. Criar `src/lib/api/tools.ts`.
**Critérios de aceite:**
- Dado o modo API, quando abro `/tools`, então a lista vem de `GET /api/v1/manage/tools` com loading/erro/vazio.
- Dado o form preenchido, quando crio/edito/removo uma tool, então a mutação real é enviada e a lista é revalidada.
- Dado um erro de validação do backend, quando salvo, então a mensagem orienta a correção.
**Dependências:** US-05 (endpoint `/manage/tools`).

### [P1] US-04 — Ligar a tela de MCP ao CRUD de MCPServer (com teste de conexão)
**Como** administrador **quero** cadastrar servidores MCP e testar a conexão **para** habilitar tools externas com segurança.
**Contexto:** `/mcp` é Mock; depende de `/api/v1/manage/mcp-servers`. Criar `src/lib/api/mcp.ts`.
**Critérios de aceite:**
- Dado o modo API, quando abro `/mcp`, então listo servidores reais com loading/erro/vazio.
- Dado um servidor cadastrado, quando clico em "Testar conexão", então o resultado real (sucesso/falha + motivo) é exibido.
- Dado CRUD, quando crio/edito/removo, então as mutações persistem no backend.
**Dependências:** US-06 (endpoint `/manage/mcp-servers`).

### [P1] US-05 — Ligar Configurações da organização (GET/PATCH)
**Como** administrador **quero** ver e editar as configurações da org pela UI **para** administrar sem acesso direto ao banco.
**Contexto:** `/settings` é Mock; depende de `/api/v1/manage/organization`. Criar `src/lib/api/organization.ts`.
**Critérios de aceite:**
- Dado o modo API, quando abro `/settings`, então os dados vêm de `GET /api/v1/manage/organization`.
- Dado o form alterado, quando salvo, então `PATCH /api/v1/manage/organization` persiste e a UI reflete o novo estado.
- Dado erro, quando o PATCH falha, então toast de erro sem perda do form.
**Dependências:** US-07 (endpoint `/manage/organization`).

---

## Épico 2 — Endpoints de backend (repo `clvschaves/agnohub`)

O admin Streamlit acessa o banco direto; o React precisa de API (HANDOFF §4). Após cada endpoint, rodar `pnpm gen:api` para regenerar `src/lib/api/schema.ts`.

### [P1] US-06 — Criar `/api/v1/manage/tools` (CRUD CustomTool)
**Como** dev de backend **quero** expor CRUD de `CustomTool` **para** desbloquear a tela Ferramentas.
**Contexto:** HANDOFF §4 (prioridade alta). Entidade já existe no admin Streamlit.
**Critérios de aceite:**
- Dado `X-API-Key` válida, quando chamo GET/POST/PATCH/DELETE, então as operações respeitam o escopo do projeto/org.
- Dado o endpoint publicado, quando rodo `pnpm gen:api`, então os tipos aparecem em `schema.ts`.
- Dado payload inválido, quando envio POST/PATCH, então recebo 422 com detalhe por campo.
**Dependências:** nenhuma.

### [P1] US-07 — Criar `/api/v1/manage/mcp-servers` (CRUD + testar conexão)
**Como** dev de backend **quero** CRUD de `MCPServer` com ação de teste **para** desbloquear a tela MCP.
**Critérios de aceite:**
- Dado um servidor cadastrado, quando chamo a ação de teste, então a resposta indica sucesso/falha com mensagem diagnóstica.
- Dado credenciais/segredos, quando listo servidores, então segredos não retornam em claro.
- Dado o spec atualizado, quando rodo `pnpm gen:api`, então o frontend tipa as rotas.
**Dependências:** nenhuma.

### [P1] US-08 — Criar `/api/v1/manage/organization` (GET/PATCH settings)
**Como** dev de backend **quero** expor leitura e edição das settings da org **para** desbloquear a tela Configurações.
**Critérios de aceite:**
- Dado auth válida, quando faço GET, então recebo as settings da org do chamador (sem vazar outras orgs).
- Dado PATCH parcial, quando envio só os campos alterados, então apenas eles são atualizados.
**Dependências:** nenhuma.

### [P1] US-09 — Criar `/api/v1/analytics/*` (agregações)
**Como** dev de backend **quero** endpoints de agregação (tokens/dia, top agentes, latência, custo) **para** desbloquear Dashboard e Analytics.
**Contexto:** HANDOFF §4 (prioridade média no board, mas desbloqueia duas telas).
**Critérios de aceite:**
- Dado um intervalo de datas, quando consulto, então recebo séries agregadas por dia.
- Dado múltiplos agentes, quando consulto top agentes, então o ranking respeita o escopo do projeto ativo.
**Dependências:** nenhuma.

### [P1] US-10 — Expor PATCH de conversas (ações humanas)
**Como** atendente **quero** que Assumir/Resolver/Atribuir/responder persistam **para** que o handoff humano funcione de verdade.
**Contexto:** `/conversations` é Parcial: leitura real (`GET /conversations` · `GET /chat/history`), mas as ações são locais — sem PATCH no backend (STATUS.md). Frontend em `src/lib/api/conversations.ts`.
**Critérios de aceite:**
- Dado o endpoint criado, quando assumo/resolvo/atribuo uma conversa, então o estado persiste e sobrevive a reload.
- Dado uma resposta humana, quando envio, então ela entra no histórico real da sessão.
- Dado o frontend, quando o backend responde erro, então a ação sofre rollback com toast.
**Dependências:** endpoint PATCH de conversas no backend; depois, ligar as mutações em `conversations.ts`.

### [P2] US-11 — Completar campos faltantes em endpoints existentes
**Como** dev frontend **quero** os campos que as telas já esperam **para** eliminar dados hardcoded/ocultos.
**Contexto:** HANDOFF §4 "Gaps de campo": `AgentConfig` (flag de memória + contagem de tools), projeto (contagem de agentes/canais + nome do workspace), `GET /conversations` (filtros role/agente, paginação, dados de voz, texto da última mensagem no preview).
**Critérios de aceite:**
- Dado a listagem de agentes, quando os campos chegam, então `/agents` exibe memória e nº de tools sem mudança de código (a tela já os usa quando presentes).
- Dado a resposta de projeto com contagens e nome do workspace, quando listo projetos, então os cards mostram os contadores no modo API.
- Dado filtros em `/conversations`, quando filtro por role/agente, então o backend pagina e filtra server-side.
**Dependências:** nenhuma.

### [P2] US-12 — Criar `/api/v1/billing/transactions` e `/api/v1/deploy/*`
**Como** administrador **quero** histórico real de créditos e status de deploy **para** substituir os dados ilustrativos.
**Contexto:** `/billing` é Ligada mas o histórico é ilustrativo; `/deploy` é Mock. HANDOFF §4 (prioridade baixa).
**Critérios de aceite:**
- Dado o endpoint de transações, quando abro Faturamento, então o histórico exibe transações reais paginadas.
- Dado `/deploy/*`, quando abro Deploy, então status/modos vêm da API com loading/erro/vazio.
**Dependências:** nenhuma.

---

## Épico 3 — Auth definitivo

Riscos mapeados em HANDOFF §5.1 — decisões de protótipo a revisitar **antes de produção**.

### [P0] US-13 — Migrar sessão de localStorage para cookie httpOnly com expiração/refresh
**Como** operador **quero** sessão em cookie httpOnly com expiração e refresh **para** eliminar exfiltração da chave via XSS.
**Contexto:** hoje a sessão é `X-API-Key` em `localStorage` (`src/lib/auth.ts`), espelhando o admin Streamlit; a chave de projeto funciona como login administrativo (HANDOFF §5.1). Separar papel administrativo de chave de integração.
**Critérios de aceite:**
- Dado login bem-sucedido, quando a sessão é criada, então nenhuma credencial fica acessível a JavaScript (cookie httpOnly).
- Dado sessão próxima de expirar, quando há atividade, então o refresh renova sem interromper o usuário.
- Dado logout, quando executado, então cookie e cache de dados são invalidados.
**Dependências:** suporte a sessão/refresh no backend.

### [P0] US-14 — Handler global de 401 (sessão expirada → /login)
**Como** usuário **quero** ser levado ao `/login` quando a sessão expira **para** nunca operar sobre dados obsoletos.
**Contexto:** hoje 401 não encerra a sessão; a UI segue exibindo cache até o usuário navegar (HANDOFF §5.1). Ponto de intervenção: `src/lib/api/client.ts`.
**Critérios de aceite:**
- Dado qualquer resposta 401, quando ocorre, então a chave é limpa, o cache do TanStack Query é esvaziado e há redirect para `/login`.
- Dado o redirect, quando faço login de novo, então volto (ou sou orientado a voltar) ao contexto anterior sem dados da sessão antiga.
**Dependências:** nenhuma (aplicável já ao modelo atual de X-API-Key).

### [P0] US-15 — Isolar cache de dados por sessão/conta
**Como** operador **quero** que troca de chave nunca exiba dados da sessão anterior **para** evitar vazamento entre contas.
**Contexto:** cache TanStack global sem isolamento (`src/lib/api/query-provider.tsx`) — trocar de chave pode exibir dados antigos até o refetch (HANDOFF §5.1).
**Critérios de aceite:**
- Dado logout/login/registro, quando a sessão muda, então `queryClient.clear()` (ou recriação do client) é executado.
- Dado produção, quando as queries rodam, então a identidade da sessão participa da `queryKey` ou o client é por sessão.
**Dependências:** nenhuma.

### [P1] US-16 — Login por org-key com seleção de projeto
**Como** administrador de org **quero** logar com a chave da org (`agnohub_…`) e escolher o projeto **para** administrar múltiplos projetos com uma credencial.
**Contexto:** ISSUES §Auth — a org-key autentica a org; o seletor de projeto da topbar (`ProjectProvider`, `src/lib/project-context.tsx`) já cobre a troca.
**Critérios de aceite:**
- Dado uma org-key válida, quando logo, então vejo os projetos da org e escolho o ativo.
- Dado uma chave de projeto (`proj_…`), quando logo, então o fluxo atual segue funcionando.
**Dependências:** contrato de auth por org no backend (ver também `X-Org-Id` do billing, STATUS §Validação item 2).

### [P1] US-17 — Não ligar `/super-admin` antes de RBAC no backend
**Como** responsável de segurança **quero** RBAC no backend antes de dados reais no super-admin **para** impedir acesso administrativo sem papel.
**Contexto:** `/super-admin` é Mock, fora do `AuthGuard`; qualquer pessoa com o link vê a tela (HANDOFF §5.1). Guard-rail explícito no backlog.
**Critérios de aceite:**
- Dado ausência de RBAC, quando alguém propõe ligar a tela, então a issue bloqueia a integração (dependência declarada).
- Dado RBAC entregue, quando a tela for ligada, então ela entra no `AuthGuard` e valida o papel no backend.
**Dependências:** RBAC/papéis no backend.

---

## Épico 4 — Qualidade / observabilidade

### [P0] US-18 — E2E dos fluxos autenticados com backend real + validação de contrato
**Como** time **quero** E2E com backend de teste e `pnpm gen:api` contra o `openapi.json` real **para** garantir que o front não desalinha do back.
**Contexto:** ISSUES §Qualidade. Cobrir também as 6 suspeitas de contrato de STATUS §Validação (PUT parcial de payload-rules, `X-Org-Id` do billing, enum de `channel_type`, shape do SSE, `GET /conversations` `.nullish()`, payload do `/auth/register`).
**Critérios de aceite:**
- Dado o backend de teste de pé, quando o E2E roda, então login → seleção de projeto → tela ligada → mutação real passam de ponta a ponta.
- Dado o `openapi.json` real, quando rodo `pnpm gen:api`, então `schema.ts` regenera sem breaking diffs não tratados.
- Dado cada suspeita de contrato, quando validada, então STATUS §Validação é atualizado com arquivo:linha dos dois lados.
**Dependências:** backend de teste disponível.

### [P1] US-19 — Observabilidade de erros de API (toast + log)
**Como** dev **quero** todo erro de API padronizado em toast + log estruturado **para** diagnosticar problemas em produção.
**Contexto:** ISSUES §Qualidade. Ponto central: `src/lib/api/client.ts` e os hooks de `src/lib/api/*`.
**Critérios de aceite:**
- Dado um erro de API em qualquer hook, quando ocorre, então o usuário vê toast com mensagem acionável e o erro é logado com rota/status/contexto.
- Dado erros repetidos, quando ocorrem, então não há spam de toasts duplicados.
**Dependências:** definir destino do log (console estruturado ou serviço externo).

### [P1] US-20 — Conectar o CI (`.github/workflows/ci.yml`) ao repositório
**Como** time **quero** o pipeline já pronto rodando em cada PR **para** manter o gate de testes (153 unit, cobertura 85%/80% em `api/**`).
**Critérios de aceite:**
- Dado um PR aberto, quando o CI roda, então lint, typecheck, testes e gate de cobertura executam e bloqueiam merge em falha.
**Dependências:** permissão de admin no repositório GitHub.

### [P2] US-21 — Storybook como catálogo de componentes
**Como** dev **quero** o Storybook rodando (provável sucesso no CI Linux) **para** catalogar `src/components/*` além da rota `/design`.
**Contexto:** `storybook init` falhou no ambiente local Windows/Node25 (módulo nativo `oxc-resolver`) — ISSUES §Qualidade; a rota `/handoff`/`/design` cobre enquanto isso.
**Critérios de aceite:**
- Dado o ambiente Linux/CI, quando rodo o init/build do Storybook, então ele compila com stories dos componentes de `bits.tsx` e `ui/*`.
- Dado o catálogo publicado, quando um componente muda, então a story correspondente é atualizada no mesmo PR.
**Dependências:** US-20 (CI conectado) facilita o build em Linux.
