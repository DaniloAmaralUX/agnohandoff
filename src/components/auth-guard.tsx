"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { USE_MOCK } from "@/lib/config";
import { hasApiKey } from "@/lib/auth";

/* Protege as rotas do app.
   - Modo demo (mock): passa direto — o protótipo público continua aberto.
   - Modo API (produto real): sem chave => redireciona pro /login. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = React.useState(USE_MOCK);

  React.useEffect(() => {
    if (USE_MOCK) {
      setReady(true);
      return;
    }
    if (hasApiKey()) {
      setReady(true);
    } else {
      router.replace("/login");
    }
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}
