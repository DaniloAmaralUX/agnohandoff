# CRAFT.md — Padrão global de craft do AgnoHub

Padrão cruzado de duas autoridades de design engineering, aplicado como regra do
repositório (para humanos e agentes — o equivalente ao `/codebase-standards`):

- **Jakub Krehel** (jakub.kr) — skill `make-interfaces-feel-better`: superfícies,
  tipografia, micro-detalhes. Fontes literais em [`docs/craft/jakub-*.md`](./craft/).
- **Emil Kowalski** (animations.dev, sonner/vaul) — skills `emil-design-eng` +
  `review-animations`: motion com propósito. Fontes literais em [`docs/craft/emil-*.md`](./craft/).

**Como usar:** ao construir UI, aplique as regras abaixo. Antes de commitar mudança
com motion, rode o gate da Persona Emil (`docs/craft/emil-review-animations.md` —
saída `| Before | After | Why |` + veredito **Block/Approve**). Para detalhes visuais,
o review da Persona Jakub (`docs/craft/jakub-skill.md` — tabela Before/After agrupada
por princípio, checklist de 14 itens). Valores exatos: citar `emil-standards.md`,
nunca aproximar.

---

## 1. Deve animar? (Emil — decidir ANTES de escrever código)

| Frequência de uso | Decisão |
|---|---|
| 100+ vezes/dia (atalhos, toggle do ⌘K) | **Nenhuma animação. Nunca.** |
| Dezenas de vezes/dia (hover, navegação em lista) | Remover ou reduzir drasticamente |
| Ocasional (modais, drawers, toasts) | Animação padrão |
| Raro/primeira vez (onboarding, celebração) | Pode ter delight |

- **Nunca animar ações iniciadas por teclado.**
- Propósito válido ou deleta: consistência espacial · indicação de estado ·
  explicação · feedback · evitar mudança abrupta. "Fica bonito" não é propósito.
- Na dúvida se o motion está certo, **a jogada mais forte é deletar**.

## 2. Easing (tokens do projeto em `globals.css @theme`)

