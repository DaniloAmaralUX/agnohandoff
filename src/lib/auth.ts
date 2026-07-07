/* Sessão simples por X-API-Key (como o ?api_key= do Streamlit).
   Guarda a chave no localStorage; no produto real, o /login preenche isso.
   Em dev, NEXT_PUBLIC_DEV_API_KEY serve de padrão para provar o fluxo. */
import { API_URL } from "./config";

const STORAGE_KEY = "agnohub_api_key";
const DEV_DEFAULT = process.env.NEXT_PUBLIC_DEV_API_KEY ?? "";

export function getApiKey(): string {
  if (typeof window === "undefined") return DEV_DEFAULT;
  return window.localStorage.getItem(STORAGE_KEY) ?? DEV_DEFAULT;
}

export function setApiKey(key: string): void {
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, key);
}

export function clearApiKey(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
}

export function hasApiKey(): boolean {
  return getApiKey().length > 0;
}

/* Valida uma chave chamando um endpoint autenticado da API.
   Em modo demo (sem API_URL) não há o que validar. */
export async function validateApiKey(key: string): Promise<boolean> {
  if (!API_URL) return true;
  try {
    const res = await fetch(`${API_URL}/api/v1/project/info`, {
      headers: { "X-API-Key": key },
    });
    return res.ok;
  } catch {
    return false;
  }
}
