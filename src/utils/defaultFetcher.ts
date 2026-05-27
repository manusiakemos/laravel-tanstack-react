import { DataTableError, type DataTableResponse } from '../types'

/**
 * Default JSON fetcher. Reads body, throws DataTableError on non-2xx.
 * Sends standard headers for Laravel session/Sanctum compatibility
 * (X-Requested-With makes Laravel treat the request as AJAX).
 */
export async function defaultFetcher<TData>(
  url: string,
  init?: RequestInit,
): Promise<DataTableResponse<TData>> {
  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  let body: unknown = null
  const text = await response.text()
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }

  if (!response.ok) {
    throw new DataTableError(
      `Request failed with status ${response.status}`,
      response.status,
      body,
    )
  }

  if (!isDataTableResponse<TData>(body)) {
    throw new DataTableError(
      'Invalid response shape: expected { data, meta }',
      response.status,
      body,
    )
  }

  return body
}

function isDataTableResponse<TData>(
  value: unknown,
): value is DataTableResponse<TData> {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return Array.isArray(v.data) && typeof v.meta === 'object' && v.meta !== null
}
