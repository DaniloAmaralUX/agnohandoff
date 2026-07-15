---
track: bug
category: responsive
problem_type: layout-overflow
component: src/components/topbar.tsx
symptoms:
  - Todas as rotas do grupo (app) estouram a largura em 390px (scroll horizontal)
  - Auditoria externa reportou "17 telas ultrapassam 390px" — parecia problema tela-a-tela
root_cause: componente compartilhado (topbar) sem min-width, empurrando o layout
resolution_type: code_fix
severity: high
tags: [mobile, overflow, topbar, breadcrumb, e2e]
---

# Overflow mobile em "todas as telas" = quase sempre UM culpado compartilhado

## Problem
Uma auditoria apontou que as 17 telas internas estouravam 390px. A leitura natural — "cada tela tem um problema de responsividade" — levaria a 17 investigações.

## Symptoms
`document.documentElement.scrollWidth` ≈ 494–521px em toda rota `(app)`, viewport 390px.

## What Didn't Work
Procurar grids/tabelas largos tela a tela: eles existem, mas não eram a causa raiz do overflow do documento.

## Solution
Diagnóstico por DOM (Playwright, `getBoundingClientRect().right > viewport`) apontou o mesmo elemento em todas as rotas: o **breadcrumb da topbar** (`src/components/topbar.tsx`), um componente compartilhado do shell, sem `min-width: 0`. Ele não encolhia e empurrava as ações do topo para fora.

Fix: `nav` com `min-w-0 flex-1`, breadcrumb completo escondido no mobile (`hidden sm:flex`), só o nó atual visível com `truncate`. Uma mudança resolveu as 17 rotas.

## Why This Works
Em App Router, o shell (sidebar + topbar) envolve todas as páginas do grupo. Um overflow no shell aparece em toda rota e mascara-se de "problema de cada tela". `min-w-0` permite o flex item encolher abaixo do conteúdo (o default `min-width:auto` é o que causa o transbordo).

## Prevention
- `tests/e2e/mobile.spec.ts` falha se `scrollWidth > 390` em qualquer rota — guardião de regressão.
- `scripts/design-audit.mjs` sinaliza larguras fixas `w-[≥390px]` como risco estático.
- Regra: ao ver "todas as telas" com o mesmo sintoma, suspeite primeiro do layout/shell compartilhado antes de investigar telas individualmente.
