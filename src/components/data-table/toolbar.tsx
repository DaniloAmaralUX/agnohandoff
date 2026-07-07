"use client";

/* Portado/adaptado de satnaing/shadcn-admin (MIT) — ver index.ts. */
import { X } from "lucide-react";
import { type Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./view-options";

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  /** Coluna usada pela busca de texto (ex.: "name"). */
  searchColumn?: string;
  searchPlaceholder?: string;
  /** Slots de filtro (ex.: <DataTableFacetedFilter …/>). */
  children?: React.ReactNode;
  columnLabels?: Record<string, string>;
};

export function DataTableToolbar<TData>({
  table,
  searchColumn,
  searchPlaceholder = "Buscar…",
  children,
  columnLabels,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const search = searchColumn ? table.getColumn(searchColumn) : undefined;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {search && (
        <Input
          value={(search.getFilterValue() as string) ?? ""}
          onChange={(e) => search.setFilterValue(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="h-8 w-[180px] lg:w-[240px]"
        />
      )}
      {children}
      {isFiltered && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => table.resetColumnFilters()}
        >
          Limpar
          <X data-icon="inline-end" />
        </Button>
      )}
      <DataTableViewOptions table={table} columnLabels={columnLabels} />
    </div>
  );
}
