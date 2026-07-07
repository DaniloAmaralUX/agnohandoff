---
track: knowledge
category: process
problem_type: verify-subagent-output
applies_when:
  - Um subagente (ou auto-review) reporta razões de contraste WCAG
  - Você vai alterar tokens de design com base nesses números
---

# Não confie na matemática de contraste de subagente — recalcule

**Contexto:** na revisão de design-handoff, um agente reportou `muted-foreground #6B6B6B` sobre Paper a **1.44:1 (falha)**. Recalculado à mão pela fórmula WCAG 2 (relative luminance): **~5.0:1 (passa)**. Outros números também vinham errados (ex.: branco no Heat reportado como 4.48:1, real ~3.2:1).

**Regra:** antes de mudar um token de cor por contraste, **recalcule** (luminância relativa WCAG 2) ou use ferramenta dedicada. Alterar a paleta com base em número alucinado é pior que o gap original.

**Aplicado:** os achados de contraste foram para o board como **decisão do designer**, não aplicados automaticamente. Ver `DESIGN-HANDOFF.md §7` e `ISSUES.md`.
