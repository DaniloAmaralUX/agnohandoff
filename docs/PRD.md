# PRD — AgnoHub Painel React: do Handoff ao Craft

> **Documento:** Product Requirements Document · **Autor:** Danilo Amaral (Product Designer) · **Data:** 2026-07-15 · **Escopo:** frontend React (`agnohandoff`); backend = `clvschaves/agnohub` (SHA de referência em `STATUS.md`).

## 1. Resumo executivo

O painel AgnoHub foi refeito em React/Next a partir do admin Streamlit original. O resultado é um **protótipo avançado com design system próprio e integração inicial ao backend** — não um frontend de produção. Este PRD define duas entregas: **(A) Handoff nota 10** — o repositório que um dev sênior continua sem fricção; **(B) Craft de UI** — experiência no padrão Notion/Apple/Cursor, dentro do escopo do frontend.

## 2. Contexto e problema

- O projeto original chegou como zip, sem histórico; o produto foi destilado por engenharia reversa e o frontend reconstruído com auxílio de IA.
- Auditorias (externa + própria, verificada contra o código) apontaram: contradições entre os documentos de handoff, bugs de frontend confirmados (Apêndice A), pendências de governança (repo público de trabalho corporativo, licença MIT pessoal) e dívidas de mobile/acessibilidade.
- O maior dano não é técnico: é de **credibilidade documental** — partes da doc prometiam "produção" enquanto outras admitiam "sem persistência real".

## 3. Objetivos e métricas de aceite

| # | Objetivo | Métrica |
|---|---|---|
| O1 | Governança resolvida | Repo privado/transferido; licença revisada; checklist do zip original executado (`docs/GOVERNANCE.md`) |
| O2 | Narrativa única e honesta | Zero contradições entre README/HANDOFF/DESIGN-HANDOFF/ISSUES; todos apontam para `STATUS.md` |
| O3 | Verdade verificável por tela | `STATUS.md` com as 24 rotas classificadas (Ligada/Parcial/Mock), vereditos citando arquivo:linha; SHA do backend fixado |
| O4 | Bugs de frontend confirmados fechados | Itens do Apêndice A corrigidos com teste de regressão |
| O5 | Mobile íntegro | 17 rotas `(app)` sem overflow horizontal em 390×844 (e2e automatizado) |
| O6 | A11y mensurada | axe sem violações críticas nas rotas; controles nomeados; um único `<main>` |
| O7 | Fundação shadcn garantida | Primitivos alinhados ao upstream; tabela-garantia (padrão vs. custom) no HANDOFF; `shadcn add` tematizado |
| O8 | Qualidade não regride | `pnpm verify` + `design:audit` verdes no CI a cada commit |

## 4. Não-objetivos

- Backend, endpoints novos, auth real (cookie httpOnly/refresh/RBAC) — trabalho do dev, documentado como tal.
- Reescrever o dual-mode `USE_MOCK` (padrão declarado; `docs/solutions/`).
- Refazer com template shadcn puro (decisão: manter identidade OKLCH/Firecrawl/Fraunces).
- Migração Radix→Base UI (suportada pelo upstream, decisão futura do dev).
- Storybook (bloqueio documentado em `docs/solutions/`).

## 5. Personas

- **Dev sênior (receptor):** precisa de verdade por tela, contratos validados, decisões arquiteturais escritas, backlog acionável.
- **Stakeholder:** precisa de demo confiável (modo mock) e segurança jurídica (IP, licença, repo privado).
- **Designer (autor):** precisa que a identidade visual sobreviva à continuação e que o craft seja o diferencial.

## 6. Requisitos por épico

**Épico A — Governança:** `docs/GOVERNANCE.md` com ações imediatas, transferência, branch protection e licença (aplicação condicionada à aprovação da empresa).

**Épico B — Handoff honesto:** `STATUS.md` como fonte única de status de integração; reconciliação de README/HANDOFF/DESIGN-HANDOFF/ISSUES; seção "Decisões arquiteturais e riscos" no HANDOFF (auth por X-API-Key em localStorage + risco XSS; cache TanStack global; 401 sem logout; dual-mode intencional); `CONTRIBUTING.md` + `CODEOWNERS`.