| Token | Valor | Uso |
|---|---|---|
| `--ease-out-strong` | `cubic-bezier(0.23, 1, 0.32, 1)` | Default de UI: enter E exit (Emil) |
| `--ease-in-out-strong` | `cubic-bezier(0.77, 0, 0.175, 1)` | Movimento/morph já na tela |
| `--ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Drawers (curva iOS/Vaul) |
| `--ease-enter` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Entradas suaves de conteúdo (Jakub) |
| `--ease-icon` | `cubic-bezier(0.2, 0, 0, 1)` | Cross-fade de ícones sem lib (Jakub) |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | SÓ delight raro (bounce; nunca em UI frequente) |

- Hover/cor → `ease` nativo. Movimento constante (marquee/progress) → `linear`.
- **`ease-in` em UI = proibido** (block no review). Curvas built-in são fracas —
  usar os tokens acima.

## 3. Duração

| Elemento | Duração |
|---|---|
| Press de botão | 100–160ms |
| Tooltip, popover pequeno | 125–200ms |
| Dropdown, select | 150–250ms |
| Modal, drawer | 200–500ms |

- **UI sempre <300ms.** Exit mais curto que enter (ex.: 150ms vs 300ms) —
  enter chama atenção, exit sai de cena.
- Assimetria deliberada: lento onde o usuário decide (hold 2s linear),
  rápido onde o sistema responde (release 200ms ease-out).

## 4. Valores travados (não desviar — Jakub)

- **Press:** exatamente `scale(0.96)` (nunca <0.95), `transition-transform
  duration-150 ease-out`, `active:not-disabled:` — interruptível (transition,
  não keyframe). Utility do projeto: `press`.
- **Ícones contextuais** (play→pause, like): `scale 0.25→1` + `opacity 0→1` +
  `blur(4px)→0`. Com Motion: `{type: "spring", duration: 0.3, bounce: 0}`.
  Sem Motion: dois ícones no DOM, cross-fade `transition-[opacity,filter,scale]
  duration-300` com `--ease-icon`. **Não adicionar dependência só para isso.**
- **Enter de conteúdo:** `opacity 0→1` + `translateY 12px→0` + `blur(4px)→0`;
  stagger **30–80ms** entre itens (decorativo — nunca bloquear interação).
- **Exit:** `opacity 0` + `translateY(-12px)` fixo (nunca a altura do container)
  + blur, ~150ms ease-out.
- **Nunca `scale(0)`** — começar de `scale(0.9–0.97)` + opacity.
- **Origin-aware:** popover/dropdown/tooltip escalam do trigger
  (`transform-origin: var(--radix-*-content-transform-origin)`). **Modais são
  isentos** (origin center).
- Tooltips: delay no primeiro; subsequentes **instantâneos**
  (`skipDelayDuration` no Provider).

## 5. Proibições de performance

- **`transition: all` proibido** — inclusive a classe `transition` pura do
  Tailwind. Sempre propriedades explícitas (`transition-[scale,opacity]`).
- **Animar só `transform`/`opacity`** (GPU). Nunca width/height/margin/padding/
  top/left.
- Motion/Framer: `x`/`y`/`scale` shorthands NÃO são hardware-accelerated —
  sob carga, usar a string completa (`transform: "translateX(100px)"`).
- Não dirigir transform de filhos via CSS var no pai (recalc storm).
- `will-change` só `transform`/`opacity`/`filter`, temporário e cirúrgico.
- Blur animado ≤8px; blur de máscara de crossfade ~2px (<20px sempre).
- `initial={false}` em `AnimatePresence` de elementos com estado default no
  load (icon swaps, tabs) — verificar com refresh completo.

## 6. Superfícies (Jakub)

- **Radius concêntrico:** `outerRadius = innerRadius + padding`
  (ex.: `rounded-2xl p-2` fora → `rounded-lg` dentro). Padding >24px = superfícies
  independentes, sem matemática estrita.
- **Sombras para elevação, bordas para divisão.** Cards/dropdowns/hover-lift usam
  `--shadow-border` (3 camadas no light; anel branco único 8%/13% no dark).
  Divisores (`border-b`), células de tabela e outline de input **continuam borda**
  (acessibilidade).
- **Imagens:** `outline: 1px solid` inset (`-outline-offset-1`). Light =
  `rgba(0,0,0,.10)`, dark = `rgba(255,255,255,.10)` — **preto/branco puros,
  nunca tinta da paleta, nunca Heat** (inegociável).
- **Alinhamento óptico:** botão texto+ícone → padding do lado do ícone −2px
  (`pl-4 pr-3.5`); play com `ml-[2px]`; ícone assimétrico → consertar no SVG.
- **Hit area ≥40×40px** (WCAG 44): elemento menor estende com `::after`
  centralizado (utility `hit-target`). Hit areas nunca se sobrepõem.

## 7. Tipografia (Jakub)

- `antialiased` **uma vez, na raiz** (nunca por elemento).
- `text-balance` em h1–h3 (só funciona ≤6 linhas). `text-pretty` em parágrafos
  curtos/médios, captions, itens de lista. Texto 10+ linhas: nenhum dos dois.
- **`tabular-nums` em todo número que muda** (counters, timers, preços, colunas
  numéricas, KPIs). Não em: telefones, versões, números decorativos estáticos.
- Números-hero: **Geist Mono tabular** — nunca Fraunces em números.

## 8. Acessibilidade de motion

- `prefers-reduced-motion` = **menos e mais suave, não zero**: manter fades de
  opacity/cor, zerar translate/scale.
- Hover com motion gated por `(hover: hover) and (pointer: fine)` — o `hover:`
  do Tailwind v4 já é gated por default; não contornar.

## 9. Vocabulário oficial de handoff

Termos de motion nos handoffs seguem o glossário
[`docs/craft/emil-animation-vocabulary.md`](./craft/emil-animation-vocabulary.md)
(~80 termos: origin-aware scale-in, stagger, shared element transition, number
ticker, skeleton/shimmer…). Pedir a coisa certa pelo nome certo.

## 10. Enforcement

- `pnpm design:audit` conta violações: `transition: all`/classe `transition` pura,
  `ease-in`, `duration-` >300 em UI, `scale-0`, número dinâmico sem `tabular-nums`.
- Review de PR que toca motion: gate da Persona Emil (Block/Approve).
- Review de PR que toca visual: tabela Before/After da Persona Jakub.
