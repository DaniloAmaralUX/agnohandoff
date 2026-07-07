import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Iniciais canônicas p/ avatares (#128): 2 letras, SEMPRE maiúsculas.
    Antes cada tela tinha a sua cópia (3 duplicatas + slice(0,2) cru sem
    uppercase) e a caixa variava por página. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
