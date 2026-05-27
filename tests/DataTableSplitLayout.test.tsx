import { render, renderHook, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DataTableFilter } from '../src/components/DataTableFilter'
import { DataTableSplitLayout } from '../src/components/layouts/DataTableSplitLayout'
import { useDataTable } from '../src/hooks/useDataTable'
import type { DataTableResponse } from '../src/types'

interface User {
  id: number
  name: string
  status: string
}

const baseResponse: DataTableResponse<User> = {
  data: [{ id: 1, name: 'Alpha', status: 'active' }],
  meta: { page: 1, per_page: 25, total: 1, filtered: 1, last_page: 1 },
}

describe('DataTableSplitLayout', () => {
  it('renders search, filters, table rows, and pagination together', async () => {
    const fetcher = vi.fn(async () => baseResponse)

    const { result } = renderHook(() =>
      useDataTable<User>({
        endpoint: '/api/users',
        columns: [
          { accessorKey: 'name', header: 'Name' },
          { accessorKey: 'status', header: 'Status', enableColumnFilter: true },
        ],
        fetcher,
      }),
    )

    await waitFor(() => expect(result.current.loading).toBe(false))

    render(
      <DataTableSplitLayout
        table={result.current.table}
        meta={result.current.meta}
        loading={result.current.loading}
        searchProps={{ placeholder: 'Find user...' }}
        filters={
          <DataTableFilter
            table={result.current.table}
            columnId="status"
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
            placeholder="All"
          />
        }
        actions={<button>+ Add</button>}
        paginationProps={{ showPageSize: true }}
      />,
    )

    expect(screen.getByPlaceholderText('Find user...')).toBeInTheDocument()
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('+ Add')).toBeInTheDocument()
    expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument()
    // page-size selector is rendered
    expect(screen.getByRole('combobox', { name: /rows per page/i })).toBeInTheDocument()
  })

  it('allows overriding the search slot entirely', async () => {
    const fetcher = vi.fn(async () => baseResponse)

    const { result } = renderHook(() =>
      useDataTable<User>({
        endpoint: '/api/users',
        columns: [{ accessorKey: 'name', header: 'Name' }],
        fetcher,
      }),
    )

    await waitFor(() => expect(result.current.loading).toBe(false))

    render(
      <DataTableSplitLayout
        table={result.current.table}
        meta={result.current.meta}
        search={<div data-testid="custom-search">custom</div>}
      />,
    )

    expect(screen.getByTestId('custom-search')).toBeInTheDocument()
  })
})
