/**
 * Example: Users index page with server-side TanStack Table.
 *
 * Backend route (Laravel):
 *   Route::get('/datatable/users', UserDataTableController::class)
 *     ->middleware('auth');
 *
 * Backend controller (using manusiakemos/laravel-tanstack):
 *
 *   class UserDataTableController {
 *     public function __invoke(Request $request) {
 *       return DataTable::for(User::query())
 *         ->searchable(['name', 'email'])
 *         ->sortable(['name', 'email', 'created_at'])
 *         ->filterable(['status', 'role']);
 *     }
 *   }
 */

import { flexRender } from '@tanstack/react-table'
import { useDataTable } from '@manusiakemos/laravel-tanstack-react'

interface User {
  id: number
  name: string
  email: string
  status: 'active' | 'inactive'
  role: string
}

export default function UsersIndex() {
  const { table, loading, error, meta } = useDataTable<User>({
    endpoint: '/datatable/users',
    columns: [
      { accessorKey: 'name', header: 'Name', enableSorting: true },
      { accessorKey: 'email', header: 'Email', enableSorting: true },
      { accessorKey: 'role', header: 'Role' },
      {
        accessorKey: 'status',
        header: 'Status',
        enableColumnFilter: true,
      },
    ],
    initialPageSize: 25,
  })

  if (error) {
    return <div className="p-4 text-red-600">Error: {error.message}</div>
  }

  return (
    <div className="p-6">
      {/* Global search */}
      <input
        type="search"
        placeholder="Search name or email..."
        value={table.getState().globalFilter ?? ''}
        onChange={(e) => table.setGlobalFilter(e.target.value)}
        className="border rounded px-3 py-2 mb-4 w-full max-w-md"
      />

      <table className="w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="text-left p-2 border-b cursor-pointer select-none"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                  {{ asc: ' ↑', desc: ' ↓' }[
                    header.column.getIsSorted() as string
                  ] ?? null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={table.getAllColumns().length} className="p-4 text-center">
                Memuat...
              </td>
            </tr>
          )}
          {!loading &&
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2 border-b">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Halaman {table.getState().pagination.pageIndex + 1} dari{' '}
          {table.getPageCount()} · Total {meta?.filtered ?? 0} baris
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border rounded px-3 py-1 disabled:opacity-50"
          >
            Sebelumnya
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border rounded px-3 py-1 disabled:opacity-50"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </div>
  )
}