**Épico C — Validação contra o backend:** SHA fixado; cruzamento rotas FastAPI × chamadas do frontend (`src/lib/api/*`); cada suspeita de incompatibilidade confirmada/refutada com arquivo:linha dos dois repos; gaps atualizados no HANDOFF §4.

**Épico D — Craft de UI:**
- **D1 Bugs confirmados** (Apêndice A): hydration do playground; menu móvel fecha ao navegar; `<main>` único; regenerar chave filtra projeto ativo; 401 desloga + cache limpo em logout/login/registro.
- **D2 CTAs demo honestos:** padrão "otimista + toast honesto" (toast nunca alega persistência); "Descartar" restaura; "Publicar" atualiza defaults; varredura de botões mortos.
- **D3 Mobile 390:** `tests/e2e/mobile.spec.ts` (falha se `scrollWidth > 390`); correções de reflow.
- **D4 A11y:** `aria-valuenow` no Progress; nomes acessíveis em selects/sliders/switches; `aria-hidden` no X de Dialog/Sheet; sweep `-text`; contraste medido com axe.
- **D5 Alinhamento shadcn:** primitivos atualizados vs. upstream (tema preservado — vive em `globals.css`); tabela-garantia no HANDOFF; preset do design system documentado; nota sobre registry próprio.
- **D6 Motion + anti-regressão:** motion system aplicado; `design-audit.mjs` com regras novas (larguras fixas, `Math.random()` em `useState`, toasts que alegam persistência); `design:audit` no CI.

## 7. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Veredito de status errado | Incertezas marcadas "⚠ a validar" até a validação contra o backend |
| Backend divergir do validado | O entregável é o SHA fixado, não "compatível para sempre" |
| Atualização shadcn alterar visual | Tema em `globals.css`; screenshots antes/depois |
| Reflow mobile exigir decisão de design | Designer decide tela a tela na revisão de screenshots |

## 8. Aceitação final

Dev sênior consegue, só com o repo: entender o estado real (`STATUS.md`), rodar (`CONTRIBUTING.md`), continuar (backlog + decisões escritas) — sem perguntar nada ao designer. Gates: `pnpm verify`, `design:audit`, e2e mobile, axe.

---

## Apêndice A — Achados verificados contra o código

| Achado | Veredito | Evidência |
|---|---|---|
| Dois `<main>` aninhados | Confirmado | `src/components/ui/sidebar.tsx` (SidebarInset) + `src/app/(app)/layout.tsx` |
| Progress sem `aria-valuenow` | Confirmado | `src/components/ui/progress.tsx` — `value` não repassado ao Root |
| Select de paginação sem nome | Confirmado | `src/components/data-table/pagination.tsx` |
| Menu móvel não fecha ao navegar | Confirmado | `src/components/app-sidebar.tsx` — Links sem `setOpenMobile(false)` |
| Hydration mismatch (playground) | Confirmado | `src/lib/api/chat.ts` — `Math.random()` em init de `useState` |
| "Publicar" fake / "Descartar" não restaura | Confirmado | `src/app/(app)/agents/[id]/builder-bits.tsx` |
| Regenerar chave do projeto errado | Confirmado (frontend) | `channels/page.tsx` usa lista global; `api-keys.ts` descarta `project_id` |
| Conversations esconde erro | Parcialmente refutado | hook lança `ApiError`; risco real é `.nullish()` + `?? []` no schema — validar contra backend |
| Onboarding coleta dados ignorados | Confirmado | `register.ts` só envia name/email/password/org_name |
| Cache não isolado / 401 não desloga | Confirmado | logout sem `queryClient.clear()`; sem handler global de 401 |
| PostCSS GHSA-qx2v-qp2m-jg93 | Provavelmente refutado | lockfile ≥ versão corrigida; agir só se `pnpm audit` acusar |
| Overflow 390px / contraste | A medir | vira teste automatizado (D3/D4) |
