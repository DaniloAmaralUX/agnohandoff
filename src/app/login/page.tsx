"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, Loader2, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { setApiKey, validateApiKey } from "@/lib/auth";
import { USE_MOCK } from "@/lib/config";
import { useQueryClient } from "@tanstack/react-query";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [key, setKey] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = key.trim();
    if (!trimmed) {
      setError("Informe a chave de API do seu projeto.");
      return;
    }
    setLoading(true);
    const ok = await validateApiKey(trimmed);
    setLoading(false);
    if (ok) {
      setApiKey(trimmed);
      // Isola a sessão nova de qualquer cache da conta anterior.
      queryClient.clear();
      router.replace("/dashboard");
    } else {
      setError("Chave inválida ou API indisponível. Confira e tente de novo.");
    }
  }

  return (
    <div className="grid min-h-svh place-items-center bg-background px-5">
      <div className="grid-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_70%)]" />

      <div className="relative w-full max-w-[420px]">
        {/* Marca */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-heat text-heat-foreground">
            <span className="text-base font-bold leading-none">A</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">AgnoHub</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight">Entrar</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Use a chave de API do seu projeto para acessar o painel.
          </p>

          {USE_MOCK && (
            /* Copy simplificado — jargão de dev fora, mono só onde acrescenta (achado: 'o back não é chamado' + mono 11px em texto corrido) */
            <p className="mt-3 rounded-md bg-muted/60 px-3 py-2 text-[13px] text-muted-foreground">
              Modo demo — qualquer valor entra. Exemplo: <span className="font-mono text-[12px]">proj_demo</span>.
            </p>
          )}

          <form onSubmit={onSubmit} className="mt-5">
            <FieldGroup>
              <Field data-invalid={error ? true : undefined}>
                <FieldLabel htmlFor="apikey">Chave de API</FieldLabel>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="apikey"
                    type="password"
                    autoComplete="off"
                    placeholder="proj_••••••••••••"
                    className="pl-9 font-mono"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    aria-invalid={error ? true : undefined}
                  />
                </div>
                <FieldDescription>
                  Encontre em Configurações → Chaves de API do seu projeto.
                </FieldDescription>
              </Field>
            </FieldGroup>

            {error && (
              /* text-crimson-text não existe; --destructive já adapta por tema e passa AA (achado: crimson vivo em light reprova) */
              <p className="mt-3 flex items-center gap-1.5 text-[13px] text-destructive">
                <TriangleAlert className="size-4 shrink-0" />
                {error}
              </p>
            )}

            {/* Submit usa --primary (heat-600) — AA do branco (achado: fill vivo reprova AA) */}
            <Button
              type="submit"
              disabled={loading}
              className="mt-5 w-full"
            >
              {loading ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : null}
              Entrar
              {!loading && <ArrowRight data-icon="inline-end" />}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-[13px] text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link href="/onboarding" className="font-medium text-heat-text hover:underline">
            Criar organização
          </Link>
        </p>
      </div>
    </div>
  );
}
