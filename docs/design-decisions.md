# AgnoHub — Decisões de design pendentes

Registro dos **22 achados** da auditoria (`DESIGN-CRITIQUE.html`) que **não foram
corrigidos no fan-out** por serem decisões de produto/arquitetura, refactors
grandes, ou verificações que exigem interação (não capturáveis por screenshot).

O objetivo aqui não é resolver — é **documentar cada um com contexto suficiente
para uma decisão consciente** do PM/dev. Sem essa camada, o "%zerado" da
remediação seria falso.

---

## 1. Arquitetura da informação — decisões de produto (10)

O usuário-alvo é técnico (engenheiros de IA/PMs), mas o modelo mental não fica
completamente claro nas fronteiras entre alguns itens do menu. **Não é bug — é
decisão de produto.**

| # | Sev | Área | Pergunta a decidir |
|---|-----|------|--------------------|
| **58** | 🔴 | Tools ↔ MCP | MCP é *categoria* de ferramentas ou *fonte de origem*? Se for categoria, "MCP" na sidebar sobrepõe "Ferramentas". Uma opção: **remover MCP da sidebar; virar filtro dentro de Ferramentas.** Outra: **manter separado e trocar Ferramentas por "Ferramentas próprias" (não-MCP).** |
| **59** | 🔴 | Workspaces ↔ Projetos | Projetos são filhos de Workspaces (já é o modelo dos dados) mas ambos vivem no menu no mesmo nível. Sugestão: **rota `/workspaces/[id]/projects` + switcher de workspace no topbar** — remove Projetos da sidebar. |
| **61** | 🟡 | Studio | "Studio" é uma marca sem afordância clara. Opções: renomear para **"Voz e regras"**, **"Comportamento"**, ou **absorver como aba do detalhe do agente**. |
| **62** | 🟡 | Integrações ↔ Ferramentas | Distinção é sutil (integrações = apps corporativos externos; ferramentas = capacidades do agente). Sugestão: **integrações vira aba de Configurações > Organização**. |
| **63** | 🟡 | Settings tabs | Configurações mistura "Plano", "BYOK", "Langfuse", "Organização", "Performance" — tudo em tabs. Sugestão: agrupar por escopo (**Organização** vs **Runtime** vs **Faturamento**). |
| **64** | 🟡 | Conhecimento ↔ Memória | KB (base vetorial) e Memória (persistente do contato) são conceitos distintos mas o usuário confunde. Sugestão: **manter separado + adicionar disambig na home de cada tela** ("KB = 'o que o agente sabe'; Memória = 'o que o agente lembra de você'"). |
| **74** | 🟡 | Conversas — meta agente | O rótulo "Agente: Sofia" no header do thread compete com "WhatsApp" pela atenção. Decisão editorial: qual é o metadado dominante? |
| **89** | 🟢 | Projects card link | Cards de projeto linkam para `/agents` sem passar `?project=X`. Ideal: **rota `/projects/[id]`** com aba de agentes/canais desse projeto. |
| **129** | 🟢 | Sidebar config | Sidebar hardcoda `nav` no componente. Refactor: mover para `src/lib/nav-config.ts` como fonte única (já foi feito parcialmente para o breadcrumb). |
| **130** | 🟢 | ⌘K rotas/keywords | O command menu poderia expor **ações** ("Criar agente", "Adicionar canal") além de rotas. |

**Recomendação:** revisar 1–2 desses por sprint com o PM antes de aplicar.
Nenhum quebra o produto — todos são refino de IA que se beneficia de
observação real dos usuários.

---

## 2. Componentes compartilhados (refactor) (6)

Achados de consistência que exigem extrair componentes ou tomar decisões
transversais de sistema. Cada um sozinho é pequeno, mas o conjunto pede um
**pass de arquitetura de UI** dedicado.

| # | O quê | Ação sugerida |
|---|-------|---------------|
| 118 | Super-admin usa `mono` inconsistente com outras tabelas | Padrão único: numeric = `font-mono tabular`; nomes/estados = sans. Pode ser um **`<Num>` component**. |
| 119 | `STATUS_DOT` já cobre bug/tools; precisa cobrir também plano ("Ativo" org ≠ "Ativo" agente) | Segundo namespace de status (`ORG_STATUS_DOT`) ou renomear os existentes com sufixo. |
| 124 | Números-hero (Dashboard, Analytics, Billing) usam misturas de Fraunces + Geist | **Regra**: valores em Geist Mono tabular; labels em Geist Sans. Nunca Fraunces em números. |
| 125 | "Stats row" (linha de 4 cards de KPI) tem 3 anatomias diferentes no app | Extrair `<StatCard>` com props (label, value, delta, hint, trend). |
| 126 | Ghost card "criar novo" aparece em Projetos, não em Agentes/Canais | Padrão: **toda coleção clicável tem ghost card**, ou nenhuma. Decidir e propagar. |
| 128 | Iniciais dos avatares às vezes uppercase, às vezes mistas | Sempre `.toUpperCase()`; helper `initials()` em `@/lib/utils`. |

**Recomendação:** um passe único de "consistência de sistema" pelo dev antes de
adicionar features novas.

---

## 3. Hover/interações não-verificáveis por screenshot (4)

Achados que exigem estado interativo. Foram **provavelmente** cobertos, mas não
consigo confirmar por captura estática.

| # | O quê | Como verificar |
|---|-------|----------------|
| 38 | AlertDialog de "Gerar nova chave" (Channels) | Manual: clicar em "Gerar nova key" → confirmar que aparece diálogo com botão destrutivo. |
| 82 | Tooltip nas barras do gráfico (Dashboard/Analytics) | Manual: hover na barra → confirma que aparece popover com valor. |
| 97 | Typing indicator no builder (3 dots) | Manual: enviar mensagem → 3 dots animam antes da resposta. |
| 103 | EmptyState de conversas quando busca não bate | Manual: buscar "xyz123" → EmptyState com "Limpar busca". |

**Cluster C reportou os 4 como já implementados.** Vale um QA manual antes do
sign-off.

---

## 4. A11y estrutural (2)

| # | O quê | Ação |
|---|-------|------|
| 71 | Gráficos SVG sem `aria-label`/`role="img"` (Dashboard/Analytics) | Adicionar aria-label descritivo (ex.: "Barras: conversas por dia nos últimos 14 dias, pico 221 no dia 10"). |
| 122 | Variante `destructive-soft` no dark — contraste limítrofe | Testar com APCA/WCAG. Se cair abaixo de 4.5:1, escurecer o fill. |

---

## Como consumir este doc

- **Priorize por dor real do usuário**, não pela severidade da auditoria (que
  é uma proxy, não a verdade).
- **1 nostrat por sprint** é sustentável; mais que isso vira debate sem ação.
- Cada item aqui **não é bug** — o produto funciona sem resolver nenhum. São
  refinos de longo prazo.

Related: [`DESIGN-CRITIQUE.html`](../DESIGN-CRITIQUE.html) (auditoria completa).
