import { describe, it, expect } from "vitest";
import { statusDot, STATUS_DOT, STATUS_DOT_DEFAULT, TONE } from "./constants";
import { statusDot as statusDotFromBits, TONE as TONE_FROM_BITS } from "@/components/bits";

/* Regressão do bug latente: antes cada tela tinha seu próprio statusDot() com
   fallbacks divergentes. Agora há UM mapa e UM default — este teste fixa o
   contrato para TODOS os status conhecidos + o default. */

const EXPECTED: Record<string, string> = {
  // forest
  Publicado: "text-forest-text",
  Conectado: "text-forest-text",
  Resolvido: "text-forest-text",
  "Ativo (canal)": "text-forest-text",
  Pago: "text-forest-text",
  // bluetron
  Ativo: "text-bluetron-text",
  // honey
  Treinando: "text-honey-text",
  Pendente: "text-honey-text",
  Aguardando: "text-honey-text",
  // crimson
  Desconectado: "text-crimson",
  Vencido: "text-crimson",
};

describe("statusDot (mapa canônico)", () => {
  it.each(Object.entries(EXPECTED))("pinta %s de %s", (status, cls) => {
    expect(statusDot(status)).toBe(cls);
  });

  it("cai no default neutro para status desconhecido", () => {
    expect(statusDot("Rascunho")).toBe(STATUS_DOT_DEFAULT);
    expect(statusDot("qualquer-coisa")).toBe(STATUS_DOT_DEFAULT);
    expect(STATUS_DOT_DEFAULT).toBe("text-muted-foreground");
  });

  it("cobre exatamente o conjunto de status conhecidos (sem sobras/faltas)", () => {
    expect(new Set(Object.keys(STATUS_DOT))).toEqual(new Set(Object.keys(EXPECTED)));
  });

  it("bits.tsx re-exporta a mesma função canônica (sem divergência)", () => {
    expect(statusDotFromBits).toBe(statusDot);
    for (const [status, cls] of Object.entries(EXPECTED)) {
      expect(statusDotFromBits(status)).toBe(cls);
    }
  });
});

describe("TONE (mapa canônico de tons)", () => {
  it("mantém as classes esperadas por tom", () => {
    expect(TONE.heat).toBe("bg-heat/12 text-heat");
    expect(TONE.bluetron).toBe("bg-bluetron/12 text-bluetron-text");
    expect(TONE.forest).toBe("bg-forest/12 text-forest-text");
    expect(TONE.amethyst).toBe("bg-amethyst/12 text-amethyst-text");
    expect(TONE.honey).toBe("bg-honey/15 text-honey-text");
    expect(TONE.graphite).toBe("bg-secondary text-foreground");
  });

  it("bits.tsx re-exporta o mesmo mapa TONE", () => {
    expect(TONE_FROM_BITS).toBe(TONE);
  });
});
