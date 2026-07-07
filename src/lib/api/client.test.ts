/* Testa os handlers do middleware do client isoladamente — a lógica mais
   arriscada da camada (traduzir HTTP não-2xx → ApiError, extrair `detail` do
   FastAPI, fallback p/ corpo não-JSON) e a injeção do X-API-Key. */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock da fonte da chave para exercitar o onRequest sem localStorage real.
vi.mock("@/lib/auth", () => ({ getApiKey: vi.fn() }));

import { authMiddleware } from "./client";
import { getApiKey } from "@/lib/auth";
import { ApiError } from "./errors";

const mockedGetApiKey = vi.mocked(getApiKey);

// Chama os handlers do middleware direto (só usam request/response).
const runOnRequest = (request: Request) =>
  (authMiddleware.onRequest as (o: { request: Request }) => Promise<Request>)({
    request,
  });
const runOnResponse = (response: Response) =>
  (authMiddleware.onResponse as (o: { response: Response }) => Promise<Response>)({
    response,
  });

describe("authMiddleware.onRequest", () => {
  beforeEach(() => mockedGetApiKey.mockReset());

  it("injeta X-API-Key quando há chave", async () => {
    mockedGetApiKey.mockReturnValue("pat-123");
    const out = await runOnRequest(new Request("https://api.test/x"));
    expect(out.headers.get("X-API-Key")).toBe("pat-123");
  });

  it("não injeta header quando não há chave", async () => {
    mockedGetApiKey.mockReturnValue(""); // getApiKey(): string — vazio = sem chave
    const out = await runOnRequest(new Request("https://api.test/x"));
    expect(out.headers.get("X-API-Key")).toBeNull();
  });
});

describe("authMiddleware.onResponse", () => {
  it("passa respostas 2xx adiante sem lançar", async () => {
    const res = new Response(JSON.stringify({ ok: true }), { status: 200 });
    await expect(runOnResponse(res)).resolves.toBe(res);
  });

  it("lança ApiError com o detail do FastAPI em respostas não-2xx", async () => {
    const res = new Response(JSON.stringify({ detail: "Projeto não encontrado" }), {
      status: 404,
    });
    await expect(runOnResponse(res)).rejects.toMatchObject({
      status: 404,
      message: "Projeto não encontrado",
    });
    await expect(
      runOnResponse(new Response(JSON.stringify({ detail: "x" }), { status: 404 })),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it("usa mensagem padrão quando o JSON não tem detail", async () => {
    const res = new Response(JSON.stringify({ erro: "algo" }), { status: 500 });
    await expect(runOnResponse(res)).rejects.toMatchObject({
      status: 500,
      message: "Erro 500 na API.",
    });
  });

  it("usa mensagem padrão quando o corpo não é JSON", async () => {
    const res = new Response("<html>502 Bad Gateway</html>", { status: 502 });
    await expect(runOnResponse(res)).rejects.toMatchObject({
      status: 502,
      message: "Erro 502 na API.",
    });
  });
});
