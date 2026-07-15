"use client";

import * as React from "react";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { isApiError } from "./errors";
import { clearApiKey } from "@/lib/auth";

/* 401 em qualquer query/mutation = sessão inválida: limpa a chave e volta
   para o login. Mitigação de protótipo — o fluxo definitivo de expiração/
   refresh está no ISSUES.md §Auth (decisões em HANDOFF.md §5.1). */
function handleUnauthorized(err: unknown) {
  if (!isApiError(err) || err.status !== 401) return;
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/login") return;
  clearApiKey();
  window.location.assign("/login");
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: handleUnauthorized }),
        mutationCache: new MutationCache({ onError: handleUnauthorized }),
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
