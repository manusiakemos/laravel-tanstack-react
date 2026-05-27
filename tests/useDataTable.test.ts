import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useDataTable } from '../src/hooks/useDataTable'
import type { DataTableResponse } from '../src/types'

interface User {
  id: number
  name: string
}

function makeFetcher(response: DataTableResponse<User>) {
  return vi.fn(async () => response)
}

const baseResponse: DataTableResponse<User> = {
  data: [
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Bravo' },
  ],
  meta: {
    page: 1,
    per_page: 25,
    total: 100,
    filtered: 50,
    last_page: 2,
  },
}

describe('useDataTable', () => {
  it('fetches on mount and exposes data + meta', async () => {
    const fetcher = makeFetcher(baseResponse)

    const { result } = renderHook(() =>
      useDataTable<User>({
        endpoint: '/api/users',
        columns: [{ accessorKey: 'name', header: 'Name' }],
        fetcher,
      }),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(result.current.data).toHaveLength(2)
    expect(result.current.meta?.filtered).toBe(50)
    expect(result.current.error).toBeNull()
  })

  it('skips initial fetch when manual=true', async () => {
    const fetcher = makeFetcher(baseResponse)

    renderHook(() =>
      useDataTable<User>({
        endpoint: '/api/users',
        columns: [{ accessorKey: 'name', header: 'Name' }],
        fetcher,
        manual: true,
      }),
    )

    // Give effects a tick
    await new Promise((r) => setTimeout(r, 50))
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('appends correct query string to endpoint', async () => {
    const fetcher = makeFetcher(baseResponse)

    renderHook(() =>
      useDataTable<User>({
        endpoint: '/api/users',
        columns: [{ accessorKey: 'name', header: 'Name' }],
        fetcher,
        initialPageSize: 10,
      }),
    )

    await waitFor(() => expect(fetcher).toHaveBeenCalled())

    const url = fetcher.mock.calls[0]?.[0] as string
    expect(url).toContain('/api/users?')
    expect(url).toContain('page=1')
    expect(url).toContain('per_page=10')
  })

  it('preserves existing query string in endpoint', async () => {
    const fetcher = makeFetcher(baseResponse)

    renderHook(() =>
      useDataTable<User>({
        endpoint: '/api/users?tenant=42',
        columns: [{ accessorKey: 'name', header: 'Name' }],
        fetcher,
      }),
    )

    await waitFor(() => expect(fetcher).toHaveBeenCalled())

    const url = fetcher.mock.calls[0]?.[0] as string
    expect(url).toContain('tenant=42')
    expect(url).toContain('&page=1')
  })

  it('captures errors via onError and exposes them on state', async () => {
    const fetcher = vi.fn(async () => {
      throw new Error('network down')
    })
    const onError = vi.fn()

    const { result } = renderHook(() =>
      useDataTable<User>({
        endpoint: '/api/users',
        columns: [{ accessorKey: 'name', header: 'Name' }],
        fetcher,
        onError,
      }),
    )

    await waitFor(() => {
      expect(result.current.error).not.toBeNull()
    })

    expect(onError).toHaveBeenCalledTimes(1)
    expect(result.current.error?.message).toBe('network down')
  })

  it('triggers refetch when refetch() is called', async () => {
    const fetcher = makeFetcher(baseResponse)

    const { result } = renderHook(() =>
      useDataTable<User>({
        endpoint: '/api/users',
        columns: [{ accessorKey: 'name', header: 'Name' }],
        fetcher,
      }),
    )

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))

    act(() => result.current.refetch())

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
  })

  it('resets to page 1 when sorting changes', async () => {
    const fetcher = makeFetcher(baseResponse)

    const { result } = renderHook(() =>
      useDataTable<User>({
        endpoint: '/api/users',
        columns: [{ accessorKey: 'name', header: 'Name' }],
        fetcher,
      }),
    )

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))

    // Navigate to page 3
    act(() => result.current.table.setPageIndex(2))
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))

    // Change sort — should reset to page 0
    act(() =>
      result.current.table.setSorting([{ id: 'name', desc: false }]),
    )

    await waitFor(() => {
      const lastCall = fetcher.mock.calls.at(-1)?.[0] as string
      expect(lastCall).toContain('page=1')
      expect(lastCall).toContain('sort=name%3Aasc')
    })
  })
})
