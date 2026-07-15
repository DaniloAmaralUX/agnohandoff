# Contribuindo — AgnoHub painel React

## Rodando

```bash
pnpm install
pnpm dev            # http://localhost:3000 — modo DEMO (mock) por padrão
```

Para o modo API, copie `.env.example` para `.env.local` e aponte `NEXT_PUBLIC_API_URL` para a FastAPI (`http://localhost:9090`). O estado real de cada tela nos dois modos está em [`STATUS.md`](./STATUS.md).

## O gate de qualidade

Antes de abrir PR, **sempre**:

```bash
pnpm verify         # typecheck + lint + unit + e2e
pnpm design:audit   # drift do design system (não pode criar novos hits)
```

CI roda os mesmos gates; PR só entra verde.

## Convenções

- **Commits:** conventional commits em pt-BR, como o histórico — `feat(billing): …`, `fix(a11y): …`, `docs(handoff): …`. Um commit por mudança nomeável.
- **Branches:** trabalho novo em branch própria; `main` só via PR revisado (ver `docs/GOVERNANCE.md`).
- **Não editar à mão:** `src/lib/api/schema.ts` é gerado (`pnpm gen:api` com o backend de pé).
- **Tokens de design:** só em `src/app/globals.css` (OKLCH). Nunca hex hardcoded — o `design:audit` pega.
- **Componentes novos de UI:** o caminho oficial é `pnpm dlx shadcn@latest add <componente>` — o `components.json` já entrega tudo tematizado. Antes de escrever um componente do zero, verifique se o registry shadcn já o tem.
- **Padrões do produto:** CTA → `FormSheet` (RHF+zod) → update otimista + toast; estados loading/erro/vazio obrigatórios (referência: Projetos/Agentes). Specs em `DESIGN-HANDOFF.md`.

## Onde mora o conhecimento

- **`STATUS.md`** — verdade por tela (Ligada/Parcial/Mock), fonte única de status de integração.
- **`HANDOFF.md`** — arquitetura de integração, contrato de API, gaps de backend, decisões arquiteturais.
- **`docs/solutions/`** — problemas já resolvidos com o porquê. **Leia antes de mexer no que eles cobrem**; ao resolver algo não-trivial, documente ali (é o que torna a próxima tarefa mais fácil).
- **`docs/plans/`** — planos de trabalho por entrega.
- **Rota `/design`** — style guide vivo (status de *design*; o de *integração* é o STATUS.md).
