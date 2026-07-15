"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Reveal — entrada ao entrar na viewport (mesmo padrão IntersectionObserver
 * da /design). Usa a utility `animate-enter` (fade + rise 12px + blur, 280ms
 * var(--ease-enter); budget UI < 300ms — Emil) e faz stagger via `--stagger`
 * (60ms por passo). Reduced-motion: o movimento é neutralizado no globals.css;
 * aqui só garantimos que o conteúdo nunca fica preso invisível (fallback shown).
 */
export function Reveal({
  children,
  className,
  stagger = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  as?: React.ElementType;
}) {
  const ref = React.useRef<HTMLElement>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "-80px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-shown={shown}
      style={{ "--stagger": stagger } as React.CSSProperties}
      className={cn(
        "data-[shown=false]:opacity-0 data-[shown=true]:animate-enter",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
