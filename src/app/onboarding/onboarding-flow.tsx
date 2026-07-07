"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check, Copy, KeyRound } from "lucide-react";
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
import { USE_MOCK } from "@/lib/config";
import { useRegister, type RegisteredView } from "@/lib/api/register";
import { cn } from "@/lib/utils";

type Draft = {
  orgName: string;
  slug: string;
  email: string;
  password: string;
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
  password: "",
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
  // Cadastro concluído (modo API): guarda o retorno p/ exibir a key UMA vez.
  const [created, setCreated] = useState<RegisteredView | null>(null);
  const register = useRegister();
  const total = onboardingSteps.length;
  const current = onboardingSteps[step - 1];

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  // Validação mínima por passo. Em modo API o passo 1 vira o cadastro real —
  // e-mail e senha seguem os mínimos do backend (5 e 8 caracteres).
  function validate(): boolean {
    if (step === 1) {
      if (draft.orgName.trim().length < 2) {
        setError("Informe o nome da organização (mín. 2 caracteres).");
        return false;
      }
      if (!USE_MOCK && draft.email.trim().length < 5) {
        setError("Informe um e-mail válido.");
        return false;
      }
      if (!USE_MOCK && draft.password.length < 8) {
        setError("A senha precisa de ao menos 8 caracteres.");
        return false;
      }
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
    if (USE_MOCK) {
      toast.success("Tudo pronto!", {
        description: "Sua organização foi criada. Bem-vindo à AgnoHub.",
      });
      router.push("/dashboard");
      return;
    }
    register.mutate(
      {
        name: draft.orgName.trim(),
        email: draft.email.trim(),
        password: draft.password,
        orgName: draft.orgName.trim(),
      },
      {
        onSuccess: (result) => setCreated(result),
        onError: (err) => {
          const conflict =
            err instanceof Error && "status" in err && (err as { status: number }).status === 409;
          toast.error(
            conflict
              ? "Este e-mail já tem uma organização — faça login."
              : "Não foi possível criar a organização. Tente de novo.",
          );
          setStep(1);
        },
      },
    );
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  // ── Sucesso (modo API): a chave aparece UMA única vez ──────────────────
  if (created) {
    return (
      <div className="mx-auto mt-16 max-w-[560px]">
        <div className="animate-rise overflow-hidden rounded-xl border border-border bg-card shadow-[0_24px_80px_-32px_rgba(0,0,0,0.22)]">
          <div className="border-b border-border px-6 pb-5 pt-6">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-md heat-tint">
                <KeyRound className="size-4 text-heat" />
              </span>
              <h1 className="text-xl font-semibold tracking-tight">
                {created.orgName} está no ar
              </h1>
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              Guarde sua API key — ela é exibida{" "}
              <span className="font-medium text-foreground">só esta vez</span>. Você
              já está autenticado neste navegador.
            </p>
          </div>
          <div className="px-6 py-6">
            <div className="flex flex-col gap-2 rounded-md border border-heat/40 bg-heat/5 p-3 sm:flex-row sm:items-center sm:justify-between">
              <code className="min-w-0 truncate font-mono text-[13px] tabular text-foreground">
                {created.apiKey}
              </code>
              <Button
                size="sm"
                className="h-8 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  navigator.clipboard?.writeText(created.apiKey).catch(() => {});
                  toast.success("Chave copiada.");
                }}
              >
                <Copy data-icon="inline-start" />
                Copiar
              </Button>
            </div>
            <p className="mt-3 text-[12px] text-muted-foreground">
              Plano <span className="font-medium text-foreground">{created.plan}</span> ·
              org <span className="font-mono">{created.orgId.slice(0, 8)}</span>
            </p>
          </div>
          <div className="flex justify-end border-t border-border bg-muted/30 px-6 py-4">
            <Button size="sm" className="h-11 sm:h-8" onClick={() => router.push("/dashboard")}>
              Ir para o dashboard
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </div>
    );
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
                {/* Senha só no produto real — o backend exige no /auth/register. */}
                {!USE_MOCK && (
                  <Field>
                    <FieldLabel htmlFor="admin-password">Senha</FieldLabel>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                      value={draft.password}
                      onChange={(e) => set({ password: e.target.value })}
                    />
                    <FieldDescription>
                      Usada para acessar o painel da organização.
                    </FieldDescription>
                  </Field>
                )}
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
            disabled={register.isPending}
            className="h-11 sm:h-8"
          >
            {register.isPending
              ? "Criando organização…"
              : step < total
                ? "Continuar"
                : USE_MOCK
                  ? "Ir para o dashboard"
                  : "Criar organização"}
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
