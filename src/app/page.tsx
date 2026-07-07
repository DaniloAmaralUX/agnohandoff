import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Radio,
  Wrench,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemoryHub } from "@/components/memory-hub";

const features = [
  {
    icon: Brain,
    title: "Memória persistente",
    desc: "Cada agente lembra do histórico do contato entre canais e sessões — contexto que não se perde.",
  },
  {
    icon: Radio,
    title: "Omnichannel",
    desc: "WhatsApp, web, Telegram e Instagram no mesmo agente. Uma caixa de entrada, todos os canais.",
  },
  {
    icon: Wrench,
    title: "Ferramentas & MCP",
    desc: "Conecte CRM, agenda e APIs via MCP ou Python. O agente age, não só responde.",
  },
  {
    icon: ShieldCheck,
    title: "Pronto para produção",
    desc: "Multi-tenant, chaves próprias (BYOK), observabilidade e SLA. Sem lock-in.",
  },
];

const steps = [
  { n: "01", t: "Crie o agente", d: "Instruções, modelo e personalidade em minutos." },
  { n: "02", t: "Conecte canais e tools", d: "WhatsApp, site e suas APIs internas." },
  { n: "03", t: "Publique e observe", d: "Vá ao ar e acompanhe cada conversa em tempo real." },
];

