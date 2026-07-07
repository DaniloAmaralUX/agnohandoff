import * as React from "react";
import { Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { statusDot, TONE } from "@/lib/constants";

/* Cores de status e tons reutilizados em todas as telas (design system).
   A lógica canônica agora vive em @/lib/constants — re-exportada aqui para
   manter a API pública deste módulo intacta. */
export { statusDot, TONE };

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
        className,
      )}
    >
      {children}
    </div>
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
