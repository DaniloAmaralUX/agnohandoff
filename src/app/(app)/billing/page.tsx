"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Check,
  Coins,
  ArrowDownRight,
  ArrowUpRight,
  Receipt,
  Sparkles,
  Building2,
  Download,
} from "lucide-react";

import { PageHeader, PageShell } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/bits";
import { USE_MOCK } from "@/lib/config";
import { shortTokens } from "@/lib/plan-data";
import {
  useBillingBalance,
  useBillingPlans,
  usePurchasePack,
  useSubscribePlan,
  type BillingPlanView,
} from "@/lib/api/billing";

/* ── Dados locais (mock, tom Vitalmed) ──────────────────────────── */

// Valores numéricos-base — o estado local deriva os rótulos formatados daqui,
// então a compra de um pack pode somar tokens de verdade (mock read-only).
const creditSeed = {
  available: 1_848_000,
  used: 152_000,
  total: 2_000_000,
  //   antes da unidade: número não separa de "dias" em quebra de linha.
  renewsIn: "18 dias",
};

const fmt = (n: number) => n.toLocaleString("pt-BR");

type PlanCard = {
  id: string;
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  current?: boolean;
  cta: string;
  contact?: boolean;
};

const plans: PlanCard[] = [
  {
    id: "free",
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    tagline: "Para testar e prototipar.",
    features: [
      "1 agente publicado",
      "100 mil tokens / mês",
      "Widget do site",
      "Suporte por comunidade",
    ],
    cta: "Fazer downgrade",
  },
  {
    id: "starter",
    name: "Starter",
    price: "R$ 149",
    period: "/mês",
    tagline: "Primeiros fluxos em produção.",
    features: [
      "3 agentes publicados",
      "500 mil tokens / mês",
      "WhatsApp + Widget",
      "Memória de conversas",
    ],
    cta: "Assinar",
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 590",
    period: "/mês",
    tagline: "A clínica rodando no automático.",
    features: [
      "Agentes ilimitados",
      "2 milhões de tokens / mês",
      "Todos os canais",
      "Ferramentas MCP e HTTP",
      "Relatórios e SLA de resposta",
    ],
    current: true,
    cta: "Plano atual",
  },
  {
    id: "scale",
    name: "Scale",
    price: "Sob consulta",
    period: "",
    tagline: "Rede de unidades e integrações.",
    features: [
      "Tudo do Pro",
      "Cotas dedicadas de tokens",
      "SSO e papéis avançados",
      "Gerente de contas dedicado",
    ],
    cta: "Falar com vendas",
    contact: true,
  },
];

type CreditPack = {
  id: string;
  tokens: string;
  /** Quantidade de tokens que o pack adiciona ao saldo (para o mock somar de verdade). */
  amount: number;
  price: string;
  perThousand: string;
  note: string;
  recommended?: boolean;
};

const creditPacks: CreditPack[] = [
  {
    id: "pk_1m",
    tokens: "1M tokens",
    amount: 1_000_000,
    price: "R$ 320",
    perThousand: "R$ 0,320 / mil",
    note: "Cobre picos de agenda pontuais.",
  },
  {
    id: "pk_5m",
    tokens: "5M tokens",
    amount: 5_000_000,
    price: "R$ 1.450",
    perThousand: "R$ 0,290 / mil",
    note: "Melhor custo por mil — campanhas.",
    recommended: true,
  },
  {
    id: "pk_20m",
    tokens: "20M tokens",
    amount: 20_000_000,
    price: "R$ 5.200",
    perThousand: "R$ 0,260 / mil",
    note: "Volume alto e sazonalidade forte.",
  },
];

type Transaction = {
  id: string;
  type: "Recarga" | "Consumo" | "Renovação" | "Estorno";
  tokens: string;
  positive: boolean;
  cost: string;
  description: string;
  date: string;
};

