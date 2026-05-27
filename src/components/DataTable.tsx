import {
  type Table as TanStackTable,
  flexRender,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../lib/cn'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'

export interface DataTableClassNames {
  root?: string
  table?: string
  header?: string
  headerRow?: string
  head?: string
  body?: string
  row?: string
  cell?: string
  empty?: string
  loading?: string
}

export interface DataTableProps<TData> {
  table: TanStackTable<TData>
  /** Loading flag from `useDataTable`. */
  loading?: boolean
  /** Slot rendered inside the empty <tbody> when there are no rows. */
  emptyMessage?: ReactNode
  /** Slot rendered inside the loading <tbody>. */
  loadingMessage?: ReactNode
  /** Class for the outer wrapper. */
  className?: string
  /** Fine-grained class names for table parts. */
  classNames?: DataTableClassNames
  /** Called when a row is clicked. */
  onRowClick?: (row: TData) => void
}

/**
 * Shadcn-styled table component wired to a TanStack `Table` instance.
 * Renders header (with sort indicators), body, empty state, and loading state.
 *
 * @example
 * const { table, loading } = useDataTable<User>({ ... })
 * <DataTable table={table} loading={loading} />
 */
export function DataTable<TData>(props: DataTableProps<TData>) {
  const {
    table,
    loading = false,
    emptyMessage = 'No results.',
    loadingMessage = 'Loading...',
    className,
    classNames,
    onRowClick,
  } = props

  const columnCount = table.getAllColumns().length
  const rows = table.getRowModel().rows

  return (
    <div className={cn('rounded-md border', className, classNames?.root)}>
      <Table className={classNames?.table}>
        <TableHeader className={classNames?.header}>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className={classNames?.headerRow}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort()
                const sortDir = header.column.getIsSorted()
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      canSort && 'cursor-pointer select-none',
                      classNames?.head,
                    )}
                    onClick={
                      canSort
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    {header.isPlaceholder ? null : (
                      <span className="inline-flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {canSort && (
                          <span className="text-muted-foreground">
                            {sortDir === 'asc' ? (
                              <ArrowUp className="h-3.5 w-3.5" />
                            ) : sortDir === 'desc' ? (
                              <ArrowDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                            )}
                          </span>
                        )}
                      </span>
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody className={classNames?.body}>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={columnCount}
                className={cn(
                  'h-24 text-center text-muted-foreground',
                  classNames?.loading,
                )}
              >
                {loadingMessage}
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columnCount}
                className={cn(
                  'h-24 text-center text-muted-foreground',
                  classNames?.empty,
                )}
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  onRowClick && 'cursor-pointer',
                  classNames?.row,
                )}
                onClick={
                  onRowClick ? () => onRowClick(row.original) : undefined
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={classNames?.cell}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
