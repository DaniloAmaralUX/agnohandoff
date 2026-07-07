# DESIGN-HANDOFF.md — AgnoHub

Specs de design para os devs: tokens, componentes, estados, responsivo, edge cases e acessibilidade. Complementa o [`HANDOFF.md`](./HANDOFF.md) (arquitetura + contrato de API). Fonte única de estilo = `src/app/globals.css`; documentação de design viva = rota `/design`.

> **Estado (atual):** todas as telas de produto **funcionam com dados mock read-only** — cada CTA/form/toggle responde (abre sheet, valida, faz add otimista + toast, navega). Sem persistência real (reseta no reload) — é o modo demo. O dev liga a API real trocando o `mutationFn`/`fromMock` por chamadas HTTP (ver `HANDOFF.md §2`); com `NEXT_PUBLIC_API_URL` definido, o app entra em **modo API**.

> Contraste desta seção foi **recalculado à mão** (WCAG 2). Ajustes de token são **decisão do designer** (fase de design) — ver `ISSUES.md`.

---

## 1. Visão geral

**AgnoHub** é um painel React + Next.js (App Router) para construir, publicar e operar agentes de IA conversacionais com memória persistente, omnichannel (WhatsApp, Web Widget, Telegram, Instagram), MCP e versionamento.

**Público:** engenheiros de IA, PMs e stakeholders técnicos gerenciando múltiplos agentes/conversas.

**Stack:** React 19.2 · Next.js 16.2 (App Router, Turbopack) · Tailwind CSS v4 · shadcn/ui (Radix) · TanStack Query · next-themes · Geist Sans/Mono.

**Tema:** Firecrawl. Claro por padrão + `.dark`.
- **Claro:** background Paper `#F9F9F9`, texto Graphite `#262626`, cards `#FFFFFF`.
- **Escuro:** background `#191919`, texto `#EDEDED`, cards `#212121`.

---

## 2. Design tokens (fonte: `src/app/globals.css`)

> **Tokens v2 (2026-07-06):** todos os tokens agora em **OKLCH** (Tailwind v4-native, gamut sRGB — mesma cor). Semânticos têm split: **vivos** (`--forest`…) para dot/badge/chart e **`-text`** (`--forest-text`/`--honey-text`/`--bluetron-text`/`--amethyst-text`) para rótulos/valores (WCAG AA). `--crimson`/`--destructive` escurecidos p/ AA como texto. Método em `docs/solutions/oklch-token-system.md`.

| Token | Claro | Escuro | Uso |
|-------|-------|--------|-----|
| **Marca** | | | |
| `--heat` | `#fa5d19` | `#fa5d19` | Acento primário (CTA, foco, ativo) |
| `--heat-hover` | `#e84f10` | `#e84f10` | Hover do primário |
| `--heat-foreground` | `#ffffff` | `#ffffff` | Texto sobre heat |
| `--graphite` | `#262626` | `#262626` | Base grafite |
| `--paper` | `#f9f9f9` | `#f9f9f9` | Base clara |
| **Semânticos** | | | |
| `--forest` | `#42c366` | `#52d477` | Sucesso |
| `--bluetron` | `#2a6dfb` | `#4b86ff` | Info / dados |
| `--honey` | `#ecb730` | `#f2c644` | Aviso |
| `--crimson` | `#eb3424` | `#f0533f` | Erro |
| `--amethyst` | `#9061ff` | `#a17bff` | Acento / charts |
| **Superfícies** | | | |
| `--background` | `#f9f9f9` | `#191919` | Fundo |
| `--foreground` | `#262626` | `#ededed` | Texto principal |
| `--card` / `--popover` | `#ffffff` | `#212121` | Superfícies |
| `--muted` | `#f2f2f0` | `#2a2a2a` | Fundo sutil |
| `--muted-foreground` | `#6b6b6b` | `#a3a3a3` | Texto secundário |
| `--accent` | `#f4f4f2` | `#2e2e2e` | Hover sutil |
| `--border` | `#e7e7e4` | `#2f2f2f` | Linhas / hairline |
| `--input` | `#e2e2df` | `#333333` | Fundo de input |
| `--ring` | `#fa5d19` | `#fa5d19` | Anel de foco |
| **Primário/Destrutivo** | | | |
| `--primary` | `#fa5d19` | `#fa5d19` | CTA (= Heat) |
| `--destructive` | `#eb3424` | `#f0533f` | Ações perigosas |
| **Charts** | `--chart-1..5` | heat / bluetron / forest / honey / amethyst | Séries de dados |
| **Sidebar** | `--sidebar*` | branco/`#171717` + heat p/ ativo | Navegação |
| **Raios** | `--radius-sm/md/lg/xl` | `4 / 6 / 8 / 12px` | pill / médio / base (cards, botões) / modais |

