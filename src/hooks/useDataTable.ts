import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type Table,
  type Updater,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { buildQueryString } from '../adapters/buildQueryString'
import type {
  DataTableError,
  DataTableFetcher,
  DataTableMeta,
  DataTableResponse,
} from '../types'
import { defaultFetcher } from '../utils/defaultFetcher'
import { useDebouncedValue } from '../utils/useDebouncedValue'

export interface UseDataTableOptions<TData> {
  /** Backend endpoint, e.g. '/datatable/users'. */
  endpoint: string
  /** TanStack column definitions. */
  columns: ColumnDef<TData, unknown>[]
  /** Initial page size. Defaults to 25. */
  initialPageSize?: number
  /** Initial sort state. */
  initialSorting?: SortingState
  /** Initial column filters. */
  initialColumnFilters?: ColumnFiltersState
  /** Debounce delay for the global search, in ms. Defaults to 300. */
  searchDebounceMs?: number
  /** Custom fetcher (axios, ky, inertia, etc.). */
  fetcher?: DataTableFetcher
  /** Extra static query params merged into every request. */
  extraParams?: Record<string, string | string[]>
  /** Called when a fetch fails. */
  onError?: (error: DataTableError | Error) => void
  /** Skip the first fetch on mount (e.g. defer until user interacts). */
  manual?: boolean
}

export interface UseDataTableResult<TData> {
  table: Table<TData>
  data: TData[]
  meta: DataTableMeta | null
  loading: boolean
  error: DataTableError | Error | null
  /** Trigger a refetch with current state. */
  refetch: () => void
}

/**
 * Hook that wires TanStack Table state to a Laravel server-side endpoint
 * implementing the `manusiakemos/laravel-tanstack` protocol.
 *
 * @example
 * const { table, loading } = useDataTable<User>({
 *   endpoint: '/datatable/users',
 *   columns: [
 *     { accessorKey: 'name', header: 'Name' },
 *     { accessorKey: 'email', header: 'Email' },
 *   ],
 * })
 */
export function useDataTable<TData>(
  options: UseDataTableOptions<TData>,
): UseDataTableResult<TData> {
  const {
    endpoint,
    columns,
    initialPageSize = 25,
    initialSorting = [],
    initialColumnFilters = [],
    searchDebounceMs = 300,
    fetcher = defaultFetcher,
    extraParams,
    onError,
    manual = false,
  } = options

  const [data, setData] = useState<TData[]>([])
  const [meta, setMeta] = useState<DataTableMeta | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<DataTableError | Error | null>(null)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  })
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(initialColumnFilters)
  const [globalFilter, setGlobalFilter] = useState('')

  // Debounce only the global search; pagination/sort/filter fire immediately.
  const debouncedSearch = useDebouncedValue(globalFilter, searchDebounceMs)

  // Reset to page 0 whenever search/filter/sort changes so the user doesn't
  // land on an empty page that no longer exists in the filtered result set.
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [debouncedSearch, sorting, columnFilters])

  // Cancel in-flight requests when a new one fires.
  const abortRef = useRef<AbortController | null>(null)
  const [refetchToken, setRefetchToken] = useState(0)
  const refetch = useCallback(() => setRefetchToken((t) => t + 1), [])

  useEffect(() => {
    if (manual && refetchToken === 0) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const query = buildQueryString({
      pagination,
      sorting,
      columnFilters,
      globalFilter: debouncedSearch,
      extra: extraParams,
    })

    const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}${query}`

    setLoading(true)
    setError(null)

    fetcher(url, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return
        const typed = response as DataTableResponse<TData>
        setData(typed.data)
        setMeta(typed.meta)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        if (err instanceof Error && err.name === 'AbortError') return
        const e = err instanceof Error ? err : new Error(String(err))
        setError(e)
        onError?.(e)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [
    endpoint,
    pagination,
    sorting,
    columnFilters,
    debouncedSearch,
    extraParams,
    fetcher,
    onError,
    manual,
    refetchToken,
  ])

  const pageCount = useMemo(() => {
    if (!meta) return -1
    return meta.last_page
  }, [meta])

  const table = useReactTable<TData>({
    data,
    columns,
    pageCount,
    state: { pagination, sorting, columnFilters, globalFilter },
    onPaginationChange: setPagination as (updater: Updater<PaginationState>) => void,
    onSortingChange: setSorting as (updater: Updater<SortingState>) => void,
    onColumnFiltersChange: setColumnFilters as (
      updater: Updater<ColumnFiltersState>,
    ) => void,
    onGlobalFilterChange: setGlobalFilter as (updater: Updater<string>) => void,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
  })

  return { table, data, meta, loading, error, refetch }
}
