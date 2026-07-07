"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Plug,
  Braces,
  Globe,
  Settings2,
  Upload,
  FileText,
  Trash2,
  Database,
} from "lucide-react";

import { PageHeader, PageShell } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { tools as seedTools, type Tool } from "@/lib/data";

/* ── Ícone + tint por tipo de ferramenta ────────────────────────── */
const kindMeta: Record<
  Tool["kind"],
  { icon: typeof Plug; tint: string }
> = {
  MCP: { icon: Plug, tint: "bg-bluetron/12 text-bluetron-text" },
  Python: { icon: Braces, tint: "bg-forest/12 text-forest-text" },
  HTTP: { icon: Globe, tint: "bg-amethyst/12 text-amethyst-text" },
};

/* ── Documentos indexados na base de conhecimento (mock local) ──── */
type KbDoc = {
  id: string;
  name: string;
  chunks: number;
  tokens: string;
  date: string;
};

const seedDocs: KbDoc[] = [
  { id: "kb_1", name: "protocolo-triagem.pdf", chunks: 142, tokens: "38,4k", date: "28 jun 2026" },
  { id: "kb_2", name: "convenios-cobertura.docx", chunks: 87, tokens: "21,9k", date: "24 jun 2026" },
  { id: "kb_3", name: "faq-agendamento.txt", chunks: 34, tokens: "8,7k", date: "19 jun 2026" },
  { id: "kb_4", name: "manual-recepcao-vitalmed.pdf", chunks: 203, tokens: "56,1k", date: "11 jun 2026" },
];

const kbMetrics = [
  { label: "Documentos indexados", value: "24", mono: false },
  { label: "Chunks", value: "1.842", mono: false },
  { label: "Tools RAG ativas", value: "3", mono: false },
  { label: "Modelo de embedding", value: "text-embedding-3-large", mono: true },
];

