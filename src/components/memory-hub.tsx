"use client";

/* Memory hub — a assinatura visual do AgnoHub na landing.
   Conceito: os canais conversam com o hub, e o hub LEMBRA (memória à direita).
   Beams com gradiente Heat correndo pelos caminhos (inspirado no Animated Beam
   do Magic UI, re-desenhado nos nossos tokens, sem dependências). Sob
   prefers-reduced-motion os beams ficam estáticos. */
import { MessageCircle, Globe, Send, Camera, Brain } from "lucide-react";

const CHANNELS = [
  { icon: MessageCircle, label: "WhatsApp", cls: "text-forest-text bg-forest/10" },
  { icon: Globe, label: "Web Widget", cls: "text-bluetron-text bg-bluetron/10" },
  { icon: Send, label: "Telegram", cls: "text-amethyst-text bg-amethyst/10" },
  { icon: Camera, label: "Instagram", cls: "text-honey-text bg-honey/15" },
];

/* Coordenadas no viewBox 600×320 — casadas com as posições % dos nós HTML. */
const BEAMS_IN = [
  "M 90 52  C 220 52, 240 160, 292 160",
  "M 90 124 C 200 124, 230 160, 292 160",
  "M 90 196 C 200 196, 230 160, 292 160",
  "M 90 268 C 220 268, 240 160, 292 160",
];
const BEAM_OUT = "M 308 160 C 400 160, 420 160, 508 160";

export function MemoryHub() {
  return (
    <div
      className="relative mx-auto w-full max-w-[640px]"
      role="img"
      aria-label="Diagrama: WhatsApp, Web Widget, Telegram e Instagram conectados a um hub central AgnoHub, que grava tudo na memória persistente."
    >
      <div className="relative aspect-[600/320]">
        {/* Beams */}
        <svg
          className="absolute inset-0 size-full"
          viewBox="0 0 600 320"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="beam-heat" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--heat)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--heat)" />
              <stop offset="100%" stopColor="var(--heat)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="beam-forest" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--forest)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--forest)" />
              <stop offset="100%" stopColor="var(--forest)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* trilhos */}
          {[...BEAMS_IN, BEAM_OUT].map((d) => (
            <path key={d} d={d} stroke="var(--border)" strokeWidth="1.5" />
          ))}
          {/* fluxo: canais → hub */}
          {BEAMS_IN.map((d, i) => (
            <path
              key={`hl-${d}`}
              d={d}
              stroke="url(#beam-heat)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="70 450"
              className="animate-beam-flow motion-reduce:animate-none motion-reduce:opacity-40"
              style={{ animationDelay: `${i * 0.85}s` }}
            />
          ))}
          {/* fluxo: hub → memória */}
          <path
            d={BEAM_OUT}
            stroke="url(#beam-forest)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="70 450"
            className="animate-beam-flow motion-reduce:animate-none motion-reduce:opacity-40"
            style={{ animationDelay: "0.4s" }}
          />
        </svg>

        {/* Canais (esquerda) */}
        <div className="absolute inset-y-0 left-0 flex w-[30%] flex-col justify-between py-1.5">
          {CHANNELS.map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 shadow-xs"
            >
              <span className={`flex size-6 items-center justify-center rounded-md ${c.cls}`}>
                <c.icon className="size-3.5" />
              </span>
              <span className="truncate text-[12px] font-medium">{c.label}</span>
            </div>
          ))}
        </div>

        {/* Hub (centro) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative flex size-16 items-center justify-center rounded-xl border border-heat/30 bg-card shadow-[0_8px_32px_-8px_rgb(0_0_0/0.15)]">
            <span className="absolute inset-0 rounded-xl bg-heat/10 motion-safe:animate-pulse" aria-hidden="true" />
            <span className="relative flex size-9 items-center justify-center rounded-lg bg-heat text-lg font-bold text-heat-foreground">
              A
            </span>
          </div>
        </div>

        {/* Memória (direita) */}
        <div className="absolute right-0 top-1/2 w-[26%] -translate-y-1/2">
          <div className="flex flex-col items-center gap-1.5 rounded-lg border border-forest/25 bg-card px-3 py-3 text-center shadow-xs">
            <span className="flex size-8 items-center justify-center rounded-md bg-forest/10 text-forest-text">
              <Brain className="size-4.5" />
            </span>
            <span className="text-[12px] font-medium">Memória persistente</span>
            <span className="text-[11px] leading-snug text-muted-foreground">
              cada contato, lembrado
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
