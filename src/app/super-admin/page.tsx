import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ArrowDownRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, ToneAvatar } from "@/components/bits";
import { superAdminOrgs, platformMetrics } from "@/lib/data";

export const metadata = {
  title: "AgnoHub — Super Admin",
};

/* Iniciais para o ToneAvatar (2 caracteres). */
function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* Rotação de tons para dar cor aos avatares das orgs. */
const orgTones = ["heat", "bluetron", "forest", "amethyst", "honey"];

/* Tons neutros para o badge de plano. */
function planClass(plan: string) {
  return plan === "Free"
    ? "border-border text-muted-foreground"
    : "border-border text-foreground";
}

export default function SuperAdminPage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* ── Nav topo própria (fora do app shell) ─────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-[1100px] items-center gap-3 px-5">
          <div className="flex size-7 items-center justify-center rounded-md bg-heat text-heat-foreground">
            <span className="text-sm font-bold leading-none">A</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight">
            AgnoHub
          </span>
          <Badge
            variant="outline"
            className="border-border font-mono text-[10px] font-normal text-muted-foreground"
          >
            Plataforma
          </Badge>
          <div className="ml-auto flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              <Link href="/dashboard">
                <ArrowLeft data-icon="inline-start" />
                Voltar ao app
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Conteúdo ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1100px] px-5 py-8">
        {/* Cabeçalho */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Plataforma
          </h1>
          <p className="text-sm text-muted-foreground">
            Visão de operador — organizações, consumo e saúde da conta em toda a
            AgnoHub.
          </p>
        </div>

        {/* Métricas */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {platformMetrics.map((m) => (
            <Card key={m.label} className="gap-0 py-4">
              <CardContent className="px-4">
                <p className="text-[13px] text-muted-foreground">{m.label}</p>
                <p className="mt-2 font-mono text-2xl font-semibold tracking-tight tabular">
                  {m.value}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[12px]">
                  <span
                    className={`inline-flex items-center gap-0.5 font-medium ${
                      m.trend === "up" ? "text-forest-text" : "text-muted-foreground"
                    }`}
                  >
                    {m.trend === "up" ? (
                      <ArrowUpRight className="size-3.5" />
                    ) : (
                      <ArrowDownRight className="size-3.5" />
                    )}
                    {m.delta}
                  </span>
                  <span className="text-muted-foreground">{m.hint}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Organizações */}
        <Card className="mt-3">
          <CardHeader>
            <CardTitle className="text-base">Organizações</CardTitle>
            <CardDescription>
              Contas ativas na plataforma e seu consumo no ciclo atual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organização</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead className="text-right">Assentos</TableHead>
                  <TableHead className="text-right">Tokens (mês)</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {superAdminOrgs.map((org, i) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ToneAvatar
                          tone={orgTones[i % orgTones.length]}
                          className="size-8 text-[12px]"
                        >
                          {initials(org.name)}
                        </ToneAvatar>
                        <span className="text-[13px] font-medium">
                          {org.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-normal ${planClass(
                          org.plan,
                        )}`}
                      >
                        {org.plan}
                      </Badge>
                    </TableCell>
                    {/* Células numéricas padronizadas: mono tabular foreground. */}
                    <TableCell className="text-right font-mono text-[12px] tabular text-foreground">
                      {org.seats}
                    </TableCell>
                    <TableCell className="text-right font-mono text-[12px] tabular text-foreground">
                      {org.tokens}
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusBadge status={org.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
