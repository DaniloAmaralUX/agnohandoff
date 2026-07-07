import { describe, it, expect } from "vitest";
import { orgStatusDot, statusDot, STATUS_DOT, STATUS_DOT_DEFAULT, TONE } from "./constants";
import { initials } from "./utils";
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
  Publicando: "text-honey-text",
  // crimson
  Desconectado: "text-crimson",
  Vencido: "text-crimson",
  Erro: "text-crimson",
  Falhou: "text-crimson",
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
    expect(TONE.heat).toBe("bg-heat/12 text-heat-text");
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

/* #119: status de ORG tem namespace próprio — "Ativo" de org (assinatura
   saudável → forest) não é o "Ativo" de projeto (em atividade → bluetron). */
describe("orgStatusDot (namespace de organização)", () => {
  it("Ativo de org é forest (não o bluetron de projeto)", () => {
    expect(orgStatusDot("Ativo")).toBe("text-forest-text");
    expect(statusDot("Ativo")).toBe("text-bluetron-text");
  });
  it("Suspenso alarma em crimson (antes caía no cinza default)", () => {
    expect(orgStatusDot("Suspenso")).toBe("text-crimson");
  });
  it("desconhecido cai no mesmo default neutro", () => {
    expect(orgStatusDot("qualquer")).toBe(STATUS_DOT_DEFAULT);
  });
});

/* #128: iniciais de avatar SEMPRE 2 letras maiúsculas, uma regra só. */
describe("initials (canônico)", () => {
  it("duas palavras → 1ª letra de cada, maiúsculas", () => {
    expect(initials("Maria Oliveira")).toBe("MO");
    expect(initials("joão santos")).toBe("JS");
  });
  it("uma palavra → 2 primeiras letras maiúsculas", () => {
    expect(initials("Sofia")).toBe("SO");
    expect(initials("léo")).toBe("LÉ");
  });
  it("ignora espaços extras e vazio", () => {
    expect(initials("  Ana   Costa  ")).toBe("AC");
    expect(initials("")).toBe("");
  });
});
