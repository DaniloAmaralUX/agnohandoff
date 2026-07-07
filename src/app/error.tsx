"use client";

/* Error boundary raiz — captura erros que escapam dos boundaries de rota.
   Standalone (sem shell). Reaproveita EmptyState + Button e a voz do produto. */
import * as React from "react";
import { TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/bits";
import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[560px] items-center justify-center px-6">
      <EmptyState
        icon={TriangleAlert}
        title="Ocorreu um erro inesperado"
        description="Algo saiu do previsto ao carregar o AgnoHub. Tente de novo — se o problema continuar, recarregue a página."
        action={
          <Button variant="outline" size="sm" onClick={() => reset()}>
            Tentar de novo
          </Button>
        }
      />
    </div>
  );
}
