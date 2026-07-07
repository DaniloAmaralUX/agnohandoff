---
track: bug
category: ui-bugs
problem_type: tailwind-theme-inline-var-missing
component: src/app/globals.css, src/app/layout.tsx
---

# `@theme inline` não emite vars pro `:root` — fonte "sumiu" em runtime

**Problema:** ao trocar a Fraunces de `next/font/google` para self-hosted
(`@fontsource-variable/fraunces`), definimos `--font-fraunces: "Fraunces Variable"`
dentro do bloco `@theme inline` do `globals.css` — e os h1/h2 voltaram pra Geist.

**Sintomas:** `getComputedStyle(document.documentElement).getPropertyValue('--font-fraunces')`
retorna vazio; `font-family` do h1 cai no fallback. Nenhum erro de build.

**O que não funcionou:** reiniciar o dev server; hard reload. (E atenção: o
Turbopack pode servir CSS velho — se a edição não aparecer nem no
`curl` do chunk, `rm -rf .next` e reinicie.)

**Solução:** declarar a var no bloco `:root { }` normal do CSS, não no
`@theme inline`:

```css
:root {
  --font-fraunces: "Fraunces Variable";
}
```

**Por que funciona:** no Tailwind v4, `@theme inline` **inlina** os valores nas
utilities geradas e **não** emite as custom properties no `:root`. Qualquer
`var(--x)` consumido em CSS "à mão" (ex.: a regra `h1, h2 { font-family: var(--font-fraunces) }`
do `@layer base`) resolve contra o `:root` em runtime — e não encontra nada.

**Prevenção:** vars consumidas por CSS autoral (fora de utilities) vivem no
`:root`; o `@theme inline` fica só para o que vira utility (`--color-*`,
`--animate-*` etc.). Ao depurar "token sumiu", cheque primeiro
`getPropertyValue` no elemento raiz.
