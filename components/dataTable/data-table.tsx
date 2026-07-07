"use client";

import * as React from "react";
import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  ColumnFiltersState,
  RowSelectionState,
  
} from "@tanstack/react-table";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DataTableProps } from "@/types/ui";
import { RowWithId } from "@/types/common";

export function DataTable<TData extends RowWithId, TValue>({
  columns,
  data,
  isLoading,
  onSelectionChange,
  batchActions,
  pagination,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination ? undefined : getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    manualPagination: !!pagination,
    state: {
      columnFilters,
      rowSelection,
    },
  });

  // Number of loading rows to show
  const loadingRowCount = 5;

  // Update parent component when selection changes
  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table.getSelectedRowModel().rows;
      const selectedIds = selectedRows.map((row) => String(row.original.id));
      onSelectionChange(selectedIds);
    }
  }, [rowSelection, onSelectionChange, table]);

  return (
    <div className="rounded-md border relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/70 z-20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
            <p className="text-sm text-muted-foreground">Loading data...</p>
          </div>
        </div>
      )}

      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-10 p-4 border-b flex flex-wrap justify-between items-end gap-4">
        {/* Left - Search Filters */}
        <div className="flex flex-wrap items-end gap-4">
          {table
            .getAllColumns()
            .filter((col) => col.columnDef.meta?.search)
            .map((col) => (
              <Input
                key={col.id}
                placeholder={`Search ${col.id}...`}
                value={(col.getFilterValue() as string) ?? ""}
                onChange={(event) => col.setFilterValue(event.target.value)}
                className="max-w-sm"
                disabled={isLoading}
              />
            ))}
          {batchActions}
        </div>

        {/* Right - Date Filters */}
        <div className="flex flex-wrap items-end gap-4">
          {table
            .getAllColumns()
            .filter((col) => col.columnDef.meta?.calendar)
            .map((col) => {
              const filterValue = col.getFilterValue() as string | undefined;

              return (
                <Popover key={col.id}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[200px] justify-start text-left font-normal"
                      disabled={isLoading}
                    >
                      {(() => {
                        const date = filterValue
                          ? new Date(filterValue)
                          : null;
                        return date && !isNaN(date.getTime())
                          ? format(date, "PPP")
                          : `Filter ${col.id}`;
                      })()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        filterValue ? new Date(filterValue) : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          const dateStr = format(date, "yyyy-MM-dd");
                          col.setFilterValue(dateStr);
                        } else {
                          col.setFilterValue(undefined);
                        }
                      }}
                      initialFocus
                    />
                    <div className="flex justify-end px-2 py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => col.setFilterValue(undefined)}
                      >
                        Reset
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              );
            })}
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Simple loading rows with animated background
            Array.from({ length: loadingRowCount }).map((_, index) => (
              <TableRow key={`loading-${index}`}>
                {table.getAllColumns().map((column) => (
                  <TableCell key={`loading-cell-${column.id}-${index}`}>
                    <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between space-x-2 py-4 px-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
              {pagination.totalCount} results
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <select
                value={pagination.limit}
                onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
                className="h-8 w-[70px] rounded border border-input bg-background px-3 py-1 text-sm"
                disabled={isLoading}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(1)}
                disabled={!pagination.hasPreviousPage || isLoading}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={!pagination.hasPreviousPage || isLoading}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage || isLoading}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.totalPages)}
                disabled={!pagination.hasNextPage || isLoading}
              >
                Last
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}