**Tipografia:** Geist Sans (UI) + Geist Mono (técnico). Headings `h1–h4` peso `600`, `letter-spacing -0.02em` (`h1: -0.03em`), `text-wrap: balance`; parágrafos `text-wrap: pretty`. Números tabulares via `.tabular` (`font-variant-numeric: tabular-nums`). Features OpenType Geist `cv02/cv03/cv04/cv11`.

---

## 3. Catálogo de componentes

`src/components/ui/*` (shadcn/radix-nova) + custom em `bits.tsx` / `page-header.tsx`. Cores sempre vêm dos tokens.

| Componente | Variantes | Estados | Notas |
|---|---|---|---|
| **Button** | variant: default, outline, secondary, ghost, destructive, link · size: default, xs, sm, lg, icon* | hover, active, focus-visible, disabled, aria-invalid | Sem loading nativo — usar `disabled` + `<Loader2 className="animate-spin"/>` |
| **Input / Textarea** | — | focus-visible, disabled, aria-invalid, placeholder | Textarea com `field-sizing-content` |
| **Badge** | default, secondary, destructive, outline, ghost, link | hover, focus-visible, aria-invalid | `asChild` p/ links |
| **Card** | default, sm | estrutural | Header/Title/Description/Content/Action/Footer |
| **Field** | vertical, horizontal, responsive | data-invalid, group-disabled | Container de form: Label + Description + Error |
| **Label** | — | peer-disabled | Radix Label |
| **Select** | sm, default | focus-visible, disabled, aria-invalid | Radix Select |
| **Switch** | sm, default | data-checked, disabled, focus-visible | |
| **Slider** | — | hover, focus-visible, active, disabled | |
| **Tabs** | default, line · horizontal/vertical | data-state active/inactive, focus, disabled | Navegação por setas |
| **Dialog / Sheet** | Sheet: side top/right/bottom/left | data-open/closed (animado) | Modal / drawer |
| **DropdownMenu** | Item: default, destructive | open/closed, focus, disabled, checked | |
| **Table** | — | hover (row), selected | Header/Body/Cell |
| **Progress** | — | valor dinâmico | Sem indeterminate |
| **Skeleton** | — | `animate-pulse` | Placeholder de loading |
| **Tooltip** | — | open/closed | `sideOffset`, `delayDuration` |
| **ScrollArea / Separator / Breadcrumb / Avatar** | Avatar: sm/default/lg | — | Avatar tem fallback c/ iniciais |
| **Sidebar** | sidebar/floating/inset · collapsible offcanvas/icon/none | expanded/collapsed | Colapsa em mobile |
| **StatusBadge** (custom) | por status | — | Badge + dot colorido (`statusDot()`) |
| **ToneAvatar** (custom) | tone: heat, bluetron, forest, amethyst, honey, graphite | — | Avatar tonalizado |
| **PageHeader** (custom) | — | — | `<h1>` + subtítulo + ações |
| **FormSheet** (custom) | — | open, submitting, error | **Padrão de ação** — Sheet + form (RHF) com chrome padrão (header, corpo rolável, footer Cancelar/Salvar). Ver §4. Arquivo `src/components/form-sheet.tsx` |
| **EmptyState** (custom) | — | — | ícone + título + descrição + CTA; entra com `animate-rise` |

