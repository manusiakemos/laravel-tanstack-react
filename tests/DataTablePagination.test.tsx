import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DataTablePagination } from '../src/components/DataTablePagination'
import { useDataTable } from '../src/hooks/useDataTable'
import type { DataTableResponse } from '../src/types'

interface User {
  id: number
  name: string
}

const baseResponse: DataTableResponse<User> = {
  data: [{ id: 1, name: 'Alpha' }],
  meta: { page: 1, per_page: 25, total: 100, filtered: 75, last_page: 3 },
}

describe('DataTablePagination', () => {
  it('renders summary and navigates pages', async () => {
    const fetcher = vi.fn(async () => baseResponse)
    const { result } = renderHook(() =>
      useDataTable<User>({
        endpoint: '/api/users',
        columns: [{ accessorKey: 'name', header: 'Name' }],
        fetcher,
      }),
    )

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))

    function Wrapper() {
      return (
        <DataTablePagination
          table={result.current.table}
          meta={result.current.meta}
        />
      )
    }

    const { rerender } = render(<Wrapper />)

    expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument()
    expect(screen.getByText(/75 rows/)).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByText('Next'))
    })

    rerender(<Wrapper />)

    expect(result.current.table.getState().pagination.pageIndex).toBe(1)
    expect(screen.getByText(/Page 2 of 3/)).toBeInTheDocument()
  })

  it('renders page-size selector when enabled', async () => {
    const fetcher = vi.fn(async () => baseResponse)
    const { result } = renderHook(() =>
      useDataTable<User>({
        endpoint: '/api/users',
        columns: [{ accessorKey: 'name', header: 'Name' }],
        fetcher,
      }),
    )

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))

    render(
      <DataTablePagination
        table={result.current.table}
        showPageSize
        pageSizeOptions={[10, 50]}
      />,
    )

    const select = screen.getByRole('combobox') as HTMLSelectElement
    fireEvent.change(select, { target: { value: '50' } })

    await waitFor(() => {
      expect(result.current.table.getState().pagination.pageSize).toBe(50)
    })
  })

  it('supports custom labels and a `render` override', async () => {
    const fetcher = vi.fn(async () => baseResponse)
    const { result } = renderHook(() =>
      useDataTable<User>({
        endpoint: '/api/users',
        columns: [{ accessorKey: 'name', header: 'Name' }],
        fetcher,
      }),
    )

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))

    render(
      <DataTablePagination
        table={result.current.table}
        render={({ pageIndex, pageCount, goToNext }) => (
          <button onClick={goToNext}>
            custom {pageIndex + 1}/{pageCount}
          </button>
        )}
      />,
    )

    expect(screen.getByText(/custom 1\//)).toBeInTheDocument()
  })
})
