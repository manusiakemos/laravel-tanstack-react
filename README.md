# Laravel TanStack — React

[![npm version](https://img.shields.io/npm/v/@manusiakemos/laravel-tanstack-react.svg?style=flat-square)](https://www.npmjs.com/package/@manusiakemos/laravel-tanstack-react)
[![Tests](https://img.shields.io/github/actions/workflow/status/manusiakemos/laravel-tanstack-react/tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/manusiakemos/laravel-tanstack-react/actions)
[![License](https://img.shields.io/npm/l/@manusiakemos/laravel-tanstack-react.svg?style=flat-square)](LICENSE)

React hooks for server-side [TanStack Table](https://tanstack.com/table) powered by a Laravel backend. Companion package to [`manusiakemos/laravel-tanstack`](https://packagist.org/packages/manusiakemos/laravel-tanstack).

Use this when you have a Laravel + Inertia (or any React) app, want server-side pagination/search/sort/filter, and want to stop hand-rolling the adapter between TanStack state and your API.

## Installation

```bash
npm install @manusiakemos/laravel-tanstack-react @tanstack/react-table
```

You also need the Composer package on your backend:

```bash
composer require manusiakemos/laravel-tanstack
```

## Quick start

```tsx
import { useDataTable } from '@manusiakemos/laravel-tanstack-react'
import { flexRender } from '@tanstack/react-table'

interface User {
  id: number
  name: string
  email: string
}

export default function UsersIndex() {
  const { table, loading, meta } = useDataTable<User>({
    endpoint: '/datatable/users',
    columns: [
      { accessorKey: 'name', header: 'Nama' },
      { accessorKey: 'email', header: 'Email' },
    ],
  })

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id}>
            {hg.headers.map((h) => (
              <th
                key={h.id}
                onClick={h.column.getToggleSortingHandler()}
              >
                {flexRender(h.column.columnDef.header, h.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

That's it. Pagination, sorting, filtering, and global search are all wired up. Your backend controller stays under 10 lines (see the Composer package README).

See the [full Inertia example](./examples/inertia-users-index.tsx) for pagination UI, loading states, and global search input.

## API

### `useDataTable<TData>(options): UseDataTableResult<TData>`

The primary hook. Manages TanStack Table state, fetches from your Laravel endpoint on every state change, and returns a fully wired-up `Table<TData>` instance.

#### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `endpoint` | `string` | — | Backend URL, e.g. `/datatable/users`. Required. |
| `columns` | `ColumnDef<TData>[]` | — | TanStack column definitions. Required. |
| `initialPageSize` | `number` | `25` | Initial rows per page. |
| `initialSorting` | `SortingState` | `[]` | Initial sort state. |
| `initialColumnFilters` | `ColumnFiltersState` | `[]` | Initial column filters. |
| `searchDebounceMs` | `number` | `300` | Debounce delay for global search input. |
| `fetcher` | `DataTableFetcher` | `defaultFetcher` | Custom transport (axios, ky, Inertia, etc.). |
| `extraParams` | `Record<string, string \| string[]>` | — | Static query params merged into every request. |
| `onError` | `(error: Error) => void` | — | Called when a fetch fails. |
| `manual` | `boolean` | `false` | Skip the initial mount fetch. Use `refetch()` to trigger. |

#### Returns

| Field | Type | Description |
|---|---|---|
| `table` | `Table<TData>` | Fully configured TanStack table instance. |
| `data` | `TData[]` | Current page's rows. Same as `table.getRowModel().rows.map(r => r.original)`. |
| `meta` | `DataTableMeta \| null` | Response metadata: page, per_page, total, filtered, last_page. |
| `loading` | `boolean` | True while a request is in flight. |
| `error` | `Error \| null` | Last error, if any. |
| `refetch` | `() => void` | Trigger a refetch with current state. |

### Lower-level exports

For advanced use cases:

```ts
import {
  buildQueryString,      // adapter: TanStack state → query string
  defaultFetcher,        // the default JSON fetcher
  useDebouncedValue,     // debounce hook for search inputs
  DataTableError,        // custom error class with status + response
} from '@manusiakemos/laravel-tanstack-react'
```

## Patterns

### CSRF with Laravel Sanctum

The default fetcher sends `credentials: 'same-origin'` and `X-Requested-With: XMLHttpRequest`. For Sanctum SPA auth, make sure your endpoint route is in the `web` middleware group (not `api`), so it has session access.

### Custom fetcher with axios

```tsx
import axios from 'axios'

const { table } = useDataTable<User>({
  endpoint: '/datatable/users',
  columns: [/* ... */],
  fetcher: async (url, init) => {
    const res = await axios.get(url, { signal: init?.signal })
    return res.data
  },
})
```

### Multi-tenant / scoped requests

```tsx
const { table } = useDataTable<User>({
  endpoint: '/datatable/users',
  columns: [/* ... */],
  extraParams: { tenant_id: String(currentTenant.id) },
})
```

### Inertia.js page integration

Inertia handles the page shell (layout, auth, navigation). This hook handles the table's data layer with its own JSON endpoint — no full-page reload on pagination, no Inertia props for table data.

```tsx
// pages/Users/Index.tsx (rendered by Inertia)
import { useDataTable } from '@manusiakemos/laravel-tanstack-react'
import { datatable } from '@/routes/users'  // Laravel Wayfinder generated helper

export default function Index() {
  const { table } = useDataTable<User>({
    endpoint: datatable.url(),  // typed URL from Wayfinder
    columns: [/* ... */],
  })

  return <YourTableComponent table={table} />
}
```

### Filtering by status

```tsx
const { table } = useDataTable<User>({
  endpoint: '/datatable/users',
  columns: [
    { accessorKey: 'name', header: 'Nama' },
    {
      accessorKey: 'status',
      header: 'Status',
      enableColumnFilter: true,
    },
  ],
})

// Anywhere in your component:
table.getColumn('status')?.setFilterValue('active')
// → fetches with ?filter[status]=active

table.getColumn('status')?.setFilterValue(['active', 'pending'])
// → fetches with ?filter[status][]=active&filter[status][]=pending
```

## Protocol

This package speaks the protocol defined by `manusiakemos/laravel-tanstack`:

**Request:**
```
GET /datatable/users?
  page=1&per_page=25
  &sort=name:asc,created_at:desc
  &search=hafiz
  &filter[status]=active
  &filter[role][]=admin&filter[role][]=editor
```

**Response:**
```json
{
  "data": [
    { "id": 1, "name": "Hafiz" }
  ],
  "meta": {
    "page": 1,
    "per_page": 25,
    "total": 1234,
    "filtered": 89,
    "last_page": 4
  }
}
```

See the [backend package docs](https://github.com/manusiakemos/laravel-tanstack) for the full protocol spec.

## Requirements

- React 18 or 19
- `@tanstack/react-table` 8.20+
- Node 18+ (for the build, not for runtime — works in any browser TanStack supports)

## Roadmap

- [ ] Vue 3 companion: `@manusiakemos/laravel-tanstack-vue`
- [ ] Svelte 5 companion: `@manusiakemos/laravel-tanstack-svelte`
- [ ] Framework-agnostic core: `@manusiakemos/laravel-tanstack-core`
- [ ] URL state sync (mirror table state in `?page=...&sort=...`)
- [ ] Optimistic row updates
- [ ] Built-in CSV export trigger

## License

MIT.
