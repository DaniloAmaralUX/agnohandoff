"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { onboardingSteps } from "@/lib/data";
import { cn } from "@/lib/utils";

type Draft = {
  orgName: string;
  slug: string;
  email: string;
  workspace: string;
  agentName: string;
  agentRole: string;
  channel: string;
};

// Rótulos curtos p/ o stepper — informação de wayfinding real (achado: 'Passo N' redundante)
const stepLabels = ["Organização", "Workspace", "Agente", "Canal"];

const emptyDraft: Draft = {
  orgName: "",
  slug: "",
  email: "",
  workspace: "",
  agentName: "",
  agentRole: "",
  channel: "WhatsApp",
};

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const total = onboardingSteps.length;
  const current = onboardingSteps[step - 1];

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  // Validação mínima por passo (mock): só o passo 1 exige o nome da org.
  function validate(): boolean {
    if (step === 1 && draft.orgName.trim().length < 2) {
      setError("Informe o nome da organização (mín. 2 caracteres).");
      return false;
    }
    setError(null);
    return true;
  }

  function next() {
    if (!validate()) return;
    if (step < total) {
      setStep((s) => s + 1);
      return;
    }
    toast.success("Tudo pronto!", {
      description: "Sua organização foi criada. Bem-vindo à AgnoHub.",
    });
    router.push("/dashboard");
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  return (
    <div className="mx-auto mt-16 max-w-[560px]">
      {/* Stepper */}
      <ol className="flex items-center">
        {onboardingSteps.map((s, i) => {
          const done = s.n < step;
          const active = s.n === step;
          const last = i === total - 1;
          return (
            <li key={s.n} className={cn("flex items-center", !last && "flex-1")}>
              <div className="flex flex-col items-center gap-2">
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border text-[13px] font-semibold transition-colors duration-200 ease-enter",
                    active &&
                      "border-heat bg-heat text-heat-foreground shadow-[0_0_0_4px_var(--heat-tint,rgba(250,93,25,0.12))]",
                    // text 13px em heat vivo reprova AA no light — heat-text (achado)
                    done && "border-heat/30 bg-heat/10 text-heat-text",
                    !active && !done && "border-border bg-card text-muted-foreground"
                  )}
                >
                  {done ? <Check className="size-4" /> : s.n}
                </span>
                <span
                  className={cn(
                    "hidden text-[11px] font-medium sm:block",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {stepLabels[i]}
                </span>
              </div>
              {!last && (
                <span
                  className={cn(
                    "mx-2 -mt-6 h-px flex-1 transition-colors duration-200 ease",
                    done ? "bg-heat/40" : "bg-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Card */}
      <div className="mt-10 overflow-hidden rounded-xl border border-border bg-card shadow-[0_24px_80px_-32px_rgba(0,0,0,0.22)]">
        {/* Removido eyebrow 'Passo N de M' — stepper acima já é a fonte de wayfinding (achado: mesma info 3x) */}
        <div className="border-b border-border px-6 pb-5 pt-6">
          <h1 className="text-xl font-semibold tracking-tight">
            {current.title}
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            {current.desc}
          </p>
        </div>

        {/* Formulário por passo */}
        <div className="animate-rise px-6 py-6" key={step}>
          <FieldGroup>
            {step === 1 && (
              <>
                <Field data-invalid={!!error}>
                  <FieldLabel htmlFor="org-name">Nome da organização</FieldLabel>
                  <Input
                    id="org-name"
                    placeholder="Vitalmed"
                    autoComplete="organization"
                    aria-invalid={!!error}
                    value={draft.orgName}
                    onChange={(e) => set({ orgName: e.target.value })}
                  />
                  <FieldError>{error}</FieldError>
                </Field>
                <Field>
                  <FieldLabel htmlFor="org-slug">Slug</FieldLabel>
                  {/* h-11 no mobile p/ 44px de toque (achado: inputs 32px em contexto touch) */}
                  <div className="flex h-11 w-full items-center rounded-lg border border-input bg-transparent transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 sm:h-8">
                    <span className="pl-2.5 pr-0.5 font-mono text-[13px] text-muted-foreground">
                      agnohub.ai/
                    </span>
                    <input
                      id="org-slug"
                      placeholder="vitalmed"
                      value={draft.slug}
                      onChange={(e) => set({ slug: e.target.value })}
                      className="h-full w-full min-w-0 rounded-r-lg bg-transparent pr-2.5 font-mono text-[13px] outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <FieldDescription>
                    Identificador único da sua organização na URL.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="admin-email">E-mail do admin</FieldLabel>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="voce@empresa.com.br"
                    autoComplete="email"
                    value={draft.email}
                    onChange={(e) => set({ email: e.target.value })}
                  />
                  <FieldDescription>
                    Este será o dono da organização e receberá os convites.
                  </FieldDescription>
                </Field>
              </>
            )}

            {step === 2 && (
              <Field>
                <FieldLabel htmlFor="ob-workspace">Nome do workspace</FieldLabel>
                <Input
                  id="ob-workspace"
                  placeholder="Atendimento Clínico"
                  value={draft.workspace}
                  onChange={(e) => set({ workspace: e.target.value })}
                />
                <FieldDescription>
                  Agrupe projetos por área de negócio. Você pode criar outros depois.
                </FieldDescription>
              </Field>
            )}

            {step === 3 && (
              <>
                <Field>
                  <FieldLabel htmlFor="ob-agent">Nome do agente</FieldLabel>
                  <Input
                    id="ob-agent"
                    placeholder="Sofia"
                    value={draft.agentName}
                    onChange={(e) => set({ agentName: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="ob-role">Função</FieldLabel>
                  <Input
                    id="ob-role"
                    placeholder="Triagem e agendamento"
                    value={draft.agentRole}
                    onChange={(e) => set({ agentRole: e.target.value })}
                  />
                  <FieldDescription>
                    Você define instruções e modelo em detalhe no builder.
                  </FieldDescription>
                </Field>
              </>
            )}

            {step === 4 && (
              <Field>
                <FieldLabel htmlFor="ob-channel">Canal</FieldLabel>
                <Select
                  value={draft.channel}
                  onValueChange={(v) => set({ channel: v })}
                >
                  <SelectTrigger id="ob-channel" className="w-full">
                    <SelectValue placeholder="Escolha um canal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Site">Site / Widget</SelectItem>
                    <SelectItem value="Telegram">Telegram</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Conecte um canal para colocar seu agente no ar.
                </FieldDescription>
              </Field>
            )}
          </FieldGroup>
        </div>

        {/* Rodapé — removido 'Já tenho conta' duplicado (header já tem 'Entrar'); step1 sem back = espaço à esquerda vazio (achado: rótulos divergentes p/ mesma ação) */}
        <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-6 py-4">
          {step > 1 ? (
            <Button variant="ghost" size="sm" onClick={back} className="text-muted-foreground">
              <ArrowLeft data-icon="inline-start" />
              Voltar
            </Button>
          ) : (
            <span />
          )}
          {/* Bump p/ 44px em mobile (achado: primária 28px vs. 44px de toque); usa --primary p/ AA */}
          <Button
            size="sm"
            onClick={next}
            className="h-11 sm:h-8"
          >
            {step < total ? "Continuar" : "Ir para o dashboard"}
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </div>

      {/* Sem sublinhado — não prometer link em item inerte (achado: sublinhado morto) */}
      <p className="mt-6 text-center text-[12px] text-muted-foreground">
        Ao continuar, você concorda com os{" "}
        <span className="text-foreground/80">Termos</span> e a{" "}
        <span className="text-foreground/80">Política de Privacidade</span>.
      </p>
    </div>
  );
}
