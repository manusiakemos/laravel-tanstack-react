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
import {
  DataTable,
  DataTableFilter,
  DataTablePagination,
  DataTableSearch,
  useDataTable,
} from '@manusiakemos/laravel-tanstack-react'

interface User {
  id: number
  name: string
  email: string
  status: 'active' | 'inactive'
}

export default function UsersIndex() {
  const { table, loading, meta } = useDataTable<User>({
    endpoint: '/datatable/users',
    columns: [
      { accessorKey: 'name', header: 'Name', enableSorting: true },
      { accessorKey: 'email', header: 'Email', enableSorting: true },
      {
        accessorKey: 'status',
        header: 'Status',
        enableColumnFilter: true,
      },
    ],
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <DataTableSearch table={table} placeholder="Search users..." />
        <DataTableFilter
          table={table}
          columnId="status"
          options={[
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ]}
          placeholder="All statuses"
        />
      </div>

      <DataTable table={table} loading={loading} />

      <DataTablePagination
        table={table}
        meta={meta}
        showPageSize
        showFirstLast
      />
    </div>
  )
}
```

That's it. Pagination, sorting, filtering, and global search are all wired up. Your backend controller stays under 10 lines (see the Composer package README).

> **Styling.** Components ship pre-styled with [shadcn/ui](https://ui.shadcn.com)-style Tailwind classes (Button, Input, Select, Table primitives are bundled). Make sure Tailwind is configured in your app with the standard shadcn theme tokens (`--background`, `--foreground`, `--primary`, `--border`, `--ring`, `--muted-foreground`, etc.). Every component accepts `className`, fine-grained `classNames`, and a full `render` prop so you can swap in your own UI.

See the [full Inertia example](./examples/inertia-users-index.tsx) for pagination, filters, and search wiring.

## Components

All four components below are **fully customizable via props** — you can override class names, labels, sub-element styles, or replace the entire UI via the `render` prop while keeping the table wiring intact.

### `<DataTable />`

Shadcn-styled table with built-in sort indicators, empty state, and loading state.

```tsx
<DataTable
  table={table}
  loading={loading}
  emptyMessage="No users yet."
  loadingMessage="Fetching..."
  onRowClick={(user) => navigate(`/users/${user.id}`)}
  className="rounded-lg"
  classNames={{ row: 'hover:bg-muted/30', cell: 'py-3' }}
/>
```

### `<DataTableSearch />`

Global search. Debounced by default; pass `debounce={false}` to switch to **manual mode with a Search button** (input + button, submits on click or Enter).

```tsx
{/* Debounced (default, 300ms) */}
<DataTableSearch table={table} placeholder="Search..." />

{/* Custom debounce delay */}
<DataTableSearch table={table} debounce={500} />

{/* Manual submit — Search button */}
<DataTableSearch table={table} debounce={false} placeholder="Search..." />

{/* Fully custom UI */}
<DataTableSearch
  table={table}
  render={({ value, setValue, submit }) => (
    <MyCombobox value={value} onChange={setValue} onSubmit={submit} />
  )}
/>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `debounce` | `boolean \| number` | `true` | `true` → 300ms; number → custom ms; `false` → manual + Search button. |
| `placeholder` | `string` | `'Search...'` | Placeholder text. |
| `submitLabel` | `ReactNode` | Search icon + "Search" | Button label when `debounce={false}`. |
| `className` | `string` | — | Root wrapper class. |
| `inputClassName` | `string` | — | Class merged into the Input. |
| `buttonClassName` | `string` | — | Class merged into the submit Button. |
| `onSearch` | `(value: string) => void` | — | Fired when the search is committed. |
| `render` | `(props) => ReactNode` | — | Full UI override. |

### `<DataTablePagination />`

Prev/next (and optional first/last) buttons, page-size selector, row-count summary.

```tsx
<DataTablePagination
  table={table}
  meta={meta}
  showPageSize
  showFirstLast
  pageSizeOptions={[10, 25, 50, 100]}
  labels={{ previous: 'Prev', next: 'Next', page: 'Hal' }}
  classNames={{ info: 'text-xs', button: 'rounded-full' }}
/>
```

Use the `render` prop to take over rendering entirely while keeping the navigation handlers wired up.

### `<DataTableFilter />`

Per-column filter. Four built-in modes:

```tsx
{/* Single select */}
<DataTableFilter
  table={table}
  columnId="status"
  options={[
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ]}
  placeholder="All statuses"
/>

{/* Multi-select (sends ?filter[status][]=… arrays) */}
<DataTableFilter
  table={table}
  columnId="role"
  type="multiselect"
  options={[
    { label: 'Admin', value: 'admin' },
    { label: 'Editor', value: 'editor' },
  ]}
/>

{/* Text input */}
<DataTableFilter
  table={table}
  columnId="name"
  type="input"
  placeholder="Filter name"
/>

{/* Fully custom — popover, combobox, date picker, anything */}
<DataTableFilter
  table={table}
  columnId="status"
  render={({ value, setValue }) => (
    <MyFancyFilter value={value} onChange={setValue} />
  )}
/>
```

### `<DataTableSplitLayout />`

Predefined "split toolbar" layout that composes `DataTableSearch`, `DataTableFilter`s, `DataTable`, and `DataTablePagination` for you — search left, filters/actions right, table in the middle, pagination info left + controls right.

```tsx
import {
  Button,
  DataTableFilter,
  DataTableSplitLayout,
  useDataTable,
} from '@manusiakemos/laravel-tanstack-react'

const { table, loading, meta } = useDataTable<User>({ /* ... */ })

return (
  <DataTableSplitLayout
    table={table}
    meta={meta}
    loading={loading}
    searchProps={{ placeholder: 'Search users...' }}
    filters={
      <>
        <DataTableFilter table={table} columnId="status" options={statusOpts} />
        <DataTableFilter table={table} columnId="role" type="multiselect" options={roleOpts} />
      </>
    }
    actions={<Button>+ Add user</Button>}
    paginationProps={{ showPageSize: true, showFirstLast: true }}
    tableProps={{ emptyMessage: 'No users found.' }}
  />
)
```

| Prop | Type | Description |
|---|---|---|
| `table` | `Table<TData>` | Required. From `useDataTable`. |
| `meta` | `DataTableMeta \| null` | For the row-count summary. |
| `loading` | `boolean` | Forwarded to `<DataTable />`. |
| `search` | `ReactNode` | Override the entire search slot. |
| `searchProps` | `Partial<DataTableSearchProps>` | Forwarded to the auto-rendered search. |
| `filters` | `ReactNode` | Right-toolbar slot (typically one or more `<DataTableFilter />`s). |
| `actions` | `ReactNode` | Far-right slot for page-level actions (Add button, export, …). |
| `tableProps` | `Partial<DataTableProps>` | Forwarded to `<DataTable />`. |
| `paginationProps` | `Partial<DataTablePaginationProps>` | Forwarded to `<DataTablePagination />`. |
| `className` | `string` | Root wrapper class. |
| `classNames` | `{ root, toolbar, toolbarLeft, toolbarRight, body, footer }` | Fine-grained class names. |

### Shadcn primitives

The bundled primitives are re-exported so you can compose your own UI without pulling in a separate copy:

```ts
import {
  Button, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  cn,
} from '@manusiakemos/laravel-tanstack-react'
```

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
    { accessorKey: 'name', header: 'Name' },
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

## Contributing

Contributions are welcome — bug fixes, new features, docs, and tests.

### Language policy

**All contributions must be in English.** This applies to:

- Source code: identifiers (variables, functions, types, files), string literals, JSX text, UI copy, placeholders, error messages, and log output.
- Comments and JSDoc.
- Documentation: README, examples, code samples, and any other Markdown.
- Commit messages, PR titles, and PR descriptions.
- Issue reports and discussion replies.

This keeps the package usable by the broadest possible audience and consistent for future maintainers. If you need locale-specific copy in your own app, override it on the consumer side (e.g. translate column headers in your call to `useDataTable`); do not localize the package itself.

### Getting set up

```bash
git clone https://github.com/manusiakemos/laravel-tanstack-react.git
cd laravel-tanstack-react
npm install
```

Node 18+ is required.

### Workflow

1. Fork the repo and create a topic branch off `main`:
   ```bash
   git checkout -b fix/short-description
   ```
2. Make your change. Keep the public API surface small and the diff focused.
3. Add or update tests for any behavior change. The suite lives under `tests/` and runs against `happy-dom`.
4. Run the full check locally before opening a PR:
   ```bash
   npm run lint
   npm run format
   npm run typecheck
   npm run test
   npm run build
   ```
5. Update `CHANGELOG.md` under `## [Unreleased]` describing the change (Added / Changed / Fixed / Removed).
6. Open a pull request against `main`. Include:
   - what changed and why
   - any breaking-change notes (call them out explicitly)
   - a code sample if you added a new option or hook

### Commit style

Short, imperative, present tense. Prefix with a conventional scope when useful:

```
feat: add `extraHeaders` option to default fetcher
fix: cancel in-flight request when endpoint changes
docs: clarify Sanctum CSRF requirement
```

### Reporting bugs

Open an issue at [github.com/manusiakemos/laravel-tanstack-react/issues](https://github.com/manusiakemos/laravel-tanstack-react/issues) with:

- a minimal reproduction (CodeSandbox or repo)
- the version of this package, `@tanstack/react-table`, and React you're on
- the actual vs. expected behavior

## Publishing updates

Releases are published to npm under [`@manusiakemos/laravel-tanstack-react`](https://www.npmjs.com/package/@manusiakemos/laravel-tanstack-react). Only maintainers with publish access on the `@manusiakemos` scope can cut a release.

### Versioning

This package follows [Semantic Versioning](https://semver.org/):

- `patch` — bug fix, internal refactor, doc change, no API change
- `minor` — backwards-compatible new feature or new option
- `major` — breaking change to the public API (rename, removal, behavior change)

While the version is `0.x`, breaking changes bump the **minor** segment per SemVer's pre-1.0 convention.

### Release checklist

1. Make sure `main` is clean and all CI checks pass.
2. Move entries under `## [Unreleased]` in `CHANGELOG.md` to a new dated heading:
   ```md
   ## [0.2.0] - 2026-05-27
   ```
   Leave an empty `## [Unreleased]` section at the top for the next cycle.
3. Bump the version. `npm version` updates `package.json`, creates a git commit, and tags the release:
   ```bash
   npm version patch   # or `minor`, or `major`
   ```
4. Push the commit and tag:
   ```bash
   git push origin main --follow-tags
   ```
5. Publish. The `prepublishOnly` script runs `typecheck`, `test`, and `build` automatically — do not skip it:
   ```bash
   npm publish
   ```
   The package is published under `--access public` via `publishConfig`, so no extra flag is needed.
6. Verify the new version is live:
   ```bash
   npm view @manusiakemos/laravel-tanstack-react version
   ```
7. Draft a GitHub release for the new tag and paste the changelog entry into the body.

### Publishing a pre-release

For early feedback on a breaking change, publish under a dist-tag instead of `latest`:

```bash
npm version 0.2.0-beta.0
npm publish --tag next
```

Consumers opt in with `npm install @manusiakemos/laravel-tanstack-react@next`.

### If a publish goes wrong

- **Wrong version published:** do not delete it. Bump again with a patch and publish a corrected build. npm forbids re-publishing the same version.
- **Bad build shipped:** within 72 hours you can `npm deprecate @manusiakemos/laravel-tanstack-react@<version> "use <newer> instead"` to warn installers, then publish a fixed patch.

## License

MIT.
