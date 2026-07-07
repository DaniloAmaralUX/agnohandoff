import { describe, it, expect } from "vitest";
import { ApiError, isApiError } from "./errors";

describe("ApiError", () => {
  it("carrega status, message e body", () => {
    const err = new ApiError(404, "Não encontrado", { detail: "x" });
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.name).toBe("ApiError");
    expect(err.status).toBe(404);
    expect(err.message).toBe("Não encontrado");
    expect(err.body).toEqual({ detail: "x" });
  });

  it("body é opcional", () => {
    const err = new ApiError(500, "Erro interno");
    expect(err.body).toBeUndefined();
  });

  it("isApiError distingue ApiError de outros erros", () => {
    expect(isApiError(new ApiError(400, "x"))).toBe(true);
    expect(isApiError(new Error("comum"))).toBe(false);
    expect(isApiError("string")).toBe(false);
    expect(isApiError(null)).toBe(false);
  });
});
