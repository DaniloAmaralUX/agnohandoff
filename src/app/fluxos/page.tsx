import Link from "next/link";
import { ArrowUpRight, Target, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "AgnoHub — Fluxos de teste do protótipo",
};

type Persona = "cliente" | "builder" | "operador" | "admin" | "plataforma";
type Step = { s: string; a: string; r: string };
type Flow = { n: number; name: string; persona: Persona; goal: string; steps: Step[] };

const personaLabel: Record<Persona, string> = {
  cliente: "Novo cliente",
  builder: "Builder",
  operador: "Operador",
  admin: "Admin",
  plataforma: "Plataforma",
};
const personaClass: Record<Persona, string> = {
  cliente: "bg-heat/12 text-heat",
  builder: "bg-bluetron/12 text-bluetron-text",
  operador: "bg-forest/15 text-forest-text",
  admin: "bg-amethyst/14 text-amethyst-text",
  plataforma: "bg-secondary text-foreground",
};

const FLOWS: Flow[] = [
  { n: 1, name: "Onboarding do novo cliente", persona: "cliente", goal: "Conhecer o produto, criar a organização e entrar no painel.", steps: [
    { s: "Landing", a: "Conhece a proposta e clica em ‘Criar conta’.", r: "/" },
    { s: "Onboarding", a: "Cria a organização em 4 passos (org → workspace → agente → canal).", r: "/onboarding" },
    { s: "Dashboard", a: "Cai na visão geral do workspace.", r: "/dashboard" },
  ]},
  { n: 2, name: "Criar e publicar um agente", persona: "builder", goal: "Montar um agente conversacional e colocá-lo no ar.", steps: [
    { s: "Dashboard", a: "Clica em ‘Novo agente’.", r: "/dashboard" },
    { s: "Agentes", a: "Vê a lista e abre um agente.", r: "/agents" },
    { s: "Agent Builder", a: "Configura instruções, modelo, ferramentas, memória e canais → Publicar.", r: "/agents/sofia" },
    { s: "Playground", a: "Testa o agente no chat em tempo real.", r: "/playground" },
    { s: "Deploy", a: "Publica na VM do cliente, Cloud Run ou exporta.", r: "/deploy" },
  ]},
  { n: 3, name: "Conectar canais de atendimento", persona: "builder", goal: "Ligar o agente ao WhatsApp e outros canais.", steps: [
    { s: "Dashboard", a: "Vai para Canais.", r: "/dashboard" },
    { s: "Canais", a: "Adiciona e conecta WhatsApp, Widget, Telegram.", r: "/channels" },
    { s: "Agent Builder", a: "Na aba Canais, vincula os canais ao agente.", r: "/agents/sofia" },
  ]},
  { n: 4, name: "Ampliar com ferramentas externas (MCP)", persona: "builder", goal: "Dar ao agente acesso a CRM, agenda e APIs internas.", steps: [
    { s: "Ferramentas", a: "Vê as tools disponíveis (MCP/Python/HTTP).", r: "/tools" },
    { s: "MCP Registry", a: "Registra um servidor MCP externo (auth, status, tools).", r: "/mcp" },
    { s: "Agent Builder", a: "Na aba Ferramentas, ativa a tool no agente.", r: "/agents/sofia" },
  ]},
  { n: 5, name: "Atender e resolver conversas", persona: "operador", goal: "Acompanhar o atendimento omnichannel e resolver.", steps: [
    { s: "Dashboard", a: "Vê as conversas recentes.", r: "/dashboard" },
    { s: "Conversas", a: "Abre a inbox unificada, entra numa thread.", r: "/conversations" },
    { s: "Conversas", a: "Assume a conversa e marca como resolvida.", r: "/conversations" },
  ]},
  { n: 6, name: "Configurar a memória do agente", persona: "builder", goal: "Memória persistente e gestão de contexto por projeto.", steps: [
    { s: "Agent Builder", a: "Na aba Memória, liga a memória persistente.", r: "/agents/sofia" },
    { s: "Memória", a: "Define estratégia (buffer/resumo/vetorial), janela e retenção.", r: "/memory" },
  ]},
  { n: 7, name: "Regras avançadas no Studio", persona: "builder", goal: "Criar regras de payload/voz em linguagem natural.", steps: [
    { s: "Studio", a: "Descreve a regra em português → vê o preview → gera a regra.", r: "/studio" },
  ]},
  { n: 8, name: "Acompanhar performance e custos", persona: "admin", goal: "Ver consumo, latência, top agentes e o plano.", steps: [
    { s: "Dashboard", a: "Visão geral de conversas e tokens.", r: "/dashboard" },
    { s: "Analytics", a: "Métricas, distribuição por canal e top agentes.", r: "/analytics" },
    { s: "Faturamento", a: "Créditos, uso do plano e histórico.", r: "/billing" },
  ]},
  { n: 9, name: "Organizar a conta", persona: "admin", goal: "Estruturar workspaces, projetos e configurações.", steps: [
    { s: "Workspaces", a: "Organiza por área de negócio.", r: "/workspaces" },
    { s: "Projetos", a: "Cria e gerencia os projetos da organização.", r: "/projects" },
    { s: "Configurações", a: "BYOK, plano, observabilidade e dados da org.", r: "/settings" },
    { s: "Integrações", a: "Conecta GitHub, Slack e outros.", r: "/integrations" },
  ]},
  { n: 10, name: "Operar a plataforma (Super Admin)", persona: "plataforma", goal: "Visão macro da plataforma para o operador.", steps: [
    { s: "Super Admin", a: "Organizações, planos, assentos, tokens e MRR.", r: "/super-admin" },
  ]},
];

