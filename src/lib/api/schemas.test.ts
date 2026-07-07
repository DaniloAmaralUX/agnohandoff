import { describe, it, expect } from "vitest";
import {
  agentSchema,
  agentsResponseSchema,
  projectSchema,
  projectsResponseSchema,
} from "./schemas";

describe("agentSchema", () => {
  it("valida um payload de agente completo", () => {
    const res = agentSchema.safeParse({
      id: "agt_1",
      name: "Sofia",
      role: "Triagem",
      model_id: "claude-opus-4-8",
      is_active: true,
    });
    expect(res.success).toBe(true);
  });

  it("aceita id numérico e campos opcionais ausentes (só name obrigatório)", () => {
    expect(agentSchema.safeParse({ id: 7, name: "X" }).success).toBe(true);
    expect(agentSchema.safeParse({ id: 7, name: "X", role: null, is_active: null }).success).toBe(true);
  });

  it("rejeita quando name está ausente", () => {
    expect(agentSchema.safeParse({ id: "a" }).success).toBe(false);
  });

  it("rejeita is_active com tipo errado", () => {
    expect(agentSchema.safeParse({ id: "a", name: "X", is_active: "sim" }).success).toBe(false);
  });
});

describe("agentsResponseSchema", () => {
  it("valida o envelope { agents: [...] }", () => {
    const res = agentsResponseSchema.safeParse({ agents: [{ id: "a", name: "Sofia" }] });
    expect(res.success).toBe(true);
  });

  it("aceita envelope sem a chave agents (nullish)", () => {
    expect(agentsResponseSchema.safeParse({}).success).toBe(true);
  });

  it("rejeita quando um item da lista é inválido", () => {
    expect(agentsResponseSchema.safeParse({ agents: [{ id: "a" }] }).success).toBe(false);
  });
});

describe("projectSchema", () => {
  it("valida um payload de projeto completo", () => {
    const res = projectSchema.safeParse({
      id: "prj_1",
      name: "Sofia",
      description: "Triagem",
      status: "active",
      workspace_id: "ws_1",
    });
    expect(res.success).toBe(true);
  });

  it("aceita campos opcionais nulos", () => {
    expect(
      projectSchema.safeParse({ id: 1, name: "P", description: null, status: null, workspace_id: null }).success,
    ).toBe(true);
  });

  it("rejeita quando name está ausente", () => {
    expect(projectSchema.safeParse({ id: "p" }).success).toBe(false);
  });
});

describe("projectsResponseSchema", () => {
  it("valida o envelope { projects: [...] }", () => {
    expect(projectsResponseSchema.safeParse({ projects: [{ id: "p", name: "Sofia" }] }).success).toBe(true);
  });

  it("rejeita quando um item da lista é inválido", () => {
    expect(projectsResponseSchema.safeParse({ projects: [{ name: 123 }] }).success).toBe(false);
  });
});