export default function Landing() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* ── Nav ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex h-15 max-w-[1180px] items-center gap-3 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-heat text-heat-foreground">
              <span className="text-sm font-bold leading-none">A</span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight">AgnoHub</span>
          </div>
          {/* Itens de nav são inertes na demo — sem hover/underline p/ não prometer interação (achado: hover morto) */}
          <nav className="ml-6 hidden items-center gap-6 text-[13px] text-muted-foreground md:flex">
            <span>Produto</span>
            <span>Canais</span>
            <span>Preços</span>
            <span>Docs</span>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden text-muted-foreground sm:inline-flex"
            >
              <Link href="/onboarding">Criar conta</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden text-muted-foreground sm:inline-flex"
            >
              <Link href="/login">Entrar</Link>
            </Button>
            {/* CTA usa --primary (heat-600) para contraste AA do branco (achado: CTA laranja vivo reprova AA) */}
            <Button asChild size="sm">
              <Link href="/dashboard">
                Ver demo
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="grid-bg absolute inset-0 [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_75%)]" />
        <div className="relative mx-auto max-w-[1180px] px-5 pb-16 pt-20 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
            <span className="size-1.5 rounded-full bg-heat" />
            Plataforma de agentes de IA
          </div>
          {/* Piso do clamp reduzido p/ mobile aproximar mockup da 1ª dobra (achado: 1ª dobra 100% texto no mobile) */}
          <h1 className="mx-auto mt-6 max-w-3xl text-[clamp(2.25rem,6vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
            Agentes de IA que{" "}
            <span className="text-heat-text">lembram</span>, atendem e{" "}
            <span className="text-heat-text">resolvem</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-muted-foreground sm:text-[17px]">
            Construa, publique e opere agentes conversacionais com memória
            persistente. Omnichannel, com suas ferramentas, prontos para produção.
          </p>
          {/* CTAs w-full no mobile p/ alinhar larguras (achado: larguras desiguais empilhado);
              secundário aponta p/ #features p/ os destinos serem distintos (achado: par com mesmo destino);
              primário usa --primary (AA). */}
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/dashboard">
                Ver demo ao vivo
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="#features">Explorar o produto</Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
            {["Memória persistente", "Omnichannel", "Sem lock-in"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-forest-text" />
                {t}
              </span>
            ))}
          </div>

          {/* Preview ao vivo do produto (iframe do dashboard) */}
          <div className="relative mx-auto mt-14 max-w-[1000px]">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_24px_80px_-24px_rgba(0,0,0,0.25)]">
              <div className="flex items-center gap-1.5 border-b border-border bg-muted/60 px-3.5 py-2.5">
                <span className="size-2.5 rounded-full bg-crimson/70" />
                <span className="size-2.5 rounded-full bg-honey/80" />
                <span className="size-2.5 rounded-full bg-forest/80" />
                <span className="mx-auto rounded-md bg-background px-3 py-0.5 font-mono text-[11px] text-muted-foreground">
                  app.agnohub.ai/dashboard
                </span>
              </div>
              {/* Fade na base p/ corte não parecer bug de renderização (achado: mockup cortado no meio dos títulos) */}
              <div className="relative h-[420px] overflow-hidden [mask-image:linear-gradient(black_78%,transparent)]">
                <iframe
                  src="/dashboard"
                  title="Preview do produto"
                  className="pointer-events-none absolute left-0 top-0 origin-top-left"
                  style={{
                    width: "1440px",
                    height: "840px",
                    transform: "scale(0.694)",
                  }}
                />
                <Link
                  href="/dashboard"
                  aria-label="Abrir o produto"
                  className="absolute inset-0"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-[1180px] px-5 py-20 scroll-mt-16">
        <div className="max-w-2xl">
          <span className="font-mono text-[11px] uppercase tracking-wide text-heat-text">
            Por que AgnoHub
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Tudo que um agente precisa para ir a produção.
          </h2>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="surface p-5 transition-colors hover:border-heat/40"
            >
              <div className="flex size-10 items-center justify-center rounded-md heat-tint">
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-[15px] font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Como funciona ───────────────────────────────────────── */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-[1180px] px-5 py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wide text-heat-text">
                Como funciona
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Do zero ao ar em três passos.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                Sem infraestrutura para gerenciar. Você desenha o agente, conecta
                os canais e publica — a plataforma cuida do resto.
              </p>
            </div>
            <div className="grid gap-3">
              {steps.map((s) => (
                <div
                  key={s.n}
                  className="flex items-start gap-4 rounded-lg border border-border bg-background p-5"
                >
                  <span className="font-mono text-sm font-semibold text-heat-text">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold">{s.t}</h3>
                    <p className="mt-1 text-[13px] text-muted-foreground">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Assinatura: o hub que lembra ────────────────────────── */}
      <section className="mx-auto max-w-[1180px] px-5 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wide text-heat-text">
              Memória persistente
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              O hub que lembra.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Cada conversa — em qualquer canal — alimenta a mesma memória.
              O paciente que escreveu no WhatsApp ontem é reconhecido no site
              hoje: contexto, preferências e histórico, sem repetir nada.
            </p>
            <ul className="mt-6 flex flex-col gap-2 text-[14px]">
              {[
                "Identidade única por contato, entre canais",
                "Histórico e preferências entre sessões",
                "Retenção configurável por organização",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2 text-muted-foreground">
                  <Check className="size-4 shrink-0 text-forest-text" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <MemoryHub />
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────────────────── */}
      {/* No dark, o painel graphite ficava tonalmente igual ao fundo — borda mais forte + sombra p/ elevar (achado: hierarquia perdida no dark) */}
      <section className="mx-auto max-w-[1180px] px-5 py-24">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-graphite px-8 py-16 text-center shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] dark:border-white/12 dark:shadow-[0_24px_80px_-24px_rgba(0,0,0,0.6)]">
          <div className="grid-bg absolute inset-0 opacity-[0.15]" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-tight tracking-tight text-white">
              Veja a AgnoHub funcionando agora.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[15px] text-white/60">
              Protótipo navegável — explore todas as telas e fluxos do produto.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {/* Único CTA laranja da tela usa --primary (AA) */}
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Entrar no protótipo
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-4 px-5 py-8 text-[13px] text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex size-5 items-center justify-center rounded bg-heat text-heat-foreground">
              <span className="text-[11px] font-bold leading-none">A</span>
            </div>
            <span className="font-medium text-foreground">AgnoHub</span>
            <span>· Protótipo de design</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/design" className="transition-colors hover:text-foreground">
              Design System
            </Link>
            <Link href="/fluxos" className="transition-colors hover:text-foreground">
              Fluxos de teste
            </Link>
            {/* Itens inertes sem hover — não prometer clique (achado: hover morto no footer) */}
            <span>Privacidade</span>
            <span>Termos</span>
            <span>GitHub</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
