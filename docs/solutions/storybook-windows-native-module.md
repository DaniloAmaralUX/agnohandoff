---
track: bug
category: tooling
problem_type: native-module-windows
component: storybook
---

# Storybook init falha no Windows / Node 25 (oxc-resolver)

**Problema:** `storybook init` aborta com `ERR_DLOPEN_FAILED: Cannot find module './resolver.win32-x64-msvc.node'`.

**Causa:** o módulo nativo `oxc-resolver` não tem binário pré-compilado para Windows x64 + Node 25.

**O que não resolveu:** reexecutar o init.

**Solução (atual):** **adiar** o Storybook — virou tarefa do board (`ISSUES.md`), com **provável sucesso no CI Linux**. Enquanto isso, a rota `/handoff` serve de catálogo vivo de componentes.

**Prevenção:** rodar `storybook init` em ambiente Linux (CI) ou fixar uma versão LTS par do Node.
