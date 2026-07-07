---
track: knowledge
category: design-system
problem_type: living-docs-fidelity
component: src/app/design/page.tsx
applies_when:
  - Quer uma doc de design que não desalinhe do produto com o tempo
  - Vai documentar tokens/componentes de um app React/Tailwind
---

# Documentação de design VIVA (rota `/design`) — fiel por construção

**Ideia (molde: vercel.com/design):** a doc de design é uma **rota do próprio app** (`/design`), não um arquivo à parte. Ela **renderiza os tokens e componentes REAIS** → nunca desalinha.

**Como fica fiel:**
- **Cor:** swatches com `background: var(--token)` (cor sempre real) + valor **lido em runtime** via `getComputedStyle(document.documentElement).getPropertyValue('--token')`. Reage ao tema (re-lê quando o `.dark` muda). Obs.: o browser serializa OKLCH como `lab(...)` no computed — a fonte segue OKLCH em `globals.css` (deixar isso explícito na página).
- **Componentes:** importa e renderiza os componentes reais (`Button`, `bits`, `ui/*`) → estados/variantes sempre atuais.
- **Motion/raios/espaço:** amostras usam as próprias utilities/vars.

**Manutenção:** tokens/componentes auto-refletem; a **prosa/guidelines** eu atualizo por sessão (doc viva, como o RELATORIO). `/handoff` (antigo) → **redirect** para `/design`.

**Gotcha:** `next-themes` (no layout raiz) reverte `.dark` adicionado manualmente. Para screenshot em dark, dirigir pelo mecanismo dele — `localStorage.theme='dark'` + `colorScheme:'dark'` no contexto Playwright (ver `.shots/shot.mjs`).

## Governança (status + adesão)
A `/design` tem a seção **Status & Adesão**: **onde estamos** (ROADMAP) + **se aplicamos o que dizemos** (COMMITMENTS), de `src/app/design/system.ts` (fonte única). O sinal é **medido** por `pnpm design:audit` (`scripts/design-audit.mjs` → `src/app/design/audit.json`), não auto-declarado — evita a doc virar checkbox que mente.

**Loop por sessão de design:** `pnpm design:audit` → atualizar status em `system.ts` → escolher a próxima do ROADMAP → aplicar → repetir. Assim a `/design` sempre mostra o retrato atual e o craft melhora de forma rastreável.

