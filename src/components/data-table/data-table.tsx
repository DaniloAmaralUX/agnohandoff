"use client";

/* Portado/adaptado de satnaing/shadcn-admin (MIT) — ver index.ts.
   Wrapper de alto nível: entrega sort + busca + filtros facetados + colunas
   ocultáveis + paginação com uma prop `columns` + `data`. As telas de lista
   usam este componente para terem comportamento idêntico. */
import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./pagination";
import { DataTableToolbar } from "./toolbar";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchColumn?: string;
  searchPlaceholder?: string;
  /** Slots de filtro facetado — recebem a `table` via render prop. */
  filters?: (table: ReturnType<typeof useReactTable<TData>>) => React.ReactNode;
  columnLabels?: Record<string, string>;
  /** Oculta toolbar/paginação p/ listas curtas. */
  showToolbar?: boolean;
  showPagination?: boolean;
  emptyMessage?: string;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumn,
  searchPlaceholder,
  filters,
  columnLabels,
  showToolbar = true,
  showPagination = true,
  emptyMessage = "Nenhum resultado.",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="flex flex-col gap-3">
      {showToolbar && (
        <DataTableToolbar
          table={table}
          searchColumn={searchColumn}
          searchPlaceholder={searchPlaceholder}
          columnLabels={columnLabels}
        >
          {filters?.(table)}
        </DataTableToolbar>
      )}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && <DataTablePagination table={table} />}
    </div>
  );
}
