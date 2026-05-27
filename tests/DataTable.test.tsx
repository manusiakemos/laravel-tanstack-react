import { fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DataTable } from '../src/components/DataTable'
import { useDataTable } from '../src/hooks/useDataTable'
import type { DataTableResponse } from '../src/types'

interface User {
  id: number
  name: string
}

const populated: DataTableResponse<User> = {
  data: [
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Bravo' },
  ],
  meta: { page: 1, per_page: 25, total: 2, filtered: 2, last_page: 1 },
}

const empty: DataTableResponse<User> = {
  data: [],
  meta: { page: 1, per_page: 25, total: 0, filtered: 0, last_page: 1 },
}

describe('DataTable', () => {
  it('renders rows from the table instance', async () => {
    const fetcher = vi.fn(async () => populated)
    const { result } = renderHook(() =>
      useDataTable<User>({
        endpoint: '/api/users',
        columns: [{ accessorKey: 'name', header: 'Name' }],
        fetcher,
      }),
    )

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))

    render(<DataTable table={result.current.table} />)

    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Bravo')).toBeInTheDocument()
  })

  it('renders empty state when no rows', async () => {
    const fetcher = vi.fn(async () => empty)
    const { result } = renderHook(() =>
      useDataTable<User>({
        endpoint: '/api/users',
        columns: [{ accessorKey: 'name', header: 'Name' }],
        fetcher,
      }),
    )

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))

    render(
      <DataTable
        table={result.current.table}
        emptyMessage="Nothing here yet."
      />,
    )

    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument()
  })

  it('renders loading state', async () => {
    const fetcher = vi.fn(async () => populated)
    const { result } = renderHook(() =>
      useDataTable<User>({
        endpoint: '/api/users',
        columns: [{ accessorKey: 'name', header: 'Name' }],
        fetcher,
      }),
    )

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))

    render(
      <DataTable
        table={result.current.table}
        loading
        loadingMessage="Fetching..."
      />,
    )

    expect(screen.getByText('Fetching...')).toBeInTheDocument()
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
  })

  it('calls onRowClick with the row original', async () => {
    const fetcher = vi.fn(async () => populated)
    const onRowClick = vi.fn()
    const { result } = renderHook(() =>
      useDataTable<User>({
        endpoint: '/api/users',
        columns: [{ accessorKey: 'name', header: 'Name' }],
        fetcher,
      }),
    )

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))

    render(
      <DataTable table={result.current.table} onRowClick={onRowClick} />,
    )

    fireEvent.click(screen.getByText('Alpha'))
    expect(onRowClick).toHaveBeenCalledWith({ id: 1, name: 'Alpha' })
  })
})
