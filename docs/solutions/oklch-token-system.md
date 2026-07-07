---
track: knowledge
category: design-system
problem_type: color-tokens-contrast
component: src/app/globals.css, src/components/bits.tsx
applies_when:
  - Cores semânticas (forest/honey/etc.) precisam servir de dot/badge E de texto
  - Precisa garantir WCAG AA sem perder a vivacidade da marca
---

# Sistema de tokens OKLCH + split semântico (vivo vs `-text`)

**Contexto:** os semânticos vivos falham AA como texto (forest `#42c366` ~2.2:1, honey `#ecb730` ~1.7:1), mas são ótimos como dot/badge/chart. Solução: **separar** o token vivo (indicador) de uma variante **`-text`** com L escurecido até ≥4.5:1.

**Método (determinístico — não "no olho"):**
- Converter hex→OKLCH (Ottosson OKLab) e computar contraste WCAG por **script** (`scratchpad/colors.mjs`). Não confie em contraste estimado nem de subagente — ver [[subagent-contrast-math-unreliable]].
- Para cada `-text`: baixar **L** (mantendo H; C clampado ao gamut sRGB por busca binária) até contraste vs Paper ≥4.6 (claro) e vs `#191919` ≥4.6 (dark).
- `--crimson`/`--destructive`: escurecidos p/ AA — resolve **todo** texto de erro de uma vez, sem novo token (botão 4.88:1, texto 4.64:1, dark 4.62:1).

**Regra de uso:** `--forest` (vivo) = dot/badge/chart; `--forest-text` = rótulo/valor/checkmark; Heat = botão/ativo (não texto pequeno). Expostos no `@theme` como `text-forest-text` etc.

**Por que OKLCH:** L perceptualmente uniforme → ajuste de contraste previsível; Tailwind v4 já é OKLCH por dentro; dark mode derivável invertendo L.

**Pendente:** *sweep* dos mapas de tint duplicados por página → `-text` + consolidar em `bits.tsx` (ISSUES §Design).
