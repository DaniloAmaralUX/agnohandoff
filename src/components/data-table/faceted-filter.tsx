"use client";

/* Portado/adaptado de satnaing/shadcn-admin (MIT) — ver index.ts.
   Adaptação: usa DropdownMenu (checkbox items) no lugar de Popover+Command,
   pois o kit do AgnoHub não inclui esses primitivos — mesmo comportamento. */
import { ListFilter } from "lucide-react";
import { type Column } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DataTableFacetedFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>;
  title: string;
  options: { label: string; value: string }[];
};

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const selected = new Set((column?.getFilterValue() as string[]) ?? []);

  function toggle(value: string) {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    column?.setFilterValue(next.size ? Array.from(next) : undefined);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed">
          <ListFilter data-icon="inline-start" />
          {title}
          {selected.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1.5 font-mono text-[11px] font-normal"
              >
                {selected.size}
              </Badge>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selected.has(option.value)}
            onCheckedChange={() => toggle(option.value)}
            // Mantém o menu aberto p/ seleção múltipla
            onSelect={(e) => e.preventDefault()}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        {selected.size > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => column?.setFilterValue(undefined)}
              className="justify-center text-[13px] text-muted-foreground"
            >
              Limpar filtros
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
