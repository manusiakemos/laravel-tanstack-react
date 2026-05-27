import type { Table as TanStackTable } from '@tanstack/react-table'
import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'
import type { DataTableMeta } from '../../types'
import { DataTable, type DataTableProps } from '../DataTable'
import {
  DataTablePagination,
  type DataTablePaginationProps,
} from '../DataTablePagination'
import {
  DataTableSearch,
  type DataTableSearchProps,
} from '../DataTableSearch'

export interface DataTableSplitLayoutClassNames {
  root?: string
  toolbar?: string
  toolbarLeft?: string
  toolbarRight?: string
  body?: string
  footer?: string
}

export interface DataTableSplitLayoutProps<TData> {
  table: TanStackTable<TData>
  meta?: DataTableMeta | null
  loading?: boolean

  /**
   * Right-side toolbar slot — typically one or more `<DataTableFilter />`s.
   * Rendered to the right of the search input on the same row.
   */
  filters?: ReactNode
  /**
   * Optional far-right toolbar slot for page-level actions (e.g. an
   * "+ Add" button). Appears after `filters`.
   */
  actions?: ReactNode

  /**
   * Override the entire search slot. By default, a `<DataTableSearch />`
   * wired to `table` is rendered with sensible defaults.
   */
  search?: ReactNode

  /** Forwarded to the auto-rendered `<DataTableSearch />`. */
  searchProps?: Omit<DataTableSearchProps<TData>, 'table'>
  /** Forwarded to the auto-rendered `<DataTable />`. */
  tableProps?: Omit<DataTableProps<TData>, 'table' | 'loading'>
  /** Forwarded to the auto-rendered `<DataTablePagination />`. */
  paginationProps?: Omit<DataTablePaginationProps<TData>, 'table' | 'meta'>

  className?: string
  classNames?: DataTableSplitLayoutClassNames
}

/**
 * Pre-built "split toolbar" layout: search on the left, filters/actions on
 * the right; pagination info on the left, controls on the right.
 *
 * @example
 * <DataTableSplitLayout
 *   table={table}
 *   meta={meta}
 *   loading={loading}
 *   searchProps={{ placeholder: 'Search users...' }}
 *   filters={
 *     <>
 *       <DataTableFilter table={table} columnId="status" options={statusOpts} />
 *       <DataTableFilter table={table} columnId="role" type="multiselect" options={roleOpts} />
 *     </>
 *   }
 *   actions={<Button>+ Add user</Button>}
 *   paginationProps={{ showPageSize: true, showFirstLast: true }}
 * />
 */
export function DataTableSplitLayout<TData>(
  props: DataTableSplitLayoutProps<TData>,
) {
  const {
    table,
    meta = null,
    loading = false,
    filters,
    actions,
    search,
    searchProps,
    tableProps,
    paginationProps,
    className,
    classNames,
  } = props

  const searchNode = search ?? (
    <DataTableSearch
      table={table}
      placeholder="Search..."
      className="w-full max-w-md"
      {...searchProps}
    />
  )

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        className,
        classNames?.root,
      )}
    >
      <div
        className={cn(
          'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
          classNames?.toolbar,
        )}
      >
        <div
          className={cn(
            'flex-1 min-w-0',
            classNames?.toolbarLeft,
          )}
        >
          {searchNode}
        </div>

        {(filters || actions) && (
          <div
            className={cn(
              'flex flex-wrap items-center gap-2',
              classNames?.toolbarRight,
            )}
          >
            {filters}
            {actions}
          </div>
        )}
      </div>

      <div className={classNames?.body}>
        <DataTable table={table} loading={loading} {...tableProps} />
      </div>

      <div className={classNames?.footer}>
        <DataTablePagination
          table={table}
          meta={meta}
          {...paginationProps}
        />
      </div>
    </div>
  )
}
