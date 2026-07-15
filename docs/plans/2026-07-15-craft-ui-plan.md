# Craft de UI — Plan

**Goal Capsule:** fechar os bugs de frontend confirmados, tornar o modo demo honesto, garantir mobile 390 e a11y mensurada, alinhar a fundação shadcn e blindar contra regressão — sem alterar o tema (tokens em `globals.css`) nem o dual-mode. Autoridade: `docs/PRD.md` (Épico D). Stop: qualquer unit que exigir mudança de contrato de backend sai do escopo e vira item no `ISSUES.md`.

**Verification Contract:** `pnpm verify` (typecheck+lint+unit+e2e) verde após cada unit; `pnpm design:audit` sem novos hits; ao final: `tests/e2e/mobile.spec.ts` verde nas 17 rotas `(app)` e axe sem violações críticas.

## Implementation Units

- **U1 fix(playground) hydration:** `src/lib/api/chat.ts` — sessionId deixa de nascer de `Math.random()` no render (gera pós-mount); `playground/page.tsx` mostra "—" enquanto vazio. Teste em `chat.test.tsx`.
- **U2 fix(nav) menu móvel:** `src/components/app-sidebar.tsx` — links fecham o Sheet (`setOpenMobile(false)`); foco volta ao trigger (comportamento Radix ao fechar controlado).
- **U3 fix(a11y) main único:** `SidebarInset` (`src/components/ui/sidebar.tsx`) vira `div`; `main#main-content` do layout permanece.
- **U4 fix(channels) chave do projeto ativo:** `api-keys.ts` expõe `projectId`; `channels/page.tsx` filtra pela `useActiveProject()`.
- **U5 feat(auth) mitigações:** handler global 401 em `query-provider.tsx` (limpa chave + `/login`); `queryClient.clear()` em logout/login/registro.
- **U6 feat(builder) demo honesto:** "Descartar" restaura (remount por `key`); "Publicar" atualiza defaults; `confirm()` → Dialog; toasts de demo não alegam persistência (varredura).
- **U7 feat(e2e) mobile 390:** `tests/e2e/mobile.spec.ts` (17 rotas, falha se `scrollWidth > 390`) + correções de reflow apontadas.
- **U8 fix(a11y) nomes e semântica:** `value` no Root do Progress; `aria-label` em selects/sliders/switches sem nome; `aria-hidden` no X de Dialog/Sheet; axe via `@axe-core/playwright`.
- **U9 chore(ui) alinhamento shadcn:** diff dos 24 primitivos vs. upstream `radix-nova` (clone oficial pinado); tabela-garantia no HANDOFF; validação do theming vs. doc Tailwind v4.
- **U10 chore(audit) anti-regressão:** regras novas no `design-audit.mjs` (larguras fixas, random em useState, toast que alega persistência); `design:audit` no CI; motion onde o audit apontar.

## Definition of Done
Todos os units commitados individualmente, gates verdes, lições não-triviais documentadas em `docs/solutions/`, screenshots antes/depois das telas retocadas.
