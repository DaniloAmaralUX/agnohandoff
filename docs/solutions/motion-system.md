---
track: knowledge
category: design-system
problem_type: motion-microinteractions
component: src/app/globals.css, src/components/bits.tsx, src/components/ui/button.tsx
applies_when:
  - Precisa adicionar motion a um painel admin sem deixar lento ou gratuito
---

# Sistema de motion (admin = contido)

**Já presente (não refazer):** shadcn/Radix trazem press (`active:scale-[0.96]`), focus-ring e animações `data-state` (Dialog/Sheet/Dropdown via `tw-animate-css`). `prefers-reduced-motion` já é global no `globals.css`.

**Adicionado:** vocabulário no `@theme` — `ease-enter` / `ease-exit` / `ease-spring`; utilitário `animate-rise` (entrada sutil, 260ms); **hover-lift** nos cards clicáveis; componente **`EmptyState`** (`bits.tsx`).

**Regras (das fontes — ver [[design-references-desengs]]):**
- Durações 100 / 150 / 250 / 300ms — **nunca >500** (Lei de Doherty <400ms).
- `ease-out` entra, `ease-in` sai, `spring` confirma.
- **~70% sem motion**; só animar o que **comunica** (feedback/transição), nunca decorativo ou auto-disparado.

**Pendente:** optimistic UI (precisa de mutations wired) + **⌘K** command menu (`cmdk`).
