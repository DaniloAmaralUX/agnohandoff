/* Client HTTP tipado (openapi-fetch) casado com os tipos gerados do OpenAPI.
   Injeta o header X-API-Key em toda requisição e converte respostas não-2xx
   em ApiError (status HTTP + mensagem), para tratamento uniforme nos hooks. */
import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./schema";
import { API_URL } from "@/lib/config";
import { getApiKey } from "@/lib/auth";
import { ApiError } from "./errors";

// Exportado para teste de unidade direto dos handlers (ver client.test.ts).
export const authMiddleware: Middleware = {
  onRequest({ request }) {
    const key = getApiKey();
    if (key) request.headers.set("X-API-Key", key);
    return request;
  },
  async onResponse({ response }) {
    if (!response.ok) {
      // Tenta extrair uma mensagem legível do corpo (detail do FastAPI, etc.).
      let body: unknown;
      let message = `Erro ${response.status} na API.`;
      try {
        body = await response.clone().json();
        const detail = (body as { detail?: unknown })?.detail;
        if (typeof detail === "string" && detail.length > 0) message = detail;
      } catch {
        // corpo não-JSON ou vazio — mantém a mensagem padrão.
      }
      throw new ApiError(response.status, message, body);
    }
    return response;
  },
};

export const api = createClient<paths>({ baseUrl: API_URL });
api.use(authMiddleware);
