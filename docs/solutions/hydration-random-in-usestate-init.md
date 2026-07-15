---
track: bug
category: react-ssr
problem_type: hydration-mismatch
component: src/lib/api/chat.ts
symptoms:
  - Aviso de hydration mismatch no console do Playground
  - Texto renderizado no servidor difere do cliente (session id)
root_cause: Math.random() no inicializador de useState roda no SSR e no cliente
resolution_type: code_fix
severity: medium
tags: [hydration, ssr, useState, random]
---

# Aleatoriedade no inicializador de useState causa hydration mismatch

## Problem
`useState(() => \`sess_\${Math.random()...}\`)` gera um valor no SSR e OUTRO no cliente; ao hidratar, o texto renderizado não bate e o React reclama.

## Solution
Iniciar o estado vazio e gerar o valor num `useEffect` (só roda no cliente); a UI mostra `—` enquanto vazio.

```ts
const [sessionId, setSessionId] = React.useState("");
React.useEffect(() => { setSessionId((p) => p || newSessionId()); }, []);
```

## Why This Works
O servidor e o primeiro render do cliente produzem o mesmo HTML (estado vazio); a aleatoriedade entra depois da hidratação, quando SSR já não participa.

## Prevention
`scripts/design-audit.mjs` sinaliza `Math.random()`/`Date.now()`/`crypto.randomUUID()` em inicializador de `useState`. O mesmo vale para qualquer valor não-determinístico no primeiro render (datas, IDs).
