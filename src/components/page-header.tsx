import * as React from "react";

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
