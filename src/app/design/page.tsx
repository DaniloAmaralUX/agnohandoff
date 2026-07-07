"use client";

import * as React from "react";
import Link from "next/link";
import {
  Palette,
  Type as TypeIcon,
  Ruler,
  Square,
  Layers,
  Sparkles,
  Accessibility,
  Component as ComponentIcon,
  Hexagon,
  ArrowLeft,
  ArrowRight,
  Sun,
  Moon,
  Circle,
  Check,
  Info,
  TriangleAlert,
  Bot,
  Gauge,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, ToneAvatar, MonoLabel, EmptyState } from "@/components/bits";
import {
  COMMITMENTS,
  ROADMAP,
  AREAS,
  adesao,
  progressoRoadmap,
  type Adesao,
  type RoadStatus,
} from "./system";
import audit from "./audit.json";

function StatusGlyph({ status }: { status: Adesao }) {
  const cls: Record<Adesao, string> = {
    aplicado: "text-forest-text",
    parcial: "text-honey-text",
    pendente: "text-muted-foreground/50",
  };
  const glyph: Record<Adesao, string> = { aplicado: "✓", parcial: "~", pendente: "○" };
  return (
    <span className={`mt-px w-3.5 shrink-0 text-center font-mono text-[12px] leading-tight ${cls[status]}`}>
      {glyph[status]}
    </span>
  );
}

