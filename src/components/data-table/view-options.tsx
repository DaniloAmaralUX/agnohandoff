"use client";

/* Portado/adaptado de satnaing/shadcn-admin (MIT) — ver index.ts. */
import { Settings2 } from "lucide-react";
import { type Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DataTableViewOptions<TData>({
  table,
  columnLabels = {},
}: {
  table: Table<TData>;
  /** Rótulos pt-BR por id de coluna (fallback: o próprio id). */
  columnLabels?: Record<string, string>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto hidden lg:flex">
          <Settings2 data-icon="inline-start" />
          Colunas
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Exibir colunas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((c) => typeof c.accessorFn !== "undefined" && c.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
              onSelect={(e) => e.preventDefault()}
            >
              {columnLabels[column.id] ?? column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
