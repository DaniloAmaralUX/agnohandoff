/* Erro tipado da API — carrega o status HTTP e uma mensagem legível.
   Lançado pelo wrapper do openapi-fetch (client.ts) em respostas não-2xx e
   pela validação Zod (schemas.ts) quando o payload não bate com o contrato. */

export class ApiError extends Error {
  /** Status HTTP da resposta (0 quando o erro é de rede/validação, sem resposta). */
  readonly status: number;
  /** Payload cru do backend (quando disponível), útil para debug. */
  readonly body?: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    // Mantém a cadeia de protótipo correta ao transpilar para ES5/ES2017.
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}
