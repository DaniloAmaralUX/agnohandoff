import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { statusDot, TONE } from "@/lib/constants";

/* Cores de status e tons reutilizados em todas as telas (design system).
   A lógica canônica agora vive em @/lib/constants — re-exportada aqui para
   manter a API pública deste módulo intacta. */
export { statusDot, TONE };

/* Sobre fundo tintado (bg-tom/12) a variante -text fica um fio abaixo de
   AA 4.5:1 no light; o passo 700 da escala garante o contraste. No dark a
   -text já é calibrada para AA — mantida via dark:. */
export const TONE_TEXT_AA: Record<string, string> = {
  bluetron: "text-bluetron-700 dark:text-bluetron-text",
  forest: "text-forest-700 dark:text-forest-text",
  amethyst: "text-amethyst-700 dark:text-amethyst-text",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 border-border text-[11px] font-normal text-foreground",
        className,
      )}
    >
      <Circle className={cn("size-2 fill-current", statusDot(status))} />
      {status}
    </Badge>
  );
}

export function ToneAvatar({
  tone = "graphite",
  children,
  className,
}: {
  tone?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-md font-semibold",
        TONE[tone] ?? TONE.graphite,
        TONE_TEXT_AA[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}

/* Linha de KPIs (#125): as 3 anatomias divergentes do app viram UMA.
   Valor em Geist Mono tabular (#124 — número-herói nunca em Fraunces);
   delta verde só quando sobe (cor semântica de TEXTO, não dot). */
export function StatCard({
  label,
  value,
  delta,
  trend,
  hint,
  className,
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  hint?: string;
  className?: string;
}) {
  return (
    <Card className={cn("gap-0 py-4", className)}>
      <CardContent className="px-4">
        <p className="text-[13px] text-muted-foreground">{label}</p>
        <p className="mt-2 font-mono text-2xl font-semibold tracking-tight tabular">
          {value}
        </p>
        {(delta || hint) && (
          <div className="mt-2 flex items-center gap-1.5 text-[12px]">
            {delta && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium",
                  trend === "up" ? "text-forest-text" : "text-muted-foreground",
                )}
              >
                {trend === "up" ? (
                  <ArrowUpRight className="size-3.5" />
                ) : (
                  <ArrowDownRight className="size-3.5" />
                )}
                {delta}
              </span>
            )}
            {hint && <span className="text-muted-foreground">{hint}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* Rótulo de seção em mono — sotaque técnico da Firecrawl. */
export function MonoLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
      {children}
    </span>
  );
}

/* Estado vazio reutilizável — ícone + título + descrição + CTA, com entrada sutil (animate-rise). */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "animate-rise col-span-full flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-6 py-12 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="mb-3 flex size-11 items-center justify-center rounded-md bg-secondary text-muted-foreground">
          <Icon className="size-5" />
        </div>
      )}
      <p className="text-sm font-semibold">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
