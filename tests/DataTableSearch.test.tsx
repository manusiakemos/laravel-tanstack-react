import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DataTableSearch } from '../src/components/DataTableSearch'
import { useDataTable } from '../src/hooks/useDataTable'
import type { DataTableResponse } from '../src/types'

interface User {
  id: number
  name: string
}

const baseResponse: DataTableResponse<User> = {
  data: [{ id: 1, name: 'Alpha' }],
  meta: { page: 1, per_page: 25, total: 1, filtered: 1, last_page: 1 },
}

describe('DataTableSearch', () => {
  it('debounces input and commits to the table global filter', async () => {
    const fetcher = vi.fn(async () => baseResponse)
    const onSearch = vi.fn()

    const { result } = renderHook(() =>
      useDataTable<User>({
        endpoint: '/api/users',
        columns: [{ accessorKey: 'name', header: 'Name' }],
        fetcher,
      }),
    )

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))

    render(
      <DataTableSearch
        table={result.current.table}
        debounceMs={50}
        onSearch={onSearch}
        placeholder="Search..."
      />,
    )

    const input = screen.getByPlaceholderText('Search...') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'hafiz' } })

    // Pre-debounce: table filter not yet updated.
    expect(result.current.table.getState().globalFilter ?? '').toBe('')

    await waitFor(() => {
      expect(result.current.table.getState().globalFilter).toBe('hafiz')
    })
    expect(onSearch).toHaveBeenCalledWith('hafiz')
  })

  it('with debounce=false: requires submit button click to commit', async () => {
    const fetcher = vi.fn(async () => baseResponse)
    const onSearch = vi.fn()

    const { result } = renderHook(() =>
      useDataTable<User>({
        endpoint: '/api/users',
        columns: [{ accessorKey: 'name', header: 'Name' }],
        fetcher,
      }),
    )

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))

    render(
      <DataTableSearch
        table={result.current.table}
        debounce={false}
        onSearch={onSearch}
        placeholder="Search..."
      />,
    )

    const input = screen.getByPlaceholderText('Search...') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'hafiz' } })

    // Wait briefly to confirm no commit happens without submit.
    await new Promise((r) => setTimeout(r, 100))
    expect(result.current.table.getState().globalFilter ?? '').toBe('')
    expect(onSearch).not.toHaveBeenCalled()

    // The submit button should be rendered.
    const button = screen.getByRole('button', { name: /search/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(result.current.table.getState().globalFilter).toBe('hafiz')
    })
    expect(onSearch).toHaveBeenCalledWith('hafiz')
  })

  it('accepts debounce as a number (custom delay)', async () => {
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
      <DataTableSearch
        table={result.current.table}
        debounce={20}
        placeholder="Search..."
      />,
    )

    const input = screen.getByPlaceholderText('Search...') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'q' } })

    await waitFor(() => {
      expect(result.current.table.getState().globalFilter).toBe('q')
    })
  })

  it('renders a custom UI via the `render` prop', async () => {
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
      <DataTableSearch
        table={result.current.table}
        debounceMs={10}
        render={({ value, setValue }) => (
          <div>
            <span data-testid="value">{value}</span>
            <button onClick={() => setValue('clicked')}>set</button>
          </div>
        )}
      />,
    )

    expect(screen.getByTestId('value').textContent).toBe('')

    act(() => {
      screen.getByText('set').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('value').textContent).toBe('clicked')
      expect(result.current.table.getState().globalFilter).toBe('clicked')
    })
  })
})
