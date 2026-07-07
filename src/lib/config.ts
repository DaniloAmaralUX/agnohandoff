/* Config do cliente.
   Modo API (produto real): quando NEXT_PUBLIC_API_URL está definido.
   Modo demo (mock, para o protótipo de stakeholder): quando não há API URL. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
export const USE_API = API_URL.length > 0;
export const USE_MOCK = !USE_API;
