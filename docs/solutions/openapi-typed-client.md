---
track: bug
category: types
problem_type: openapi-fetch-unknown-data
component: src/lib/api/client.ts, src/lib/api/projects.ts
---

# openapi-fetch tipa `data` como `{}` — precisa de cast local

**Problema:** `const { data } = await api.GET("/api/v1/manage/projects")` deixa `data` como `{}`, então `data.projects` não compila.

**Sintomas:** `Property 'projects' does not exist on type '{}'` no `tsc --noEmit`.

**Solução:** cast explícito no ponto de uso —
```ts
const list = ((data as { projects?: unknown[] })?.projects ?? []) as Array<Record<string, unknown>>;
```

**Por que funciona:** o gerador tipa respostas sem schema de `content` como `{}`. O cast é local e seguro; a fonte da verdade continua o `schema.ts` (regenerar com `pnpm gen:api`).

**Prevenção:** o backend declarar response models no OpenAPI → o cast desaparece.
