import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OnboardingFlow } from "./onboarding-flow";

export const metadata: Metadata = {
  title: "Onboarding · AgnoHub",
  description: "Crie sua organização e configure sua conta na AgnoHub.",
};

export default function OnboardingPage() {
  return (
    <div className="relative min-h-svh bg-background text-foreground">
      <div className="grid-bg absolute inset-0 [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_70%)]" />

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <header className="relative border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-15 max-w-[1180px] items-center gap-3 px-5 py-3.5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-heat text-heat-foreground">
              <span className="text-sm font-bold leading-none">A</span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight">AgnoHub</span>
          </Link>
          <div className="ml-auto flex items-center gap-2 text-[13px] text-muted-foreground">
            <span className="hidden sm:inline">Já tem uma conta?</span>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link href="/dashboard">Entrar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Conteúdo ────────────────────────────────────────────── */}
      <main className="relative mx-auto max-w-[1180px] px-5 pb-24">
        <OnboardingFlow />
      </main>
    </div>
  );
}