function RoadBadge({ status }: { status: RoadStatus }) {
  const map: Record<RoadStatus, [string, string]> = {
    feito: ["Feito", "bg-forest/12 text-forest-text"],
    // 10px em heat vivo reprova AA no light — heat-text (achado)
    "em-progresso": ["Em progresso", "bg-heat/12 text-heat-text"],
    planejado: ["Planejado", "bg-muted text-muted-foreground"],
  };
  const [label, cls] = map[status];
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${cls}`}>{label}</span>;
}

/* ══ Documentação de design VIVA do AgnoHub ══════════════════════════
   Renderiza os tokens e componentes REAIS (lê os CSS vars em runtime),
   então nunca desalinha do produto. Molde: vercel.com/design.
   ═══════════════════════════════════════════════════════════════════ */

const NAV: [string, string, React.ComponentType<{ className?: string }>][] = [
  ["visao", "Visão geral", Hexagon],
  ["status", "Status & Adesão", Gauge],
  ["cor", "Cor", Palette],
  ["tipografia", "Tipografia", TypeIcon],
  ["espaco", "Espaço & ritmo", Ruler],
  ["raios", "Raios", Square],
  ["elevacao", "Elevação", Layers],
  ["motion", "Motion", Sparkles],
  ["guidelines", "Guidelines", Accessibility],
  ["componentes", "Componentes", ComponentIcon],
  ["marca", "Marca", Hexagon],
];

/* Tokens a documentar (lidos ao vivo do :root) */
const BRAND = [
  ["--heat", "Acento único da marca — CTA, ativo, foco"],
  ["--heat-hover", "Hover do primário"],
  ["--graphite", "Grafite — texto/superfície escura"],
  ["--paper", "Paper — canvas claro"],
] as const;
const SEM_VIVID = [
  ["--forest", "Sucesso"],
  ["--bluetron", "Info / dados"],
  ["--honey", "Aviso"],
  ["--crimson", "Erro"],
  ["--amethyst", "Acento"],
] as const;
const SEM_TEXT = [
  ["--forest-text", "Sucesso em texto"],
  ["--bluetron-text", "Info em texto"],
  ["--honey-text", "Aviso em texto"],
  ["--amethyst-text", "Acento em texto"],
] as const;
const SLOTS = [
  ["--background", "Fundo"],
  ["--foreground", "Texto"],
  ["--card", "Superfície"],
  ["--muted", "Fundo sutil"],
  ["--muted-foreground", "Texto 2º"],
  ["--accent", "Hover sutil"],
  ["--border", "Hairline"],
  ["--input", "Fundo de input"],
  ["--primary", "Primário (= Heat)"],
  ["--secondary", "Secundário"],
  ["--destructive", "Destrutivo"],
  ["--ring", "Anel de foco"],
] as const;
const CHARTS = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"] as const;
const SIDEBAR = [
  ["--sidebar", "Fundo da sidebar"],
  ["--sidebar-primary", "Item ativo"],
  ["--sidebar-accent", "Hover"],
  ["--sidebar-border", "Linha"],
] as const;

const ALL_VARS = [
  ...BRAND.map((x) => x[0]),
  ...SEM_VIVID.map((x) => x[0]),
  ...SEM_TEXT.map((x) => x[0]),
  ...SLOTS.map((x) => x[0]),
  ...CHARTS,
  ...SIDEBAR.map((x) => x[0]),
];

/* #51: OKLCH autorado (globals.css) — o browser resolve getPropertyValue p/ lab() truncado.
   Mostramos a string oklch() como valor principal; o lab() computado vira linha secundária. */
const OKLCH_LIGHT: Record<string, string> = {
  "--heat": "oklch(0.68 0.2 42)",
  "--heat-hover": "oklch(0.625 0.19 42)",
  "--graphite": "oklch(0.265 0.008 55)",
  "--paper": "oklch(0.985 0.004 65)",
  "--forest": "oklch(0.725 0.173 149.1)",
  "--bluetron": "oklch(0.58 0.223 262.6)",
  "--honey": "oklch(0.806 0.152 85.4)",
  "--crimson": "oklch(0.575 0.22 29.8)",
  "--amethyst": "oklch(0.624 0.223 292.4)",
  "--heat-text": "oklch(0.52 0.15 44)",
  "--forest-text": "oklch(0.53 0.149 149.1)",
  "--honey-text": "oklch(0.55 0.113 85.4)",
  "--bluetron-text": "oklch(0.56 0.223 262.6)",
  "--amethyst-text": "oklch(0.57 0.223 292.4)",
  "--background": "oklch(0.985 0.004 65)",
  "--foreground": "oklch(0.255 0.008 55)",
  "--card": "oklch(0.998 0.002 65)",
  "--muted": "oklch(0.964 0.006 65)",
  "--muted-foreground": "oklch(0.522 0.012 58)",
  "--accent": "oklch(0.968 0.008 60)",
  "--border": "oklch(0.922 0.007 65)",
  "--input": "oklch(0.905 0.008 65)",
  "--primary": "oklch(0.55 0.175 42)",
  "--secondary": "oklch(0.964 0.006 65)",
  "--destructive": "oklch(0.575 0.22 29.8)",
  "--ring": "oklch(0.68 0.2 42)",
};
const OKLCH_DARK: Record<string, string> = {
  ...OKLCH_LIGHT,
  "--background": "oklch(0.215 0.006 55)",
  "--foreground": "oklch(0.95 0.003 70)",
  "--card": "oklch(0.25 0.007 55)",
  "--muted": "oklch(0.29 0.006 55)",
  "--muted-foreground": "oklch(0.72 0.006 60)",
  "--accent": "oklch(0.31 0.008 55)",
  "--border": "oklch(0.31 0.006 55)",
  "--input": "oklch(0.325 0.007 55)",
  "--secondary": "oklch(0.29 0.006 55)",
  "--destructive": "oklch(0.653 0.196 30.3)",
  "--crimson": "oklch(0.635 0.22 29.8)",
  "--heat-text": "oklch(0.74 0.16 44)",
  "--forest-text": "oklch(0.6 0.169 149.1)",
  "--honey-text": "oklch(0.615 0.126 85.4)",
  "--bluetron-text": "oklch(0.62 0.205 262.6)",
  "--amethyst-text": "oklch(0.635 0.216 292.4)",
};

const RADII = [
  ["sm", "--radius-sm", "4px"],
  ["md", "--radius-md", "6px"],
  ["lg", "--radius-lg", "8px"],
  ["xl", "--radius-xl", "12px"],
  ["full", "", "999px"],
] as const;
const SPACING = ["4", "8", "12", "16", "24", "32", "48", "64", "96"];

const GUIDELINES: [React.ComponentType<{ className?: string }>, string, string][] = [
  [
    Accessibility,
    "Acessibilidade primeiro",
    "Semântica nativa antes de ARIA (`<button>`, `<label>`, `<table>`). Botão-ícone precisa de `aria-label`. Foco visível (`:focus-visible`, anel ≥ 3:1). Status = cor **+** texto/ícone, nunca cor sozinha. Alvos ≥ 24px (44px no toque).",
  ],
  [
    Layers,
    "Todo estado desenhado",
    "Toda tela cobre loading (skeleton que espelha o layout), erro (banner + retry) e vazio (mensagem + CTA). Toda tela oferece um próximo passo. Ações destrutivas pedem confirmação ou Undo (5–10s).",
  ],
  [
    TypeIcon,
    "Microcopy",
    "Voz ativa e orientada à ação (“Salvar chave”, não “A chave será salva”). Reticências reais `…` em ações que abrem diálogo (“Renomear…”). Números tabulares e `nbsp` em métricas/atalhos (`10 MB`, `⌘ K`). Erros guiam a saída: problema + solução.",
  ],
  [
    Sparkles,
    "Performance percebida",
    "Mutação < 500ms (alvo 200–300ms). Spinner só depois de ~200ms e com duração mínima (sem flash). **Optimistic UI** em toggles/ações reversíveis, revertendo em erro. Estado (filtro/sort/página) na URL para deep-linking.",
  ],
  [
    Circle,
    "Interação & motion",
    "Motion só quando comunica (feedback/transição), ~70% sem motion (admin é ferramenta). Sem `transition: all` — liste as propriedades. GPU-friendly (`transform`/`opacity`). Respeita `prefers-reduced-motion`. Navegação sempre em `<Link>`/`<a>`.",
  ],
];

/* Chip de token — lê o valor ao vivo (getComputedStyle) → nunca desalinha. */
function Swatch({
  v,
  name,
  note,
  text,
  dark,
}: {
  v: Record<string, string>;
  name: string;
  note?: string;
  text?: boolean;
  dark?: boolean;
}) {
  // #51: string oklch() autorada como valor principal (browser resolvia p/ lab() truncado)
  const authored = (dark ? OKLCH_DARK : OKLCH_LIGHT)[name];
  const computed = v[name];
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {text ? (
        <div className="flex h-14 items-center justify-center">
          <span className="text-lg font-semibold" style={{ color: `var(${name})` }}>
            Aa
          </span>
        </div>
      ) : (
        <div className="h-14 w-full" style={{ background: `var(${name})` }} />
      )}
      <div className="border-t border-border px-3 py-2">
        <p className="truncate font-mono text-[11px] font-medium">{name}</p>
        <p
          className="truncate font-mono text-[10px] text-muted-foreground"
          title={authored || computed || "—"}
        >
          {authored || computed || "—"}
        </p>
        {note && <p className="mt-1 text-[10px] leading-snug text-muted-foreground">{note}</p>}
      </div>
    </div>
  );
}

function Section({
  id,
  icon: Icon,
  eyebrow,
  title,
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-border py-12">
      {/* Eyebrows das seções em heat-text — texto pequeno passa AA no light (achado) */}
      <div className="flex items-center gap-2 text-heat-text">
        <Icon className="size-4" />
        <span className="font-mono text-[11px] uppercase tracking-wide">{eyebrow}</span>
      </div>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function DesignPage() {
  const [dark, setDark] = React.useState(false);
  const [v, setV] = React.useState<Record<string, string>>({});
  // Scrollspy p/ nav lateral — doc é ~12k px, sem 'você está aqui' o usuário perdia orientação (achado)
  const [activeId, setActiveId] = React.useState<string>(NAV[0][0]);
  const rp = progressoRoadmap();
  const agGeral = adesao();

  React.useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  React.useEffect(() => {
    const els = NAV.map(([id]) => document.getElementById(id)).filter(
      (el): el is HTMLElement => !!el
    );
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        // Ativo = seção mais próxima do topo dentro da janela de trigger
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    const map: Record<string, string> = {};
    ALL_VARS.forEach((n) => (map[n] = cs.getPropertyValue(n).trim()));
    setV(map);
  }, [dark]);

  function toggleTheme() {
    const el = document.documentElement;
    el.classList.toggle("dark");
    setDark(el.classList.contains("dark"));
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-3 px-5">
          <div className="flex size-7 items-center justify-center rounded-md bg-heat text-heat-foreground">
            <span className="text-sm font-bold leading-none">A</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight">AgnoHub</span>
          <Badge
            variant="outline"
            className="border-border font-mono text-[10px] font-normal text-muted-foreground"
          >
            Design
          </Badge>
          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={dark ? "Tema claro" : "Tema escuro"}
              onClick={toggleTheme}
              className="text-muted-foreground"
            >
              {dark ? <Sun /> : <Moon />}
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link href="/dashboard">
                <ArrowLeft data-icon="inline-start" />
                Produto
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1180px] gap-10 px-5">
        {/* Nav lateral fixa + scrollspy — item ativo com fundo/texto + marcador (achado: sem 'você está aqui') */}
        <nav className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-52 shrink-0 flex-col gap-0.5 overflow-y-auto py-8 lg:flex">
          {NAV.map(([id, label, Icon]) => {
            const active = id === activeId;
            return (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active ? "location" : undefined}
                className={`flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] transition-colors ${
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" />
                {label}
              </a>
            );
          })}
        </nav>

        {/* Conteúdo */}
        <main className="min-w-0 flex-1">
          {/* Hero */}
          <section id="visao" className="scroll-mt-20 py-14">
            {/* Eyebrow em text-heat-text — <14px em heat vivo reprova AA no light (achado) */}
            <span className="font-mono text-[11px] uppercase tracking-wide text-heat-text">
              Documentação viva
            </span>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.02em]">
              Design System do AgnoHub
            </h1>
            <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
              A referência canônica do design do produto — no espírito do{" "}
              <span className="font-medium text-foreground">vercel.com/design</span>. Os valores aqui
              são lidos <strong className="font-medium text-foreground">em tempo real</strong> dos
              tokens do app (`globals.css`), então esta página{" "}
              <strong className="font-medium text-foreground">nunca desalinha</strong> do produto.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["Heat como acento único", "Uma cor quente carrega a marca. O resto é estrutura (Graphite/Paper)."],
                ["Admin é ferramenta", "Clareza > novidade. Densidade útil, motion contida (~70% sem motion)."],
                ["Fiel por construção", "Tokens em OKLCH + componentes shadcn/Radix; a doc renderiza os reais."],
              ].map(([t, d]) => (
                <div key={t} className="rounded-lg border border-border bg-card p-4">
                  <p className="text-[13px] font-semibold">{t}</p>
                  <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Status & Adesão */}
          <Section id="status" icon={Gauge} eyebrow="Governança" title="Status & Adesão">
            <p className="mb-5 max-w-2xl text-[13px] text-muted-foreground">
              Onde estamos nas melhorias mapeadas e se estamos aplicando o que documentamos. Doc viva
              (atualizada por sessão); o sinal é <strong className="text-foreground">medido</strong> por{" "}
              <span className="font-mono text-[12px]">pnpm design:audit</span>, não auto-declarado.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-[12px] text-muted-foreground">Roadmap</p>
                <p className="mt-1 text-2xl font-semibold tabular">
                  {rp.feito}/{rp.total}{" "}
                  <span className="text-[13px] font-normal text-muted-foreground">feitos</span>
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-heat" style={{ width: `${rp.pct}%` }} />
                </div>
                <p className="mt-1.5 text-[12px] text-muted-foreground">
                  {rp.emProgresso} em progresso · {rp.planejado} planejados
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-[12px] text-muted-foreground">Adesão (o que dizemos aplicar)</p>
                <p className="mt-1 text-2xl font-semibold tabular">
                  {agGeral.aplicado}/{agGeral.total}{" "}
                  <span className="text-[13px] font-normal text-muted-foreground">aplicados</span>
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-forest" style={{ width: `${agGeral.pct}%` }} />
                </div>
                <p className="mt-1.5 text-[12px] text-muted-foreground">
                  {agGeral.parcial} parciais · {agGeral.pendente} pendentes
                </p>
              </div>
            </div>

            <h3 className="mb-3 mt-8 text-[13px] font-semibold">Adesão por área</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {AREAS.map((area) => {
                const a = adesao(area);
                return (
                  <div key={area} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-semibold">{area}</p>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {a.aplicado}/{a.total}
                      </span>
                    </div>
                    <ul className="mt-2.5 space-y-1.5">
                      {COMMITMENTS.filter((c) => c.area === area).map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12.5px]">
                          <StatusGlyph status={c.status} />
                          <span className={c.status === "pendente" ? "text-muted-foreground" : ""}>
                            {c.rule}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <h3 className="mb-3 mt-8 text-[13px] font-semibold">Roadmap</h3>
            <div className="overflow-hidden rounded-lg border border-border">
              {ROADMAP.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <RoadBadge status={r.status} />
                  <span className="min-w-0 flex-1 truncate text-[13px]">{r.title}</span>
                  <span className="hidden shrink-0 font-mono text-[11px] text-muted-foreground sm:block">
                    {r.area}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{r.prioridade}</span>
                </div>
              ))}
            </div>

            <h3 className="mb-1 mt-8 text-[13px] font-semibold">
              Sinal medido{" "}
              <span className="font-mono text-[11px] font-normal text-muted-foreground">pnpm design:audit</span>
            </h3>
            <p className="mb-3 text-[12px] text-muted-foreground">
              Drift real no código (heurístico) — a evidência da adesão, não auto-declarada.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {audit.checks.map((c) => (
                <div key={c.key} className="rounded-lg border border-border bg-card p-3">
                  <p className="text-2xl font-semibold tabular">{c.count}</p>
                  <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{c.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 font-mono text-[10px] text-muted-foreground">
              última auditoria: {audit.generatedAt}
            </p>
          </Section>

          {/* Cor */}
          <Section id="cor" icon={Palette} eyebrow="Foundations" title="Cor">
            <p className="mb-4 text-[13px] text-muted-foreground">
              Marca (tema Firecrawl). Fonte: OKLCH em <span className="font-mono text-[12px]">globals.css</span>;
              os valores abaixo são <strong className="text-foreground">lidos ao vivo</strong> (formato computado do browser).
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {BRAND.map(([name, note]) => (
                <Swatch key={name} v={v} name={name} note={note} dark={dark} />
              ))}
            </div>

            <p className="mb-4 mt-8 text-[13px] text-muted-foreground">
              Semânticos <strong className="text-foreground">vivos</strong> — dot / badge / chart (não usar como texto pequeno).
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {SEM_VIVID.map(([name, note]) => (
                <Swatch key={name} v={v} name={name} note={note} dark={dark} />
              ))}
            </div>

            <p className="mb-4 mt-8 text-[13px] text-muted-foreground">
              Semânticos <strong className="text-foreground">-text</strong> — versão escura para texto (WCAG AA ≥ 4.5:1).
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SEM_TEXT.map(([name, note]) => (
                <Swatch key={name} v={v} name={name} note={note} text dark={dark} />
              ))}
            </div>

            <p className="mb-4 mt-8 text-[13px] text-muted-foreground">Slots shadcn (superfícies & texto).</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {SLOTS.map(([name, note]) => (
                <Swatch key={name} v={v} name={name} note={note} dark={dark} />
              ))}
            </div>

            <p className="mb-4 mt-8 text-[13px] text-muted-foreground">Charts & sidebar.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {CHARTS.map((name) => (
                <Swatch key={name} v={v} name={name} dark={dark} />
              ))}
              {SIDEBAR.map(([name, note]) => (
                <Swatch key={name} v={v} name={name} note={note} dark={dark} />
              ))}
            </div>

            <p className="mb-3 mt-8 text-[13px] text-muted-foreground">
              Escalas <strong className="text-foreground">50–900</strong> — rampas perceptuais OKLCH
              (fundos nos passos claros, texto nos escuros). Iguais nos dois modos.
            </p>
            <div className="space-y-2">
              {["heat", "forest", "honey", "bluetron", "amethyst", "crimson"].map((c) => (
                <div key={c} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 font-mono text-[11px] text-muted-foreground">{c}</span>
                  <div className="flex flex-1 overflow-hidden rounded-md border border-border">
                    {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((s) => (
                      <div
                        key={s}
                        className="h-8 flex-1"
                        style={{ background: `var(--${c}-${s})` }}
                        title={`--${c}-${s}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Tipografia */}
          <Section id="tipografia" icon={TypeIcon} eyebrow="Foundations" title="Tipografia">
            <div className="grid gap-3 sm:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <MonoLabel>Geist Sans · UI</MonoLabel>
                  <p className="mt-3 text-5xl font-semibold tracking-[-0.03em]">Ag</p>
                  <div className="mt-4 space-y-1.5">
                    <p className="text-2xl font-semibold tracking-[-0.02em]">Título · 24 / 600 / ‑0.02em</p>
                    <p className="text-[15px]">Corpo · 15–16 / 400 — o rato roeu a roupa do rei.</p>
                    <p className="text-[13px] text-muted-foreground">Auxiliar · 13 / muted</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <MonoLabel>Geist Mono · técnico</MonoLabel>
                  <p className="mt-3 font-mono text-5xl font-semibold">Ag</p>
                  <p className="mt-4 font-mono text-[13px]">proj_9183a9a4 · gemini-2.0-flash</p>
                  <p className="mt-1 font-mono text-[13px] tabular">1.284 · 87% · 1,8s · 4,2M</p>
                  <p className="mt-3 text-[12px] text-muted-foreground">
                    IDs, valores, chaves e código. Use <span className="tabular font-medium">tabular-nums</span> em métricas/tabelas.
                  </p>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* Espaço & ritmo */}
          <Section id="espaco" icon={Ruler} eyebrow="Foundations" title="Espaço & ritmo">
            <p className="mb-3 text-[13px] text-muted-foreground">
              Escala base 4px. Ritmo de 3 passos: <strong className="text-foreground">8</strong> dentro do grupo ·{" "}
              <strong className="text-foreground">16</strong> entre grupos · <strong className="text-foreground">32–40</strong> entre seções.
            </p>
            <div className="flex flex-wrap items-end gap-2">
              {SPACING.map((s) => (
                <div key={s} className="text-center">
                  <div className="bg-heat/70" style={{ width: `${s}px`, height: `${s}px` }} />
                  <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">{s}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Raios */}
          <Section id="raios" icon={Square} eyebrow="Foundations" title="Raios">
            <p className="mb-3 text-[13px] text-muted-foreground">
              Raios pequenos — a assinatura Firecrawl (mais afiada que o Geist default de 6px).
            </p>
            <div className="flex flex-wrap items-end gap-5">
              {RADII.map(([name, , px]) => (
                <div key={name} className="text-center">
                  <div
                    className="size-14 border border-border bg-heat/15"
                    style={{ borderRadius: px }}
                  />
                  <p className="mt-1.5 text-[11px] font-medium">{name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{px}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Elevação */}
          <Section id="elevacao" icon={Layers} eyebrow="Foundations" title="Elevação">
            <p className="mb-4 text-[13px] text-muted-foreground">
              Superfícies definidas por hairline + sombra sutil. Direção (do Geist): 3 níveis — card, popover, modal.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Card", "", "border + fundo (nível 1 — flat, assinatura Firecrawl)", "hairline"],
                ["Overlay", "shadow-[var(--shadow-overlay)]", "menu / dropdown (nível 2)", "--shadow-overlay"],
                ["Modal", "shadow-[var(--shadow-modal)]", "diálogo / sheet (nível 3)", "--shadow-modal"],
              ].map(([t, sh, d, tok]) => (
                <div key={t} className={`rounded-xl border border-border bg-card p-5 ${sh}`}>
                  <p className="text-[13px] font-semibold">{t}</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">{d}</p>
                  <p className="mt-3 font-mono text-[10px] text-muted-foreground">{tok}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Motion */}
          <Section id="motion" icon={Sparkles} eyebrow="Foundations" title="Motion">
            <div className="grid gap-3 sm:grid-cols-2">
              <Card>
                <CardContent className="space-y-2 pt-6 font-mono text-[12px]">
                  {/* Tokens em mono 12px — heat-text p/ passar AA no light (achado) */}
                  <p><span className="text-heat-text">--ease-enter</span> cubic-bezier(.4,0,.2,1)</p>
                  <p><span className="text-heat-text">--ease-exit</span> cubic-bezier(.4,0,1,1)</p>
                  <p><span className="text-heat-text">--ease-spring</span> cubic-bezier(.34,1.56,.64,1)</p>
                  <p className="pt-2 text-muted-foreground">durações: 150 · 200 · 300ms — nunca &gt; 500</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-[13px] font-medium">Hover-lift (cards clicáveis)</p>
                  <div className="mt-3 rounded-lg border border-border bg-card p-4 transition-[transform,border-color,box-shadow] duration-150 ease-enter hover:-translate-y-0.5 hover:border-heat/40 hover:shadow-sm">
                    <p className="text-[13px] text-muted-foreground">Passe o mouse — sobe 2px + sombra + borda Heat.</p>
                  </div>
                  <p className="mt-3 text-[12px] text-muted-foreground">
                    Tudo sob <span className="font-mono">prefers-reduced-motion</span>; só anima o que comunica.
                  </p>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* Guidelines */}
          <Section id="guidelines" icon={Accessibility} eyebrow="Guidelines" title="Guidelines de produto">
            <p className="mb-4 max-w-2xl text-[13px] text-muted-foreground">
              Adaptadas das <span className="text-foreground">Vercel Web Interface Guidelines</span> para o contexto admin do AgnoHub.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {GUIDELINES.map(([Icon, t, d]) => (
                <div key={t} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-heat" />
                    <p className="text-[14px] font-semibold">{t}</p>
                  </div>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Componentes ao vivo */}
          <Section id="componentes" icon={ComponentIcon} eyebrow="Biblioteca" title="Componentes (ao vivo)">
            <div className="grid gap-3 lg:grid-cols-2">
              <Card>
                <CardContent className="space-y-3 pt-6">
                  <p className="text-[12px] font-medium text-muted-foreground">Button</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" className="bg-heat text-heat-foreground hover:bg-heat-hover">
                      Primário <ArrowRight data-icon="inline-end" />
                    </Button>
                    <Button size="sm" variant="outline">Outline</Button>
                    <Button size="sm" variant="secondary">Secundário</Button>
                    <Button size="sm" variant="ghost" className="text-muted-foreground">Ghost</Button>
                    <Button size="sm" variant="destructive">Excluir</Button>
                    <Button size="sm" disabled>Desabilitado</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-3 pt-6">
                  <p className="text-[12px] font-medium text-muted-foreground">StatusBadge · dots vivos</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status="Publicado" />
                    <StatusBadge status="Ativo" />
                    <StatusBadge status="Pendente" />
                    <StatusBadge status="Desconectado" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-3 pt-6">
                  <p className="text-[12px] font-medium text-muted-foreground">ToneAvatar · chips (-text para legibilidade)</p>
                  <div className="flex flex-wrap items-center gap-3">
                    {["heat", "bluetron", "forest", "amethyst", "honey"].map((t) => (
                      <ToneAvatar key={t} tone={t} className="size-10 text-[13px]">
                        Ag
                      </ToneAvatar>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-3 pt-6">
                  <p className="text-[12px] font-medium text-muted-foreground">Input · Field · Switch</p>
                  <Field>
                    <FieldLabel htmlFor="d-in">Nome do agente</FieldLabel>
                    <Input id="d-in" placeholder="Ex.: Sofia" />
                    <FieldDescription>Aparece nas conversas.</FieldDescription>
                  </Field>
                  <div className="flex items-center gap-2 pt-1">
                    <Switch id="d-sw" defaultChecked />
                    <label htmlFor="d-sw" className="text-[13px]">Memória persistente</label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-2 pt-6">
                  <p className="text-[12px] font-medium text-muted-foreground">Estados</p>
                  <div className="flex items-center gap-2 text-[13px]">
                    <Skeleton className="h-4 w-24" />
                    <span className="text-muted-foreground">loading</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-md border border-crimson/30 bg-crimson/5 px-3 py-2 text-[13px]">
                    <TriangleAlert className="size-4 text-crimson" />
                    Erro ao carregar. <button className="font-medium text-foreground underline">Tentar de novo</button>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-forest-text">
                    <Check className="size-4" /> Sucesso — feedback discreto.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="mb-2 text-[12px] font-medium text-muted-foreground">EmptyState</p>
                  <EmptyState
                    icon={Bot}
                    title="Nenhum agente ainda"
                    description="Crie o primeiro para começar."
                    action={
                      <Button size="sm" className="bg-heat text-heat-foreground hover:bg-heat-hover">
                        Novo agente
                      </Button>
                    }
                    className="min-h-0 py-8"
                  />
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* Marca */}
          <Section id="marca" icon={Hexagon} eyebrow="Brand" title="Marca">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-[12px] font-medium text-muted-foreground">Logo & clearspace</p>
                  <div className="mt-4 flex items-center gap-5">
                    <div className="rounded-md border border-dashed border-border p-4">
                      <div className="flex size-12 items-center justify-center rounded-md bg-heat text-heat-foreground">
                        <span className="text-2xl font-bold leading-none">A</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-md bg-heat text-heat-foreground">
                        <span className="text-sm font-bold leading-none">A</span>
                      </div>
                      <span className="text-[15px] font-semibold tracking-tight">AgnoHub</span>
                    </div>
                  </div>
                  <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
                    Símbolo “A” no quadrado Heat. Wordmark em Geist Sans 600, tracking negativo.
                    Clearspace = altura do “A” em todos os lados. Mínimo 16px (UI) / 24px (display).
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-[12px] font-medium text-muted-foreground">Do &amp; Don’t</p>
                  <ul className="mt-3 space-y-2 text-[13px]">
                    <li className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-forest-text" />
                      Heat como acento/statement (CTA, ativo). Graphite/Paper = estrutura.
                    </li>
                    <li className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-forest-text" />
                      Máx. ~2 usos de Heat por tela — restraint (à la Vercel).
                    </li>
                    <li className="flex gap-2">
                      <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      Diferente da Vercel (monocromática): somos coloridos de propósito — só com disciplina.
                    </li>
                    <li className="flex gap-2">
                      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-crimson" />
                      Não alterar a forma do “A” nem trocar o Heat. Não usar Heat como texto pequeno.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* Footer */}
          <footer className="border-t border-border py-10 text-[13px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex size-5 items-center justify-center rounded bg-heat text-heat-foreground">
                <span className="text-[11px] font-bold leading-none">A</span>
              </div>
              <span className="font-medium text-foreground">AgnoHub</span>
              <span>· Design System vivo · valores lidos em runtime dos tokens reais</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
