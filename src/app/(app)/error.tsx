"use client";

/* Error boundary do grupo de rotas (app) — captura erros de render/data das
   telas internas SEM derrubar a shell (sidebar/topbar já vêm do layout).
   Reaproveita EmptyState + Button e a voz do produto. */
import * as React from "react";
import { TriangleAlert } from "lucide-react";
import { PageShell } from "@/components/page-header";
import { EmptyState } from "@/components/bits";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Em produção, envie para o seu serviço de observabilidade (ver HANDOFF).
    console.error(error);
  }, [error]);

  return (
    <PageShell>
      <EmptyState
        icon={TriangleAlert}
        title="Algo deu errado nesta tela"
        description="Não foi possível carregar esta página. Você pode tentar de novo — se persistir, atualize a página."
        action={
          <Button variant="outline" size="sm" onClick={() => reset()}>
            Tentar de novo
          </Button>
        }
      />
    </PageShell>
  );
}
