# AgnoHub — painel de agentes de IA

Painel React para construir, publicar e operar agentes de IA conversacionais com
memória persistente — omnichannel (WhatsApp, Web Widget, Telegram, Instagram),
MCP, ferramentas e analytics.

Este repositório é o **handoff de design→dev**: o produto completo com
**todos os fluxos funcionando em dados mock** (read-only) e a camada de dados
pronta para ligar na API real. O design system, os padrões e os contratos estão
documentados — o trabalho do dev é trocar o mock pelos endpoints (ver
[`HANDOFF.md`](./HANDOFF.md)).

## Rodando

```bash
pnpm install
pnpm dev        # http://localhost:3000 — MODO DEMO (mock) por padrão
```

**Dois modos, decididos por env** (`src/lib/config.ts`):

| Modo | Como | O que acontece |
|---|---|---|
| **Demo (mock)** | sem `NEXT_PUBLIC_API_URL` | todas as telas funcionam com dados de exemplo; ações são otimistas (toast), sem persistência |
| **API (real)** | `NEXT_PUBLIC_API_URL=http://localhost:9090` (ver `.env.example`) | telas de referência (Projetos/Agentes) consomem a FastAPI com `X-API-Key`; login exige chave válida |

## Scripts

```bash
pnpm verify       # typecheck + lint + unit + e2e (o gate de qualidade)
pnpm test         # vitest (unit, com gate de cobertura: 70% global / 85% em src/lib/api)
pnpm test:e2e     # playwright (smoke)
pnpm design:audit # mede drift do design system → src/app/design/audit.json
pnpm gen:api      # regenera os tipos do OpenAPI (backend em :9090)
```

## Arquitetura (mapa rápido)

```
src/
  app/(app)/           # telas do painel (sidebar+topbar) — 1 pasta por rota
  app/{login,onboarding,super-admin}/  # fora do grupo (sem AuthGuard)
  app/design/          # documentação de design VIVA (/design) — fonte da verdade
  lib/api/             # camada de dados: client tipado (openapi-fetch) + Zod +
                       # TanStack Query; hooks de referência: useProjects/useAgents
  lib/data.ts          # o mock (uma fonte só, tipada)
  components/ui/       # shadcn/radix
  components/data-table/  # DataTable (TanStack Table) — sort/busca/filtro/paginação
  components/{bits,form-sheet,memory-hub}.tsx  # padrões do produto
docs/solutions/        # gotchas resolvidos (leia antes de mexer no que eles cobrem)
```

**Padrões que o produto inteiro segue** (specs em [`DESIGN-HANDOFF.md`](./DESIGN-HANDOFF.md)):
- **Padrão de ação**: CTA → `FormSheet` (RHF+zod) → update otimista + toast (§4).
- **Estados**: loading skeleton / erro banner+retry / vazio EmptyState — referência em Projetos/Agentes.
- **Tokens**: OKLCH em `src/app/globals.css`; **nunca** hex hardcoded (o `design:audit` pega).

## O que falta (backlog do dev)

[`ISSUES.md`](./ISSUES.md) — ligar as demais telas à API (padrão pronto), endpoints
que faltam no backend, auth definitivo, Storybook (adiado por bug de ambiente —
documentado em `docs/solutions/`).

## Créditos

- Design system inspirado no tema Firecrawl; tipografia display [Fraunces](https://fonts.google.com/specimen/Fraunces) (self-hosted).
- `src/components/data-table/` portado e adaptado de [satnaing/shadcn-admin](https://github.com/satnaing/shadcn-admin) (MIT © Sat Naing).
