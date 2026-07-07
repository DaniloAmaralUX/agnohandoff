---
track: knowledge
category: testing
problem_type: throwing-middleware-untested
component: src/lib/api/client.ts, src/lib/api/agents.ts, src/lib/api/projects.ts
---

# Middleware do openapi-fetch que lança: teste os handlers direto, não pelo hook

**Contexto:** o `authMiddleware.onResponse` do `client.ts` lança `ApiError` em
respostas não-2xx (extrai `detail` do FastAPI, fallback p/ corpo não-JSON). Um
`ce-code-review` (3 revisores independentes) achou dois efeitos não óbvios disso.

**Guia:**
1. **O branch `{ error }` do hook fica MORTO.** Como o `onResponse` roda *fora* do
   try/catch do openapi-fetch (v0.17), o throw rejeita a promise de `api.GET(...)` —
   nunca retorna `{ error }`. Então `const { data, error } = await api.GET(...); if (error) throw new ApiError(0, …)`
   é inalcançável para erros HTTP, **e zeraria o status** se rodasse. Ou remova o
   branch (deixando o `safeParse` cuidar do corpo 2xx), ou preserve o status:
   `error instanceof ApiError ? error : new ApiError(0, …)`.
2. **Mockar `./client` no teste do hook não cobre a lógica de erro.** `vi.mock("./client")`
   troca o `api.GET` por um `vi.fn()` que devolve `{ data, error }` — um shape que o
   client real (com o middleware que lança) não produz mais. A lógica de shaping do
   erro fica com **cobertura zero** e pode quebrar em silêncio (typo em `"detail"`,
   mensagem padrão errada) sem nada ficar vermelho.

**Por que importa:** o objetivo do endurecimento era tratamento de erro uniforme;
sem testar o middleware, o caminho de erro *real* (o que o usuário encontra num 401/500)
não tem rede de segurança, e os hooks carregam dead code que finge tratar erros.

**Quando aplicar:** qualquer middleware de client (openapi-fetch/fetch) que *lança* em
vez de retornar erro. Exporte o handler e teste-o isolado.

**Exemplo:** `client.test.ts` chama `authMiddleware.onResponse({ response })` com
`Response` montados à mão (200; 404 com `{detail}`; 500 sem detail; corpo não-JSON) —
cobre a lógica sem precisar de servidor HTTP nem de `msw`. O `client.ts` entrou no
`include` de cobertura (antes ficava de fora, mascarando o buraco).
