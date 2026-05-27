/**
 * Example: Users index page with the predefined "split toolbar" layout.
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

import {
  Button,
  DataTableFilter,
  DataTableSplitLayout,
  useDataTable,
} from '@manusiakemos/laravel-tanstack-react'

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
      { accessorKey: 'role', header: 'Role', enableColumnFilter: true },
      {
        accessorKey: 'status',
        header: 'Status',
        enableColumnFilter: true,
      },
    ],
    initialPageSize: 25,
  })

  if (error) {
    return (
      <div className="p-4 text-sm text-destructive">
        Error: {error.message}
      </div>
    )
  }

  return (
    <div className="p-6">
      <DataTableSplitLayout
        table={table}
        meta={meta}
        loading={loading}
        searchProps={{ placeholder: 'Search name or email...' }}
        filters={
          <>
            <DataTableFilter
              table={table}
              columnId="status"
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ]}
              placeholder="All statuses"
            />
            <DataTableFilter
              table={table}
              columnId="role"
              type="multiselect"
              options={[
                { label: 'Admin', value: 'admin' },
                { label: 'Editor', value: 'editor' },
                { label: 'Viewer', value: 'viewer' },
              ]}
            />
          </>
        }
        actions={<Button>+ Add user</Button>}
        paginationProps={{
          showPageSize: true,
          showFirstLast: true,
          pageSizeOptions: [10, 25, 50, 100],
        }}
        tableProps={{ emptyMessage: 'No users found.' }}
      />
    </div>
  )
}