const transactions: Transaction[] = [
  { id: "tx_9", type: "Consumo", tokens: "-38.400", positive: false, cost: "—", description: "Sofia · triagem WhatsApp", date: "01/07/2026" },
  { id: "tx_8", type: "Renovação", tokens: "+2.000.000", positive: true, cost: "US$ 118,00", description: "Ciclo mensal · plano Pro", date: "18/06/2026" },
  { id: "tx_7", type: "Recarga", tokens: "+5.000.000", positive: true, cost: "US$ 290,00", description: "Pacote 5M · campanha check-up", date: "12/06/2026" },
  { id: "tx_6", type: "Consumo", tokens: "-51.200", positive: false, cost: "—", description: "Dr. Agenda · agendamentos", date: "09/06/2026" },
  { id: "tx_5", type: "Estorno", tokens: "+12.800", positive: true, cost: "US$ 0,74", description: "Ajuste de tokens duplicados", date: "05/06/2026" },
  { id: "tx_4", type: "Consumo", tokens: "-27.900", positive: false, cost: "—", description: "Léo · qualificação de leads", date: "02/06/2026" },
];

function txDot(type: Transaction["type"]) {
  if (type === "Recarga") return "text-forest-text";
  if (type === "Renovação") return "text-bluetron-text";
  if (type === "Estorno") return "text-amethyst-text";
  return "text-muted-foreground";
}

/* Packs REAIS do backend (package_id do POST /billing/purchase) — em modo
   API o preço é definido na cobrança (a resposta traz o Pix). */
const API_PACKS: CreditPack[] = [
  { id: "pack_500k", tokens: "500K tokens", amount: 500_000, price: "Pix", perThousand: "na finalização", note: "Cobre picos pontuais." },
  { id: "pack_2m", tokens: "2M tokens", amount: 2_000_000, price: "Pix", perThousand: "na finalização", note: "Uso mensal típico.", recommended: true },
  { id: "pack_10m", tokens: "10M tokens", amount: 10_000_000, price: "Pix", perThousand: "na finalização", note: "Volume alto." },
  { id: "pack_50m", tokens: "50M tokens", amount: 50_000_000, price: "Pix", perThousand: "na finalização", note: "Escala e sazonalidade." },
];

/** "18 dias" a partir de uma data ISO futura; "—" sem data. */
function daysUntil(iso?: string): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  const d = Math.max(0, Math.ceil((t - Date.now()) / 86_400_000));
  return `${d} ${d === 1 ? "dia" : "dias"}`;
}

/** Card rico a partir do plano da API (features derivadas dos limites). */
function planToCard(p: BillingPlanView, currentPlan?: string): PlanCard {
  const lim = (n: number, singular: string, plural: string) =>
    n <= 0 ? `${plural} ilimitados` : `${fmt(n)} ${n === 1 ? singular : plural}`;
  return {
    id: p.id,
    name: p.name,
    price: p.priceBrl > 0 ? `R$ ${fmt(p.priceBrl)}` : "R$ 0",
    period: "/mês",
    tagline: "",
    features: [
      lim(p.maxProjects, "projeto", "projetos"),
      lim(p.maxAgents, "agente por projeto", "agentes por projeto"),
      `${shortTokens(p.monthlyCredits)} tokens / mês`,
      p.byok ? "BYOK — use suas próprias chaves" : "Chaves LLM da plataforma",
    ],
    current: currentPlan != null && p.name.toLowerCase() === currentPlan.toLowerCase(),
    cta: currentPlan != null && p.name.toLowerCase() === currentPlan.toLowerCase() ? "Plano atual" : "Assinar",
  };
}

