"use client";

import { useRef, useState } from "react";
import { Rocket, Wrench, Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { playgroundThread, type ChatMessage } from "@/lib/data";

/* Ações do cabeçalho do builder — Descartar/Publicar (modo mock: feedback
   otimista; em modo API o dev troca por PATCH
   /manage/projects/{project_id}/agents/{agent_id}). */
export function BuilderActions({ agentName }: { agentName: string }) {
  const [publishing, setPublishing] = useState(false);

  function publish() {
    setPublishing(true);
    // Simula a latência do PATCH; o toast confirma o fluxo.
    setTimeout(() => {
      setPublishing(false);
      toast.success(`${agentName} publicado.`, {
        description: "As alterações já valem para as próximas conversas.",
      });
    }, 450);
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="text-muted-foreground"
        onClick={() =>
          toast.info("Alterações descartadas.", {
            description: "O agente voltou à última versão publicada.",
          })
        }
      >
        Descartar
      </Button>
      <Button
        size="sm"
        disabled={publishing}
        onClick={publish}
        className="bg-heat text-heat-foreground hover:bg-heat-hover"
      >
        <Rocket data-icon="inline-start" />
        {publishing ? "Publicando…" : "Publicar"}
      </Button>
    </div>
  );
}

/* Resposta simulada da prévia (mock) — ecoa o comportamento do agente. */
const CANNED_REPLIES = [
  "Claro! Posso verificar a agenda para você. Prefere manhã ou tarde?",
  "Entendi. Vou registrar isso no seu histórico e um especialista confirma em instantes.",
  "Perfeito, consulta confirmada. Você recebe o lembrete um dia antes. 😊",
];

/* Prévia ao vivo — chat funcional no mock: o composer envia de verdade e o
   agente responde (resposta simulada). Thread local, sem persistência. */
export function PreviewChat() {
  const [thread, setThread] = useState<ChatMessage[]>(() =>
    playgroundThread.slice(0, 5),
  );
  const [text, setText] = useState("");
  const replyIndex = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    setThread((t) => [...t, { role: "user", text: trimmed }]);
    const reply = CANNED_REPLIES[replyIndex.current++ % CANNED_REPLIES.length];
    setTimeout(() => {
      setThread((t) => [...t, { role: "agent", text: reply }]);
      scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
    }, 600);
    setTimeout(() => scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" }), 50);
  }

  return (
    <>
      <div
        ref={scrollRef}
        className="flex max-h-[380px] flex-col gap-3 overflow-y-auto px-4 py-4"
      >
        {thread.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-relaxed ${
                m.role === "user"
                  ? "bg-heat text-heat-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {m.tool && (
                <span className="mb-1 flex items-center gap-1 font-mono text-[10px] text-heat">
                  <Wrench className="size-3" />
                  {m.tool}
                </span>
              )}
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border p-3">
        <form
          onSubmit={send}
          className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-[13px] transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50"
        >
          <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Testar uma mensagem…"
            aria-label="Testar uma mensagem"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            aria-label="Enviar"
            className="shrink-0 rounded-sm text-heat-text transition-transform active:scale-95"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </>
  );
}
