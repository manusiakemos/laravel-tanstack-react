import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'

/**
 * Build a query string from TanStack Table state, matching the protocol
 * expected by `manusiakemos/laravel-tanstack`:
 *
 *   ?page=1&per_page=25&sort=name:asc,id:desc&search=foo
 *    &filter[status]=active&filter[role][]=admin&filter[role][]=editor
 *
 * Pagination is 0-indexed in TanStack (pageIndex) but 1-indexed in the
 * backend (page); this function handles the conversion.
 */
export interface BuildQueryStringInput {
  pagination: PaginationState
  sorting?: SortingState
  columnFilters?: ColumnFiltersState
  globalFilter?: string
  /** Extra static params merged in (e.g. tenant_id, view preset). */
  extra?: Record<string, string | string[]>
}

export function buildQueryString(input: BuildQueryStringInput): string {
  const { pagination, sorting = [], columnFilters = [], globalFilter, extra } =
    input
  const params = new URLSearchParams()

  // Pagination — convert 0-indexed pageIndex to 1-indexed page.
  params.set('page', String(pagination.pageIndex + 1))
  params.set('per_page', String(pagination.pageSize))

  // Global search.
  if (globalFilter && globalFilter.trim() !== '') {
    params.set('search', globalFilter.trim())
  }

  // Sort — collapse multi-sort into one comma-separated value.
  if (sorting.length > 0) {
    const sortString = sorting
      .map((s) => `${s.id}:${s.desc ? 'desc' : 'asc'}`)
      .join(',')
    params.set('sort', sortString)
  }

  // Column filters — array values become `filter[key][]=v1&filter[key][]=v2`,
  // single values become `filter[key]=v`.
  for (const filter of columnFilters) {
    const value = filter.value

    if (value === null || value === undefined || value === '') {
      continue
    }

    if (Array.isArray(value)) {
      for (const v of value) {
        if (v === null || v === undefined || v === '') continue
        params.append(`filter[${filter.id}][]`, String(v))
      }
    } else {
      params.set(`filter[${filter.id}]`, String(value))
    }
  }

  // Extras (passed through verbatim).
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (Array.isArray(value)) {
        for (const v of value) params.append(`${key}[]`, v)
      } else {
        params.set(key, value)
      }
    }
  }

  return params.toString()
}
