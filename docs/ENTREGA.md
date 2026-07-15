# Relatório de entrega — Handoff & Craft

> Trabalho executado na branch `claude/determined-gauss-sgvjcs` (clone isolado; `main` intocada). Método: Compound Engineering (plan → work → simplify → review → compound). 18 commits.

## O que mudou, em uma frase

O repositório deixou de se descrever como "frontend de produção" e passou a ser um **protótipo avançado honesto**: documentação reconciliada e verificável por tela, bugs de frontend confirmados corrigidos, mobile e acessibilidade medidos por teste automatizado, e a fundação shadcn documentada — sem tocar na sua identidade visual.

## Entregue por marco

**M1 — Governança** (`docs/GOVERNANCE.md`): checklist para privar/transferir o repo à Pitang, texto de licença proprietária pronto (a aplicar após aprovação), e checklist de segurança do zip original.

**M2 — Handoff honesto:** `STATUS.md` (fonte única, 24 rotas classificadas), narrativa reconciliada em README/HANDOFF/DESIGN-HANDOFF/ISSUES, seção de decisões arquiteturais e riscos no HANDOFF, `CONTRIBUTING.md`, `.github/CODEOWNERS`, `docs/PRD.md` e `docs/BACKLOG.md` (21 histórias com critérios de aceite).

**M3 — Validação de contrato:** as 6 suspeitas da auditoria externa checadas contra o `schema.ts` (gerado do OpenAPI real): 3 refutadas, 2 confirmadas, 3 indecidíveis (responses `unknown` no contrato) — cada uma com arquivo:linha.

**M4 — Craft de UI:**

| Área | Antes | Depois |
|---|---|---|
| Mobile 390px | 17 rotas com scroll horizontal | 0 — guardião `tests/e2e/mobile.spec.ts` |
| Acessibilidade (axe A/AA) | 16/22 rotas com violação | 22/22 verdes — suíte `tests/e2e/a11y.spec.ts` |
| Hydration | mismatch no Playground | corrigido (sessionId pós-mount) |
| Menu móvel | ficava aberto, foco perdido | fecha ao navegar, foco volta ao gatilho |
| `<main>` | dois aninhados | um só |
| Regenerar chave | podia revogar a de outro projeto | filtra pelo projeto ativo |
| 401 / cache | não deslogava, cache compartilhado | 401 desloga, cache limpo por conta |
| Agent Builder | "Publicar" fake, "Descartar" inerte | Descartar restaura, toasts honestos |
| CTAs em demo | alegavam persistência | "Demo: não persiste ao recarregar" |

**M5 — este relatório**, mais as lições em `docs/solutions/` (overflow mobile de culpado único; hydration por random em `useState`).

## Verificação (tudo verde)

- `pnpm verify`: **154 testes unitários + 45 e2e** (5 smoke, 18 mobile, 22 axe), typecheck e lint limpos.
- `pnpm design:audit`: sem novos hits; 3 regras novas anti-regressão; CI passa a rodar o audit.
- Screenshots 390×844 e 1440×900 das telas retocadas conferidos.

## Decisões registradas (não são pendências — foram escolhas)

- **Tema mantido:** os 24 primitivos são shadcn `radix-nova`; o que mudou foi documentado (tabela-garantia no HANDOFF §8). O tema OKLCH/Firecrawl/Fraunces está intacto — vive em `globals.css`, fora dos componentes.
- **PostCSS:** vulnerabilidade **refutada** — o lockfile já tem 8.4.31 (a versão corrigida) e 8.5.16.
- **Fora de escopo (do dev sênior, documentado em `ISSUES.md`/`BACKLOG.md`):** backend/endpoints, auth definitivo (cookie httpOnly/refresh/RBAC), migração Base UI, Storybook.

## Ações que só você/Pitang podem fazer (ver `docs/GOVERNANCE.md`)

1. **Tornar o repositório privado** (é trabalho da empresa em conta pessoal pública).
2. **Revogar as 5 chaves** de `.playground_keys.json` do zip original, se forem reais.
3. **Transferir o repo** para a organização da Pitang e ligar branch protection.
4. **Aprovar a troca de licença** MIT → proprietária (texto pronto no GOVERNANCE.md).
5. **Revisar a pasta `palace/`** do zip original (dados possivelmente sensíveis).

## Como publicar esta entrega

O ambiente onde ela foi produzida tinha credencial Git **somente-leitura** (push negado) e sem chave de assinatura — por isso a branch chega até você como um **bundle** (`agnohandoff-handoff.bundle`). No seu clone local do repositório:

```bash
git fetch ./agnohandoff-handoff.bundle claude/determined-gauss-sgvjcs
git push origin FETCH_HEAD:refs/heads/claude/determined-gauss-sgvjcs
```

Opcional — para os commits aparecerem como **Verified** no GitHub, reassine com a sua chave antes do push:

```bash
git checkout -B claude/determined-gauss-sgvjcs FETCH_HEAD
git rebase --exec "git commit --amend --no-edit -S" origin/main
git push -f origin claude/determined-gauss-sgvjcs
```

Depois, abra o PR de `claude/determined-gauss-sgvjcs` para `main` e revise pelo próprio `docs/ENTREGA.md` + `STATUS.md`.

## Como continuar

`CONTRIBUTING.md` diz como rodar e o gate (`pnpm verify`); `STATUS.md` diz o estado real de cada tela; `docs/BACKLOG.md` traz o próximo trabalho priorizado com critérios de aceite. O dev sênior consegue continuar sem depender de você.
