/**
 * Response shape from a `manusiakemos/laravel-tanstack` backend endpoint.
 *
 * Backend returns:
 *   { data: T[], meta: { page, per_page, total, filtered, last_page } }
 */
export interface DataTableResponse<TData> {
  data: TData[]
  meta: DataTableMeta
}

export interface DataTableMeta {
  page: number
  per_page: number
  /** May be null when backend has skipTotal() enabled. */
  total: number | null
  filtered: number
  last_page: number
}

/**
 * Request query parameters sent to the backend.
 * Built from TanStack Table state by the request adapter.
 */
export interface DataTableRequestParams {
  page: number
  per_page: number
  /** Comma-separated `column:direction` pairs. */
  sort?: string
  /** Global search term. */
  search?: string
  /** Per-column filters: `filter[col]=val` or `filter[col][]=val1&filter[col][]=val2`. */
  filter?: Record<string, string | string[]>
}

/**
 * Optional fetcher signature. Defaults to `fetch` but allows axios, ky,
 * Inertia's router, or any custom transport (e.g. with CSRF headers).
 */
export type DataTableFetcher = (
  url: string,
  init?: RequestInit,
) => Promise<unknown>

/**
 * Error thrown or returned when a request fails.
 */
export class DataTableError extends Error {
  public readonly status: number
  public readonly response?: unknown

  constructor(message: string, status: number, response?: unknown) {
    super(message)
    this.name = 'DataTableError'
    this.status = status
    this.response = response
  }
}
