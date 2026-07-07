---
track: knowledge
category: architecture
problem_type: dual-mode-data-layer
component: src/lib/config.ts, src/lib/api
applies_when:
  - Precisa manter um demo público (mock) vivo enquanto os devs constroem contra a API real
  - Quer a mesma base de código servindo protótipo e produto
---

# Modo mock ↔ API (dual-mode) sem branch separada

**Padrão:** `USE_API = Boolean(NEXT_PUBLIC_API_URL)`. Cada hook em `src/lib/api/*` faz `if (USE_MOCK) return mapMock(...)`, senão chama `api.GET(...)`. Assim:
- Sem env (deploy Vercel) → **modo demo** com `src/lib/data.ts`.
- Com env → **API real** (FastAPI).

**Por que funciona:** a UI só conhece uma *view* normalizada; a origem (mock/API) é detalhe do hook. O demo do stakeholder nunca quebra e devs desenvolvem contra a API na mesma base.

**Aplicar:** `HANDOFF.md §2` ("como ligar uma tela"). Referências: `projects.ts` (flat), `agents.ts` (aninhado).