---

## 4. Convenções de estados e interações (padrão reutilizável)

As telas de **referência** (Projetos, Agentes) já implementam esse padrão — replicar nas demais (ver `HANDOFF.md §2`).

- **Loading:** `<Skeleton>` no mesmo grid/altura do conteúdo real (não spinner solto). Botão em ação assíncrona: `disabled` + `<Loader2 className="animate-spin"/>` inline.
- **Erro:** banner no topo — `border-l-4 border-destructive` + `TriangleAlert` (crimson) + texto `text-destructive` + botão **"Tentar de novo"** → `refetch()`.
- **Vazio:** container centrado (min-h ~400px) com ícone neutro + título ("Nenhum X ainda") + dica + CTA Heat.
- **Hover/Focus:** cards `hover:bg-accent`/`hover:border-heat` + `transition-colors`; foco `focus-visible:ring-3 ring-ring border-ring`; disabled `opacity-50 cursor-not-allowed`.
- **Ação destrutiva:** sempre confirmar (Dialog: "Confirmar" + descrição + botões rotulados pela ação, destrutivo em crimson). Sugerir toast de undo (~5s).

#### Padrão de ação (criar/editar) — `FormSheet`
Toda ação "Novo/Adicionar X" ou "Salvar" usa o mesmo padrão, para o app inteiro se comportar igual (`src/components/form-sheet.tsx`). Referências implementadas: **Workspaces** (add com `useState` local) e **Projetos** (add otimista no cache via `useCreateProject`).

| Elemento | Estado | Comportamento |
|---|---|---|
| CTA "Novo X" (`bg-heat`) | click | abre o `FormSheet` (Sheet lateral, `side=right`, `sm:max-w-md`), anima `slide-in-from-right` 200ms `ease-in-out` |
| Campo (`Input`/`Select`/`Textarea`) | inválido | `Field data-invalid` + `aria-invalid` → borda/label `text-destructive`; `FieldError` (`role="alert"`) abaixo |
| Botão "Criar/Salvar" | submitting | `disabled` + label "Salvando…" |
| Form | submit válido | **add otimista** (prepend na lista local/cache) + `toast.success` (título + descrição de próximo passo) + fecha o sheet + `form.reset()` |
| Form | submit inválido | sheet permanece aberto; erros por campo; foco no 1º inválido |
| "Cancelar" / X / overlay | click/Esc | fecha sem alterar |

- **Validação:** react-hook-form + zod via `standardSchemaResolver` (`@hookform/resolvers/standard-schema` — zod 4 é Standard Schema; **não** usar `zodResolver`). Select do Radix precisa de `Controller`.
- **Por quê otimista + sem persistência:** no modo demo o objetivo é o *fluxo* sentir-se real (feedback imediato), não a persistência — resetar no reload é aceitável e comunica "demo". Ao ligar a API, o `mutationFn` vira o `POST` e o `onError` reverte (ver `useToggleAgent`/`useCreateProject`).
- **Salvar sem lista** (Configurações/Memória): botão → `toast.success` (o estado já é local). Em `<form>`, prevenir o submit default.

---

### Motion (vocabulário — admin = contido)
Base já forte (shadcn/Radix: press `active:scale-[0.96]`, focus-ring, animações de Dialog/Sheet/Dropdown; `prefers-reduced-motion` global). Adicionado em `globals.css`:
- **Easings** (`@theme` → utilitários): `ease-enter` `cubic-bezier(0.4,0,0.2,1)` (entra) · `ease-exit` (sai) · `ease-spring` (confirmações).
- **Durações:** `duration-150` interação · `200/300` modal/painel · **nunca >500ms** (Doherty <400ms).
- **`animate-rise`** — entrada sutil (opacity + 6px) p/ empty states/reveals; ~0 sob reduced-motion.
- **Padrões:** hover-lift nos cards clicáveis (`-translate-y-0.5` + `shadow-sm` + `border-heat`); `EmptyState` (`bits.tsx`) com ícone + CTA. Regra: ~70% sem motion; só animar o que **comunica**.
- **Pendente (Fase 3):** optimistic UI nos toggles (mutations) + **⌘K** command menu.

