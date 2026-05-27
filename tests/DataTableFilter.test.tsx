import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DataTableFilter } from '../src/components/DataTableFilter'
import { useDataTable } from '../src/hooks/useDataTable'
import type { DataTableResponse } from '../src/types'

interface User {
  id: number
  name: string
  status: string
}

const baseResponse: DataTableResponse<User> = {
  data: [],
  meta: { page: 1, per_page: 25, total: 0, filtered: 0, last_page: 1 },
}

function setup() {
  const fetcher = vi.fn(async () => baseResponse)
  const hook = renderHook(() =>
    useDataTable<User>({
      endpoint: '/api/users',
      columns: [
        { accessorKey: 'name', header: 'Name', enableColumnFilter: true },
        { accessorKey: 'status', header: 'Status', enableColumnFilter: true },
      ],
      fetcher,
    }),
  )
  return { fetcher, hook }
}

describe('DataTableFilter', () => {
  it('renders a select and updates the column filter', async () => {
    const { fetcher, hook } = setup()
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))

    render(
      <DataTableFilter
        table={hook.result.current.table}
        columnId="status"
        options={[
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ]}
        placeholder="All statuses"
      />,
    )

    const select = screen.getByRole('combobox') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'active' } })

    await waitFor(() => {
      expect(
        hook.result.current.table.getColumn('status')?.getFilterValue(),
      ).toBe('active')
    })

    // Clearing back to empty option resets the filter.
    fireEvent.change(select, { target: { value: '' } })
    await waitFor(() => {
      expect(
        hook.result.current.table.getColumn('status')?.getFilterValue(),
      ).toBeUndefined()
    })
  })

  it('renders a text input filter', async () => {
    const { fetcher, hook } = setup()
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))

    render(
      <DataTableFilter
        table={hook.result.current.table}
        columnId="name"
        type="input"
        placeholder="Filter name"
      />,
    )

    const input = screen.getByPlaceholderText('Filter name') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'al' } })

    await waitFor(() => {
      expect(
        hook.result.current.table.getColumn('name')?.getFilterValue(),
      ).toBe('al')
    })
  })

  it('renders a multiselect and sets an array filter value', async () => {
    const { fetcher, hook } = setup()
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))

    render(
      <DataTableFilter
        table={hook.result.current.table}
        columnId="status"
        type="multiselect"
        options={[
          { label: 'Active', value: 'active' },
          { label: 'Pending', value: 'pending' },
          { label: 'Inactive', value: 'inactive' },
        ]}
      />,
    )

    const select = screen.getByRole('listbox') as HTMLSelectElement
    // Select two options programmatically.
    const options = Array.from(select.options)
    act(() => {
      const optActive = options.find((o) => o.value === 'active')
      const optPending = options.find((o) => o.value === 'pending')
      if (optActive) optActive.selected = true
      if (optPending) optPending.selected = true
      fireEvent.change(select)
    })

    await waitFor(() => {
      expect(
        hook.result.current.table.getColumn('status')?.getFilterValue(),
      ).toEqual(['active', 'pending'])
    })
  })

  it('supports a fully custom `render` prop', async () => {
    const { fetcher, hook } = setup()
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))

    render(
      <DataTableFilter
        table={hook.result.current.table}
        columnId="status"
        render={({ value, setValue }) => (
          <button onClick={() => setValue('custom-val')}>
            current: {String(value ?? '')}
          </button>
        )}
      />,
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(
        hook.result.current.table.getColumn('status')?.getFilterValue(),
      ).toBe('custom-val')
    })
  })

  it('warns and renders nothing when columnId is missing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { fetcher, hook } = setup()
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))

    const { container } = render(
      <DataTableFilter
        table={hook.result.current.table}
        columnId="nope"
        options={[{ label: 'X', value: 'x' }]}
      />,
    )

    expect(container.firstChild).toBeNull()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
