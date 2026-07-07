"use client";

import * as React from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";

type FormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Botão que abre o sheet (envolvido em SheetTrigger). */
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  submitLabel?: string;
  submitting?: boolean;
  /** Handler do form — tipicamente `form.handleSubmit(fn)` do react-hook-form. */
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  children: React.ReactNode;
};

/* Sheet de formulário reutilizável — o "padrão de ação" do AgnoHub.
   Entrega o chrome padrão (header, corpo rolável, footer Cancelar/Salvar) para
   qualquer CTA que abra um form. O conteúdo é o form do chamador (react-hook-form);
   o chamador fecha via `onOpenChange(false)` no sucesso do submit. Mantém todas as
   telas com o mesmo comportamento de criação/edição. */
export function FormSheet({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  submitLabel = "Salvar",
  submitting,
  onSubmit,
  children,
}: FormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger ? <SheetTrigger asChild>{trigger}</SheetTrigger> : null}
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <FieldGroup>{children}</FieldGroup>
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t border-border">
            <SheetClose asChild>
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            </SheetClose>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando…" : submitLabel}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
