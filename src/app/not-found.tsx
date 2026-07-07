/* Página 404 global — rota não encontrada. Standalone, reaproveita
   EmptyState + Button e a voz do produto. Sem cores novas (estrutural). */
import Link from "next/link";
import { Compass } from "lucide-react";
import { EmptyState } from "@/components/bits";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[560px] items-center justify-center px-6">
      <EmptyState
        icon={Compass}
        title="Página não encontrada"
        description="O endereço que você tentou acessar não existe ou foi movido."
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">Voltar ao painel</Link>
          </Button>
        }
      />
    </div>
  );
}
