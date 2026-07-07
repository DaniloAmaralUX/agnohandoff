"use client";

import { useEffect, useRef, useState } from "react";
import { Rocket, Wrench, Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { playgroundThread, type ChatMessage } from "@/lib/data";

/* Ações do cabeçalho do builder — Descartar/Publicar (modo mock: feedback
   otimista; em modo API o dev troca por PATCH
   /manage/projects/{project_id}/agents/{agent_id}).

   Dirty state (achado usability): as ações só ficam armadas quando há
   mudança pendente no formulário. Como no mock não há form-store, ouvimos
   inputs/textareas/selects do documento e marcamos dirty na primeira
   interação; "Descartar" e "Publicar" resetam. Em modo API isso vira o
   isDirty do react-hook-form da tela. */
export function BuilderActions({ agentName }: { agentName: string }) {
  const [publishing, setPublishing] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const onChange = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.closest("[data-preview-chat]")) return; // ignora composer da prévia
      if (t.matches("input, textarea, select, [role=switch], [role=slider]")) {
        setDirty(true);
      }
    };
    document.addEventListener("input", onChange, true);
    document.addEventListener("change", onChange, true);
    return () => {
      document.removeEventListener("input", onChange, true);
      document.removeEventListener("change", onChange, true);
    };
  }, []);

  function publish() {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setDirty(false);
      toast.success(`${agentName} publicado.`, {
        description: "As alterações já valem para as próximas conversas.",
      });
    }, 450);
  }

  function discard() {
    // Confirmação leve para evitar perda acidental (achado usability).
    if (!confirm("Descartar as alterações não publicadas?")) return;
    setDirty(false);
    toast.info("Alterações descartadas.", {
      description: "O agente voltou à última versão publicada.",
    });
  }

  return (
    <div className="flex items-center gap-2">
      {dirty && (
        <span className="hidden items-center gap-1.5 text-[12px] text-muted-foreground sm:inline-flex">
          <span className="size-1.5 rounded-full bg-heat" aria-hidden />
          Alterações não publicadas
        </span>
      )}
      <Button
        variant="outline"
        size="sm"
        disabled={!dirty}
        className="text-muted-foreground"
        onClick={discard}
      >
        Descartar
      </Button>
      <Button
        size="sm"
        disabled={publishing || !dirty}
        onClick={publish}
        className="bg-heat text-heat-foreground hover:bg-heat-hover"
      >
        <Rocket data-icon="inline-start" />
        {publishing ? "Publicando…" : dirty ? "Publicar alterações" : "Publicar"}
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
  const [typing, setTyping] = useState(false);
  const replyIndex = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    setThread((t) => [...t, { role: "user", text: trimmed }]);
    setTyping(true);
    const reply = CANNED_REPLIES[replyIndex.current++ % CANNED_REPLIES.length];
    setTimeout(() => {
      setTyping(false);
      setThread((t) => [...t, { role: "agent", text: reply }]);
      scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
    }, 900);
    setTimeout(() => scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" }), 50);
  }

  return (
    <>
      <div
        ref={scrollRef}
        data-preview-chat
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
                  ? "border border-border bg-card text-foreground" /* neutro — sem bloco laranja no corpo do chat */
                  : "bg-muted text-foreground"
              }`}
            >
              {m.tool && (
                <span className="mb-1 flex items-center gap-1 font-mono text-[10px] text-heat-text">
                  <Wrench className="size-3" />
                  {m.tool}
                </span>
              )}
              {m.text}
            </div>
          </div>
        ))}

        {/* Typing indicator — cobre a latência real do streaming LLM
            (achado usability). Reduced-motion cai para dots estáticos via
            respeito ao prefers-reduced-motion do animate-bounce do Tailwind. */}
        {typing && (
          <div className="flex justify-start" aria-live="polite" aria-label="Agente digitando">
            <div className="flex max-w-[85%] items-center gap-1 rounded-lg bg-muted px-3 py-2.5">
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.2s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.1s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60" />
            </div>
          </div>
        )}
      </div>

      <div data-preview-chat className="border-t border-border p-3">
        <form
          onSubmit={send}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-background pl-3 pr-1.5 py-1.5 text-[13px] transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50"
        >
          <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Testar uma mensagem…"
            aria-label="Testar uma mensagem"
            className="min-w-0 flex-1 bg-transparent py-1 outline-none placeholder:text-muted-foreground"
          />
          {/* Alvo clicável 32px (era ~16px) — WCAG 2.5.8 (achado accessibility). */}
          <button
            type="submit"
            aria-label="Enviar"
            disabled={!text.trim()}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-heat-text transition-[background-color,transform] hover:bg-accent active:scale-95 disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </>
  );
}
