import type { Table } from '@tanstack/react-table'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

import { cn } from '../lib/cn'
import type { DataTableMeta } from '../types'
import { Button } from './ui/button'
import { Select } from './ui/select'

export interface DataTablePaginationLabels {
  previous?: ReactNode
  next?: ReactNode
  first?: ReactNode
  last?: ReactNode
  page?: string
  of?: string
  rowsPerPage?: string
  /** Renderer for the row-count summary. */
  summary?: (info: {
    pageIndex: number
    pageCount: number
    pageSize: number
    filtered: number
    total: number | null
  }) => ReactNode
}

export interface DataTablePaginationClassNames {
  root?: string
  info?: string
  controls?: string
  button?: string
  select?: string
  pageSize?: string
}

export interface DataTablePaginationRenderProps<TData> {
  table: Table<TData>
  meta: DataTableMeta | null
  pageIndex: number
  pageCount: number
  pageSize: number
  canPreviousPage: boolean
  canNextPage: boolean
  goToFirst: () => void
  goToPrevious: () => void
  goToNext: () => void
  goToLast: () => void
  setPageSize: (size: number) => void
}

export interface DataTablePaginationProps<TData> {
  table: Table<TData>
  /** Meta from `useDataTable`. Used for the row-count summary. */
  meta?: DataTableMeta | null
  /** Show the page-size selector. Defaults to false. */
  showPageSize?: boolean
  /** Available page size options when `showPageSize` is true. */
  pageSizeOptions?: number[]
  /** Show first/last page buttons. Defaults to false. */
  showFirstLast?: boolean
  /** Hide the "Page X of Y · N rows" summary. */
  hideSummary?: boolean
  /** Override individual labels / the summary renderer. */
  labels?: DataTablePaginationLabels
  /** Class for the root container. */
  className?: string
  /** Fine-grained class names for sub-elements. */
  classNames?: DataTablePaginationClassNames
  /** Extra props for the prev/next/first/last buttons. */
  buttonProps?: Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'onClick' | 'disabled' | 'className' | 'type'
  >
  /** Extra props for the page-size <select>. */
  selectProps?: Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    'value' | 'onChange' | 'className'
  >
  /**
   * Full render override. Receives the pagination API so any custom UI can
   * still drive the table.
   */
  render?: (props: DataTablePaginationRenderProps<TData>) => ReactNode
}

const DEFAULT_PAGE_SIZES = [10, 25, 50, 100]

/**
 * Shadcn-styled pagination controls (prev/next, optional first/last, optional
 * page-size selector, row-count summary) wired to a TanStack `Table`.
 */
export function DataTablePagination<TData>(props: DataTablePaginationProps<TData>) {
  const {
    table,
    meta = null,
    showPageSize = false,
    pageSizeOptions = DEFAULT_PAGE_SIZES,
    showFirstLast = false,
    hideSummary = false,
    labels,
    className,
    classNames,
    buttonProps,
    selectProps,
    render,
  } = props

  const state = table.getState().pagination
  const pageIndex = state.pageIndex
  const pageSize = state.pageSize
  const pageCount = table.getPageCount()
  const canPreviousPage = table.getCanPreviousPage()
  const canNextPage = table.getCanNextPage()

  const goToFirst = () => table.setPageIndex(0)
  const goToPrevious = () => table.previousPage()
  const goToNext = () => table.nextPage()
  const goToLast = () => table.setPageIndex(Math.max(0, pageCount - 1))
  const setPageSize = (size: number) => table.setPageSize(size)

  if (render) {
    return (
      <>
        {render({
          table,
          meta,
          pageIndex,
          pageCount,
          pageSize,
          canPreviousPage,
          canNextPage,
          goToFirst,
          goToPrevious,
          goToNext,
          goToLast,
          setPageSize,
        })}
      </>
    )
  }

  const filtered = meta?.filtered ?? 0
  const total = meta?.total ?? null

  const summaryNode = labels?.summary
    ? labels.summary({ pageIndex, pageCount, pageSize, filtered, total })
    : (
        <>
          {labels?.page ?? 'Page'} {pageIndex + 1} {labels?.of ?? 'of'}{' '}
          {Math.max(1, pageCount)}
          {meta ? ` · ${filtered} rows` : null}
        </>
      )

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className,
        classNames?.root,
      )}
    >
      {!hideSummary && (
        <div
          className={cn(
            'text-sm text-muted-foreground',
            classNames?.info,
          )}
        >
          {summaryNode}
        </div>
      )}

      <div
        className={cn(
          'flex items-center gap-2',
          classNames?.controls,
        )}
      >
        {showPageSize && (
          <label
            className={cn(
              'flex items-center gap-2 text-sm text-muted-foreground',
              classNames?.pageSize,
            )}
          >
            <span>{labels?.rowsPerPage ?? 'Rows per page:'}</span>
            <Select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className={cn('h-9 w-[5rem]', classNames?.select)}
              {...selectProps}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </label>
        )}

        {showFirstLast && (
          <Button
            variant="outline"
            size="icon"
            onClick={goToFirst}
            disabled={!canPreviousPage}
            className={classNames?.button}
            aria-label="Go to first page"
            {...buttonProps}
          >
            {labels?.first ?? <ChevronsLeft className="h-4 w-4" />}
          </Button>
        )}

        <Button
          variant="outline"
          onClick={goToPrevious}
          disabled={!canPreviousPage}
          className={classNames?.button}
          aria-label="Go to previous page"
          {...buttonProps}
        >
          {labels?.previous ?? (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={goToNext}
          disabled={!canNextPage}
          className={classNames?.button}
          aria-label="Go to next page"
          {...buttonProps}
        >
          {labels?.next ?? (
            <>
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>

        {showFirstLast && (
          <Button
            variant="outline"
            size="icon"
            onClick={goToLast}
            disabled={!canNextPage}
            className={classNames?.button}
            aria-label="Go to last page"
            {...buttonProps}
          >
            {labels?.last ?? <ChevronsRight className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  )
}