export default function BillingPage() {
  // Demo: estado local que a compra simulada incrementa na hora.
  const [mockAvailable, setMockAvailable] = useState(creditSeed.available);
  const [mockTotal, setMockTotal] = useState(creditSeed.total);
  const [tab, setTab] = useState("planos");

  // Modo API: saldo real (X-Org-Id), planos reais e mutações de cobrança.
  const { data: balance } = useBillingBalance();
  const { data: apiPlans } = useBillingPlans();
  const purchase = usePurchasePack();
  const subscribe = useSubscribePlan();

  const available = USE_MOCK ? mockAvailable : balance?.available ?? 0;
  const total = USE_MOCK ? mockTotal : balance?.total ?? 0;
  const used = USE_MOCK ? creditSeed.used : balance?.used ?? 0;
  const usedPct = USE_MOCK
    ? Math.round((creditSeed.used / total) * 1000) / 10
    : balance?.usagePct ?? 0;
  const renewsIn = USE_MOCK ? creditSeed.renewsIn : daysUntil(balance?.periodEnd);
  const planName = balance?.plan ?? "Pro";

  const planCards = USE_MOCK
    ? plans
    : (apiPlans ?? []).map((p) => planToCard(p, balance?.plan));
  const packs = USE_MOCK ? creditPacks : API_PACKS;

  const creditMetrics = [
    { label: "Créditos disponíveis", value: fmt(available), hint: "tokens" },
    { label: "Usados no período", value: fmt(used), hint: "tokens" },
    { label: "Total do período", value: fmt(total), hint: `tokens · plano ${planName}` },
    { label: "Renova em", value: renewsIn, hint: "próximo ciclo" },
  ];

  function handleBuyPack(pack: CreditPack) {
    if (USE_MOCK) {
      setMockAvailable((n) => n + pack.amount);
      setMockTotal((n) => n + pack.amount);
      toast.success("Compra simulada — créditos adicionados.", {
        description: `${pack.tokens} entraram no seu saldo.`,
      });
      return;
    }
    purchase.mutate({ packageId: pack.id });
  }

  function handlePlanCta(plan: PlanCard) {
    if (plan.current) return;
    if (plan.contact) {
      toast.success("Pedido enviado — nosso time comercial vai te chamar.");
      return;
    }
    if (USE_MOCK) {
      toast.success(`Plano ${plan.name} selecionado.`, {
        description: "Mudança de plano simulada neste protótipo.",
      });
      return;
    }
    subscribe.mutate({ planId: plan.id });
  }

  function handleExport() {
    toast.success("Exportação iniciada.", {
      description: "Você receberá o arquivo por e-mail em instantes.",
    });
  }

  return (
    <PageShell>
      <PageHeader
        title="Faturamento"
        subtitle="Créditos, plano e histórico de consumo da Vitalmed."
      >
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download data-icon="inline-start" />
          Baixar faturas
        </Button>
        <Button
          size="sm"
          className="bg-heat text-heat-foreground hover:bg-heat-hover"
          onClick={() => setTab("comprar")}
        >
          <Coins data-icon="inline-start" />
          Comprar créditos
        </Button>
      </PageHeader>

      {/* ── Métricas de créditos — anatomia canônica de KPI (#125). ── */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {creditMetrics.map((m) => (
          <StatCard key={m.label} label={m.label} value={m.value} hint={m.hint} />
        ))}
      </div>

      {/* ── Barra de uso ─────────────────────────────────────────── */}
      <Card className="mt-3 gap-0 py-4">
        <CardContent className="px-4">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-foreground">Uso do período</span>
            <span className="font-mono tabular text-muted-foreground">
              {fmt(used)} / {fmt(total)} tokens ·{" "}
              <span className="text-foreground">{String(usedPct).replace(".", ",")}%</span>
            </span>
          </div>
          <Progress value={usedPct} className="mt-2.5 h-2" />
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">
            Renova em {renewsIn} · restam {fmt(available)} tokens
          </p>
        </CardContent>
      </Card>

      {/* ── Abas ─────────────────────────────────────────────────── */}
      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="planos">Planos</TabsTrigger>
          <TabsTrigger value="comprar">Comprar créditos</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        {/* ── Planos ─────────────────────────────────────────────── */}
        <TabsContent value="planos" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {planCards.map((p) => (
              <Card
                key={p.id}
                className={`relative flex flex-col ${
                  p.current ? "border-heat" : "border-border"
                }`}
              >
                <CardHeader className="gap-1">
                  <CardTitle className="flex items-center gap-1.5 text-base">
                    {p.name}
                    {p.id === "pro" && <Sparkles className="size-3.5 text-heat" />}
                    {p.id === "scale" && (
                      <Building2 className="size-3.5 text-muted-foreground" />
                    )}
                    {p.current && (
                      /* Badge inline: consistente com o padrão "Atual" de settings, evita corte por overflow-hidden do Card. */
                      <Badge
                        variant="outline"
                        className="ml-1 gap-1 border-heat/30 text-[11px] font-normal text-heat-text"
                      >
                        Atual
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold tracking-tight tabular">
                      {p.price}
                    </span>
                    {p.period && (
                      <span className="font-mono text-[12px] text-muted-foreground">
                        {p.period}
                      </span>
                    )}
                  </div>
                  {p.tagline && <CardDescription>{p.tagline}</CardDescription>}
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <ul className="flex-1 space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[13px]">
                        <Check
                          className={`mt-0.5 size-3.5 shrink-0 ${
                            p.current ? "text-heat" : "text-forest-text"
                          }`}
                        />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    disabled={p.current}
                    variant={p.current ? "secondary" : "outline"}
                    className="mt-5 w-full"
                    onClick={() => handlePlanCta(p)}
                  >
                    {p.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Comprar créditos ───────────────────────────────────── */}
        <TabsContent value="comprar" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {packs.map((pk) => (
              <Card
                key={pk.id}
                className={`relative flex flex-col ${
                  pk.recommended ? "border-heat" : "border-border"
                }`}
              >
                <CardHeader className="gap-1">
                  <CardTitle className="flex items-center gap-1.5 font-mono text-base tabular">
                    <Coins className="size-4 text-muted-foreground" />
                    {pk.tokens}
                    {pk.recommended && (
                      /* Badge inline consistente com "Atual"; evita corte por overflow-hidden. */
                      <Badge
                        variant="outline"
                        className="ml-1 gap-1 border-heat/30 text-[11px] font-normal text-heat-text"
                      >
                        Recomendado
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold tracking-tight tabular">
                      {pk.price}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {pk.perThousand}
                    </span>
                  </div>
                  <CardDescription>{pk.note}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <Button
                    size="sm"
                    variant={pk.recommended ? "default" : "outline"}
                    className={`w-full ${
                      pk.recommended
                        ? "bg-heat text-heat-foreground hover:bg-heat-hover"
                        : ""
                    }`}
                    onClick={() => handleBuyPack(pk)}
                  >
                    Comprar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-3 font-mono text-[11px] text-muted-foreground">
            Créditos avulsos não expiram e são consumidos após a cota do plano.
          </p>
        </TabsContent>

        {/* ── Histórico ──────────────────────────────────────────── */}
        <TabsContent value="historico" className="mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="size-4 text-muted-foreground" />
                <CardTitle className="text-base">Transações</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={handleExport}
              >
                <Download data-icon="inline-start" />
                Exportar CSV
              </Button>
            </CardHeader>
            <CardContent>
              {!USE_MOCK && (
                <p className="mb-3 rounded-md border border-border bg-muted/40 px-3 py-2 font-mono text-[11px] text-muted-foreground">
                  O backend ainda não expõe o histórico de transações (gap no
                  HANDOFF) — os itens abaixo são ilustrativos.
                </p>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                    <TableHead className="text-right">Custo (USD)</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="gap-1 border-border text-[11px] font-normal"
                        >
                          {t.positive ? (
                            <ArrowUpRight className={`size-3 ${txDot(t.type)}`} />
                          ) : (
                            <ArrowDownRight className="size-3 text-muted-foreground" />
                          )}
                          {t.type}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono tabular ${
                          t.positive ? "text-forest-text" : "text-foreground"
                        }`}
                      >
                        {t.tokens}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular text-muted-foreground">
                        {t.cost}
                      </TableCell>
                      <TableCell className="text-foreground">{t.description}</TableCell>
                      <TableCell className="text-right font-mono tabular text-muted-foreground">
                        {t.date}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
