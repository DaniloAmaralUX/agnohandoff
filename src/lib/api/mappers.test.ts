import { describe, it, expect } from "vitest";
import { mapApiAgent } from "./agents";
import { mapApiProject } from "./projects";

describe("mapApiAgent", () => {
  it("converte um agente ativo em view 'Publicado' com tom por índice", () => {
    const view = mapApiAgent(
      { id: "agt_1", name: "Sofia", role: "Triagem", model_id: "claude-opus-4-8", is_active: true },
      0,
    );
    expect(view).toEqual({
      id: "agt_1",
      name: "Sofia",
      role: "Triagem",
      model: "claude-opus-4-8",
      status: "Publicado",
      tone: "heat",
    });
  });

  it("mapeia is_active=false para 'Rascunho'", () => {
    expect(mapApiAgent({ id: 2, name: "Léo", is_active: false }, 1).status).toBe("Rascunho");
  });

  it("cicla os tons pelo índice (módulo do tamanho da lista)", () => {
    expect(mapApiAgent({ id: 1, name: "a" }, 0).tone).toBe("heat");
    expect(mapApiAgent({ id: 1, name: "a" }, 5).tone).toBe("heat"); // 5 % 5 === 0
    expect(mapApiAgent({ id: 1, name: "a" }, 1).tone).toBe("bluetron");
  });

  it("normaliza campos ausentes/nulos para strings vazias e coage id para string", () => {
    const view = mapApiAgent({ id: 99, name: "X", role: null, model_id: null, is_active: null }, 2);
    expect(view.id).toBe("99");
    expect(view.role).toBe("");
    expect(view.model).toBe("");
    expect(view.status).toBe("Rascunho"); // is_active nulo => falsy
    expect(view.tone).toBe("forest");
  });
});

describe("mapApiProject", () => {
  it("traduz o status en->pt e trunca o workspace em 8 chars", () => {
    const view = mapApiProject({
      id: "prj_1",
      name: "Sofia",
      description: "Triagem",
      status: "active",
      workspace_id: "ws_atendimento_clinico",
    });
    expect(view).toEqual({
      id: "prj_1",
      name: "Sofia",
      description: "Triagem",
      status: "Ativo",
      workspace: "ws_atend", // 8 chars
    });
  });

  it("mantém o status cru quando não há tradução conhecida", () => {
    expect(mapApiProject({ id: 1, name: "P", status: "custom" }).status).toBe("custom");
  });

  it("usa '—' quando workspace_id está ausente e vazio para campos nulos", () => {
    const view = mapApiProject({ id: 1, name: "P", description: null, status: null, workspace_id: null });
    expect(view.workspace).toBe("—");
    expect(view.description).toBe("");
    expect(view.status).toBe("");
  });
});
