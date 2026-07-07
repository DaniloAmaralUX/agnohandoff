---
track: bug
category: react
problem_type: invalid-html-nesting
component: src/app/(app)/agents/page.tsx
---

# Skeleton dentro de `<p>` quebra (div dentro de p)

**Problema:** uma métrica renderizava `<p>{isLoading ? <Skeleton/> : value}</p>`. `<Skeleton>` é um `<div>`, e `<p>` não pode conter `<div>` → erro de hidratação/nesting no React.

**Solução:** trocar o elemento, não aninhar —
```tsx
{isLoading ? <Skeleton className="mt-2 h-7 w-10" /> : <p className="mt-2 ...">{value}</p>}
```

**Prevenção:** ao inserir skeleton de loading, renderizar **no lugar** do elemento de texto, nunca dentro dele.