---

## 5. Sistema responsivo

Breakpoints Tailwind v4 padrão: `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`.

| Elemento | Mobile (<sm) | Tablet | Desktop (lg+) |
|---|---|---|---|
| **Sidebar** | drawer/sheet off-canvas (overlay) | ícone-only + tooltip | expandida com labels |
| **Busca (topbar)** | oculta | `sm:flex` | visível |
| **Grid de cards** | 1 col | 2 cols | 3–4 cols |
| **Tabelas** | scroll horizontal | — | largura total |
| **Modais** | quase full-screen | centrado `max-w` | centrado `max-w` |

`SidebarTrigger` (hambúrguer) sempre visível; atalho `Ctrl+B`. Tabs em mobile: `overflow-x-auto`.

---

## 6. Edge cases e conteúdo

| Caso | Comportamento |
|---|---|
| Texto longo | `truncate` / `line-clamp-2` (descrições, rodapés) |
| URLs longas | `break-all` ou mono + truncate |
| Listas 100+ | paginação ou virtualização |
| Data/número ausente | `—` em `text-muted-foreground` |
| Título vazio | "Sem título" + placeholder |
| Imagem não carrega | Avatar fallback (iniciais/ícone) |
| Aguardando API | skeleton/spinner; timeout ~30s + retry |

---

## 7. Acessibilidade (WCAG 2.1 AA)

### Baseline já presente
- **Foco visível (2.4.7):** `focus-visible:ring-3 ring-ring border-ring` (anel Heat) uniforme em Button/Input/Select/Slider/Tabs.
- **Labels/ARIA:** inputs com `<Label htmlFor>`; `aria-invalid` em erro; `FieldError`/mensagens com `role="alert"`; `aria-current="page"` em nav.
- **Teclado:** Tab/Shift-Tab; Enter/Space ativa; setas em Tabs/Select/Slider; Esc fecha Dialog/Sheet; `Ctrl+B` sidebar.

### Contraste (recalculado — WCAG 2)
Texto normal exige ≥ 4.5:1; texto grande/bold e componentes de UI ≥ 3:1.

| Par | Razão | Veredito |
|---|---|---|
| Graphite `#262626` / Paper `#F9F9F9` | ~11.6:1 | ✅ texto principal |
| `#EDEDED` / `#191919` (dark) | ~13:1 | ✅ |
| `muted-foreground #6B6B6B` / Paper | **~5.0:1** | ✅ texto secundário (passa) |
| Branco / botão **Heat** `#FA5D19` | **~3.2:1** | ⚠️ ok p/ botão (texto grande/bold, UI); **não** usar Heat como texto pequeno |
| `bluetron #2A6DFB` / Paper (texto) | ~4.3:1 | ⚠️ quase AA — ok p/ texto grande |
| `forest #42C366` / Paper (texto) | ~2.2:1 | ❌ como texto pequeno; ✅ como dot/badge/ícone (≥3:1 UI) ou sobre fundo tintado |
| `honey #ECB730` / Paper (texto) | ~1.7:1 | ❌ como texto; usar só tinta/ícone |
| `crimson #EB3424` / `#191919` (dark) | ~4.2:1 | ⚠️ limítrofe; avaliar tom mais claro p/ texto pequeno no dark |