export default function FluxosPage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-[1120px] items-center gap-3 px-5">
          <div className="flex size-7 items-center justify-center rounded-md bg-heat text-heat-foreground">
            <span className="text-sm font-bold leading-none">A</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight">AgnoHub</span>
          <Badge variant="outline" className="border-border font-mono text-[10px] font-normal text-muted-foreground">
            Fluxos de teste
          </Badge>
          <Button asChild size="sm" className="ml-auto bg-heat text-heat-foreground hover:bg-heat-hover">
            <Link href="/dashboard">
              Abrir o produto
              <ArrowUpRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-[1120px] px-5">
        {/* Hero */}
        <section className="py-10">
          <span className="font-mono text-[11px] uppercase tracking-wide text-heat">
            Roteiro de teste · protótipo navegável
          </span>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.03em]">
            Fluxos dos usuários testando o protótipo
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            Cada fluxo é um caminho real pelo produto.{" "}
            <strong className="font-medium text-foreground">Clique em qualquer passo</strong> para abrir a
            tela no protótipo e seguir a jornada, como um usuário faria.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
            <User className="size-3.5" />
            <span>Personas:</span>
            {(Object.keys(personaLabel) as Persona[]).map((p) => (
              <span
                key={p}
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase ${personaClass[p]}`}
              >
                {personaLabel[p]}
              </span>
            ))}
          </div>
        </section>

        {/* Flows */}
        <div className="space-y-4 pb-4">
          {FLOWS.map((f) => (
            <div key={f.n} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span className="font-mono text-[12px] font-bold text-heat">
                  Fluxo {String(f.n).padStart(2, "0")}
                </span>
                <h3 className="text-[17px] font-semibold tracking-tight">{f.name}</h3>
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase ${personaClass[f.persona]}`}
                >
                  {personaLabel[f.persona]}
                </span>
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <Target className="size-3.5 text-heat" />
                {f.goal}
              </p>

              <div className="mt-4 flex items-stretch gap-0 overflow-x-auto pb-1.5">
                {f.steps.map((st, i) => (
                  <div key={i} className="flex items-stretch">
                    {i > 0 && (
                      <div className="flex shrink-0 items-center px-2 text-border">→</div>
                    )}
                    <a
                      href={st.r}
                      target="_blank"
                      rel="noopener"
                      className="group relative w-52 shrink-0 rounded-lg border border-border bg-background p-3 transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-heat hover:shadow-sm"
                    >
                      <span className="absolute right-2.5 top-2.5 font-mono text-[10px] text-muted-foreground transition-colors group-hover:text-heat">
                        abrir ↗
                      </span>
                      <div className="flex size-5 items-center justify-center rounded-md bg-heat font-mono text-[11px] font-bold text-heat-foreground">
                        {i + 1}
                      </div>
                      <div className="mt-2 text-[13.5px] font-semibold">{st.s}</div>
                      <div className="mt-1 min-h-[34px] text-[12px] text-muted-foreground">
                        {st.a}
                      </div>
                      <span className="mt-2 inline-block rounded bg-heat/[0.09] px-1.5 py-0.5 font-mono text-[10.5px] text-heat">
                        {st.r}
                      </span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="border-t border-border py-8 text-[12px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex size-5 items-center justify-center rounded bg-heat text-heat-foreground">
              <span className="text-[11px] font-bold leading-none">A</span>
            </div>
            <span className="font-medium text-foreground">AgnoHub</span>
            <span>· Roteiro de fluxos de teste · protótipo de design</span>
          </div>
          <p className="mt-2 max-w-2xl">
            O protótipo é uma maquete navegável: mostra <strong className="font-medium text-foreground">onde</strong> se
            faz cada coisa. Quem <strong className="font-medium text-foreground">executa</strong> é o produto (Streamlit).
          </p>
        </footer>
      </div>
    </div>
  );
}
