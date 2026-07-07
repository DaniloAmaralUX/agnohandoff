/* ============================================================================
   Fonte ÚNICA de verdade para as cores semânticas de status e para os tons de
   chip/avatar do design system.

   Antes, cada tela tinha sua própria cópia de statusDot() com fallbacks
   divergentes (crimson em channels, honey em dashboard, bluetron em agents) —
   um bug latente: o mesmo status desconhecido pintava de cores diferentes por
   página. Aqui há UM mapa e UM default; todas as telas importam daqui.

   As strings de className são idênticas às que o design usava — nenhuma
   mudança visual para os status conhecidos. O default único e mais correto
   para status desconhecido é `text-muted-foreground` (neutro, sem alarme).
   ============================================================================ */

/** Classe de cor neutra para status desconhecido — o ÚNICO fallback. */
export const STATUS_DOT_DEFAULT = "text-muted-foreground";

/** status (rótulo em pt-BR usado na UI) → classe de cor do dot. */
export const STATUS_DOT: Record<string, string> = {
  // Sucesso / conectado / concluído → forest
  Publicado: "text-forest-text",
  Conectado: "text-forest-text",
  Resolvido: "text-forest-text",
  "Ativo (canal)": "text-forest-text",
  Pago: "text-forest-text",
  // Em atividade (projeto/conversa) → bluetron
  Ativo: "text-bluetron-text",
  // Em progresso / aguardando → honey
  Treinando: "text-honey-text",
  Pendente: "text-honey-text",
  Aguardando: "text-honey-text",
  Publicando: "text-honey-text", // #40: dot cinza em deploy — Publicando é transiente
  // Erro / expirado → crimson
  Desconectado: "text-crimson",
  Vencido: "text-crimson",
  Erro: "text-crimson",     // #32: dot cinza em Financeiro Legado (mcp)
  Falhou: "text-crimson",   // #40: consistência com deploy
};

/** Cor semântica do dot de status — reutilizada em todas as telas. */
export function statusDot(status: string): string {
  return STATUS_DOT[status] ?? STATUS_DOT_DEFAULT;
}

/* Chips/avatares tonalizados: fundo vivo (tint) + texto na variante -text
   (WCAG AA). Consumido por bits.tsx (ToneAvatar) e pelas telas via toneMap. */
export const TONE: Record<string, string> = {
  // #94: heat vivo falha AA em texto pequeno (avatar "So"). --heat-text é o
  // token calibrado por tema — alinha com os demais tons (bluetron-text etc.).
  heat: "bg-heat/12 text-heat-text",
  bluetron: "bg-bluetron/12 text-bluetron-text",
  forest: "bg-forest/12 text-forest-text",
  amethyst: "bg-amethyst/12 text-amethyst-text",
  honey: "bg-honey/15 text-honey-text",
  graphite: "bg-secondary text-foreground",
};