> **Tokens v2 (resolvido — 2026-07-06):** tokens migrados p/ **OKLCH**. `--crimson`/`--destructive` escurecidos → **AA como texto** (botão **4.88:1**, texto de erro **4.64:1**, dark **4.62:1**). Criadas variantes **`-text`** (forest/honey/bluetron/amethyst, todas ≥4.6:1 claro **e** dark) — usar em rótulos/valores; os vivos seguem p/ dot/badge/chart. Valores gerados por script determinístico (WCAG por cálculo, não no olho). Ver `docs/solutions/oklch-token-system.md`. Pendente: *sweep* dos tints duplicados por página (ISSUES §Design).

### Gaps de a11y a resolver (ver `ISSUES.md`)
- **Skip-to-content link** no layout `(app)` (2.4.1) — ausente.
- `aria-hidden="true"` no ícone "X" de Dialog/Sheet (hoje anunciado pelo leitor).
- Alvos de toque ≥44px em botões-ícone de fechar e itens de submenu da sidebar.
- Respeitar `prefers-reduced-motion` (reduzir animações).

---

## 8. Inventário de telas (23)

Legenda — **API?** ✓ = consome a API real quando em modo API; ✗ = só mock. Estados: L(oading) / E(rro) / V(azio). **Interação:** todas as telas abaixo têm os fluxos ligados no mock (criar/salvar/alternar/navegar respondem — ver §4).

| # | Tela | Propósito | Estados | API? | Arquivo |
|---|------|-----------|---------|------|---------|
| 1 | Dashboard | KPIs das últimas 24h | happy (falta L/E/V) | ✗ | `(app)/dashboard/page.tsx` |
| 2 | **Projetos** | Listar/criar projetos | **L/E/V** ✓ | ✓ | `(app)/projects/page.tsx` |
| 3 | **Agentes** | Listar agentes + métricas | **L/E/V** ✓ | ✓ | `(app)/agents/page.tsx` |
| 4 | Agent Builder | Editor: instruções/modelo/tools/memória + preview | happy (falta saving/validação) | ✓ | `(app)/agents/[id]/page.tsx` |
| 5 | Canais | WhatsApp/Web/Telegram/Instagram + keys | happy | ✗ | `(app)/channels/page.tsx` |
| 6 | Conversas | Inbox unificado (lista + chat) + filtros | happy/vazio | ✗ | `(app)/conversations/page.tsx` |
| 7 | Playground | Chat de teste + config + debug | happy (falta L de envio) | ✗ | `(app)/playground/page.tsx` |
| 8 | Workspaces | Workspaces + projetos + custos | happy | ✗ (mock) | `(app)/workspaces/page.tsx` |
| 9 | Analytics | Métricas, conversas/dia, top agentes | happy | ✗ | `(app)/analytics/page.tsx` |
| 10 | Faturamento | Créditos, planos, compra, histórico | happy | ✗ | `(app)/billing/page.tsx` |
| 11 | Integrações | GitHub (PAT/repos) + futuras | happy | ✗ | `(app)/integrations/page.tsx` |
| 12 | MCP | Registrar servidores MCP + status | happy | ✗ | `(app)/mcp/page.tsx` |
| 13 | Memória | Estratégia/contexto/retenção/embeddings | happy | ✗ | `(app)/memory/page.tsx` |
| 14 | Studio | Regras YAML de payload via linguagem natural | happy | ✗ | `(app)/studio/page.tsx` |
| 15 | Ferramentas | Tools (MCP/Python/HTTP) + Knowledge Base | happy | ✗ | `(app)/tools/page.tsx` |
| 16 | Configurações | Plano, BYOK, org, performance | happy | ✗ | `(app)/settings/page.tsx` |
| 17 | Deploy | Status/modos de deploy (aguarda `/deploy/*`) | happy | ✗ | `(app)/deploy/page.tsx` |
| 18 | Landing | Apresentação pública + CTA | estática | ✗ | `page.tsx` |
| 19 | Login | Auth por API key | happy/erro | ✗* | `login/page.tsx` |
| 20 | Onboarding | Criar organização (multi-step) | 4 passos funcionais (avança/volta/valida) | ✗ | `onboarding/page.tsx` + `onboarding-flow.tsx` |
| 21 | Super Admin | Métricas da plataforma + orgs | happy | ✗ | `super-admin/page.tsx` |
| 22 | Design System | Catálogo vivo (tokens/componentes) | estática | ✗ | `handoff/page.tsx` |
| 23 | Fluxos | Roteiros de teste navegáveis | hover | ✗ | `fluxos/page.tsx` |

