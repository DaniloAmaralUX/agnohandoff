---
track: bug
category: ui-bugs
problem_type: radix-data-state-variant-mismatch
component: src/components/ui/switch.tsx, src/app/globals.css
---

# Switch (e componentes Radix) "fantasma": data-checked:* não casa com o markup

**Problema:** o `Switch` renderizava como um círculo pálido sem trilho nem cor
de estado — impossível distinguir ligado de desligado. Multiplicado por ~6
telas (Playground, Ferramentas, Studio, Memória, /design, Builder), foi o
achado #1 da auditoria de design.

**Sintomas:** `getComputedStyle(switchEl).backgroundColor` = `rgba(0,0,0,0)`
mesmo com `data-state="checked"`; a className tem `data-checked:bg-primary`.
No CSS servido, **só existe 1 regra** mencionando `data-checked` (o texto do
`@custom-variant`), e nenhuma utility `.data-checked\:bg-primary` gerada.

**O que não funcionou:** registrar `@custom-variant data-checked (&[data-state="checked"])`
no globals.css. A sintaxe está correta e igual à do `dark` que funciona — mas
o Tailwind v4 **não gerou a utility** para o valor arbitrário quando a classe
aparece só via `cn()`/markup do shadcn (o scanner não pareou; possível
interação com o purge do markup do Radix).

**Solução:** usar a sintaxe de atributo nativa do Tailwind v4 direto na
className, sem custom-variant:

```tsx
// switch.tsx — Root
"data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
// Thumb
"group-data-[size=default]/switch:data-[state=checked]:translate-x-[calc(100%-2px)]"
```

**Por que funciona:** `data-[state=checked]:` é a forma *arbitrary-value* de
variante de atributo do Tailwind v4 — sempre compila quando a classe literal
aparece no source, sem depender de um `@custom-variant` registrado. O
`@custom-variant` é bom para dar um *nome curto* (ex.: `dark`), mas exige que
a variante nomeada seja detectada; a forma com colchetes é auto-suficiente.

**Prevenção:** para estados do Radix (`data-state`, `data-disabled`,
`aria-*`), prefira a sintaxe com colchetes `data-[state=X]:` na className. Ao
depurar "o estado do componente não pinta": (1) `getComputedStyle().backgroundColor`
no elemento; (2) grep no CSS servido pela utility esperada; se não existir, a
classe não foi gerada — troque para a forma arbitrary-value.