export default function ToolsPage() {
  // Estado local das ferramentas — o toggle de status vive aqui (não no mock direto).
  const [toolItems, setToolItems] = useState<Tool[]>(seedTools);
  // Estado local dos documentos — o upload e a remoção alteram esta lista.
  const [docs, setDocs] = useState<KbDoc[]>(seedDocs);
  // Progresso simulado do upload em andamento (null = ocioso).
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const uploadTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  function toggleTool(id: string) {
    setToolItems((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "Ativo" ? "Inativo" : "Ativo" }
          : t
      )
    );
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    // Permite reenviar o mesmo arquivo em seguida.
    e.target.value = "";
    if (files.length === 0) return;

    // Simula o indexador: barra de progresso até 100% e então adiciona os docs.
    if (uploadTimer.current) clearInterval(uploadTimer.current);
    setUploadProgress(0);
    uploadTimer.current = setInterval(() => {
      setUploadProgress((p) => {
        const next = (p ?? 0) + 20;
        if (next >= 100) {
          if (uploadTimer.current) clearInterval(uploadTimer.current);
          const stamp = Date.now();
          const added: KbDoc[] = files.map((file, i) => ({
            id: `kb_${stamp}_${i}`,
            name: file.name,
            chunks: Math.max(1, Math.round(file.size / 1024)),
            tokens: `${(Math.max(1, file.size / 1024 / 4) / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k`,
            date: new Date().toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          }));
          setDocs((prev) => [...added, ...prev]);
          toast.success(
            files.length > 1
              ? `${files.length} documentos adicionados.`
              : "Documento adicionado.",
            { description: "Indexado e pronto para busca semântica." }
          );
          // Esconde a barra logo após concluir.
          setTimeout(() => setUploadProgress(null), 400);
          return 100;
        }
        return next;
      });
    }, 180);
  }

  function removeDoc(id: string, name: string) {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    toast.success("Documento removido.", { description: name });
  }

  return (
    <PageShell>
      <PageHeader
        title="Ferramentas"
        subtitle="Conecte APIs, funções e bases de conhecimento aos seus agentes."
      >
        <Button
          size="sm"
          className="bg-heat text-heat-foreground hover:bg-heat-hover"
          onClick={() => toast.success("Fluxo de nova ferramenta em breve.")}
        >
          <Plus data-icon="inline-start" />
          Nova ferramenta
        </Button>
      </PageHeader>

      <Tabs defaultValue="ferramentas" className="mt-6">
        <TabsList>
          <TabsTrigger value="ferramentas">Ferramentas</TabsTrigger>
          <TabsTrigger value="kb">Knowledge Base</TabsTrigger>
        </TabsList>

        {/* ── ABA: Ferramentas ─────────────────────────────────────── */}
        <TabsContent value="ferramentas" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {toolItems.map((t) => {
              const meta = kindMeta[t.kind];
              const Icon = meta.icon;
              const active = t.status === "Ativo";
              return (
                <Card key={t.id} className="gap-0 py-0">
                  <CardContent className="flex h-full flex-col gap-3 p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-md ${meta.tint}`}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">{t.name}</p>
                          <Badge
                            variant="outline"
                            className="border-border font-mono text-[10px] font-normal"
                          >
                            {t.kind}
                          </Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-muted-foreground">
                          {t.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={active}
                          onCheckedChange={() => toggleTool(t.id)}
                          aria-label={`Ativar ${t.name}`}
                        />
                        <span className="text-[12px] text-muted-foreground">
                          {active ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={() =>
                          toast.success(`Configuração de ${t.name} salva.`)
                        }
                      >
                        <Settings2 data-icon="inline-start" />
                        Configurar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── ABA: Knowledge Base ──────────────────────────────────── */}
        <TabsContent value="kb" className="mt-4 space-y-3">
          {/* Zona de upload */}
          <label
            htmlFor="kb-upload"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center transition-colors hover:border-heat/50 hover:bg-accent"
          >
            <div className="flex size-11 items-center justify-center rounded-md heat-tint">
              <Upload className="size-5" />
            </div>
            <p className="text-sm font-medium">
              Arraste PDFs, DOCX, TXT ou clique para enviar
            </p>
            <p className="text-[12px] text-muted-foreground">
              Os documentos são divididos em chunks e indexados para busca semântica.
            </p>
            {uploadProgress !== null && (
              <div className="mt-2 w-full max-w-xs">
                <Progress value={uploadProgress} className="h-1.5" />
                <p className="mt-1.5 font-mono text-[11px] tabular text-muted-foreground">
                  Indexando… {uploadProgress}%
                </p>
              </div>
            )}
            <input
              id="kb-upload"
              type="file"
              multiple
              className="sr-only"
              onChange={handleUpload}
            />
          </label>

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {kbMetrics.map((m) => (
              <Card key={m.label} className="gap-0 py-4">
                <CardContent className="px-4">
                  <p className="text-[13px] text-muted-foreground">{m.label}</p>
                  <p
                    className={`mt-2 truncate text-lg font-semibold tracking-tight ${
                      m.mono ? "font-mono text-sm" : "text-2xl tabular"
                    }`}
                  >
                    {m.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Documentos indexados */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="size-4 text-muted-foreground" />
                <CardTitle className="text-base">Documentos indexados</CardTitle>
              </div>
              <Badge
                variant="outline"
                className="border-border font-normal tabular text-[11px] text-muted-foreground"
              >
                {docs.length} arquivos
              </Badge>
            </CardHeader>
            <CardContent className="space-y-1">
              {docs.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                    <FileText className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-[13px] font-medium">
                      {d.name}
                    </p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      <span className="tabular">{d.chunks}</span> chunks ·{" "}
                      <span className="font-mono tabular">{d.tokens}</span> tokens
                    </p>
                  </div>
                  <span className="hidden whitespace-nowrap font-mono text-[11px] text-muted-foreground sm:block">
                    {d.date}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-crimson"
                    aria-label={`Remover ${d.name}`}
                    onClick={() => removeDoc(d.id, d.name)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