\* Login valida a chave contra a API quando em modo API; landing/login/onboarding/super-admin ficam **fora** do grupo `(app)` (sem AuthGuard/sidebar).

---

## 9. Specs das 3 telas de referência

### 9.1 Projetos (`(app)/projects/page.tsx`) — padrão FLAT
- **Layout:** `PageHeader` ("Projetos" + CTA "Novo projeto" Heat) → banner de erro condicional → grid de cards + card fantasma "Novo projeto".
- **Tokens:** fundo `bg-background`; cards `bg-card border-border`; título `font-semibold -0.02em`; CTA `bg-heat hover:bg-heat-hover text-heat-foreground`; erro `border-destructive text-destructive`.
- **Estados:** Loading = 3 skeletons `h-[188px]` em `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`; Erro = banner + retry; Vazio = mensagem + CTA *(a implementar — ver ISSUES)*; Sucesso = cards com contadores agentes/canais (só no modo mock; ver gap de campo no HANDOFF §4).
- **Responsivo:** 1 → 2 → 3 colunas; descrição `line-clamp-2`.
- **A11y:** card como link navegável por teclado; CTA com `aria-label`.

### 9.2 Agentes (`(app)/agents/page.tsx`) — padrão ANINHADO
- **Layout:** `PageHeader` → banner de erro → grid de 4 métricas (Total/Publicados/Com memória/Média de tools) → grid de cards de agente ([Editar]→`/agents/[id]`, [Testar]→`/playground`).
- **Tokens:** métricas `tabular` (números alinhados); status badge colorido por estado (Publicado/Rascunho/Treinando).
- **Estados:** Loading = skeletons de métricas (fora do `<p>`) + cards; Erro = banner + retry; Vazio = *(a implementar)*. Memória/tools só aparecem quando a API os retorna (gap de campo).
- **Responsivo:** métricas `grid-cols-2 lg:grid-cols-4`; cards `sm:grid-cols-2 lg:grid-cols-3`.
- **A11y:** `aria-label` no status; ordem de foco métricas → cards → ações.

### 9.3 Login (`login/page.tsx`)
- **Layout:** card centrado (`max-w-[420px]`) com logo "A" (quadrado Heat) + "Entrar" + input de chave + botão Heat + link "Criar organização". Nota de modo demo quando `USE_MOCK`.
- **Estados:** idle; loading (botão `disabled` + `Loader2`); erro ("Chave inválida ou API indisponível…"); sucesso → `router.replace("/dashboard")`.
- **A11y:** `Label htmlFor="apikey"`; `aria-invalid` no erro; foco visível; mensagem de erro perceptível.

---

## 10. Checklist por tela (para o dev)
- [ ] Loading (skeleton no layout do conteúdo)
- [ ] Erro (banner + retry)
- [ ] Vazio (mensagem + CTA)
- [ ] Foco visível em inputs/botões
- [ ] Responsivo testado a 375px
- [ ] Dark mode conferido
- [ ] Contraste do texto ≥ 4.5:1 (semânticos: usar como indicador, não texto pequeno)
- [ ] Teclado (Tab / setas / Esc)
- [ ] Timeout de API (~30s) + retry

---

_Gerado por revisão multi-agente (read-only) em 2026-07-06 · tema Firecrawl. Contraste conferido manualmente; ajustes de token são decisão da fase de design._
_Atualizado em 2026-07-07: reflete os fluxos ligados no mock + o padrão de ação `FormSheet` (§4) e onboarding multi-step._
