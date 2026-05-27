# Changelog

All notable changes to `@manusiakemos/laravel-tanstack-react` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Ready-made shadcn-styled components, all customizable via props:
  - `<DataTable />` — full table with sort indicators, empty state, loading state
  - `<DataTableSearch />` — global search with `debounce: boolean | number`; when `debounce={false}` it renders an input + Search button (submits on click / Enter)
  - `<DataTablePagination />` — prev/next, optional first/last, optional page-size selector, customizable labels & `classNames`
  - `<DataTableFilter />` — built-in `select`, `multiselect`, `input` modes, plus a `render` prop for fully custom UI
  - `<DataTableSplitLayout />` — predefined "split toolbar" layout (search left / filters right, pagination info left / controls right) that wires the four components above for you
- Bundled shadcn-style primitives re-exported (`Button`, `Input`, `Select`, `Table`*, `cn`) so consumers can compose their own UI
- `render` prop on every `DataTable*` component for full UI replacement while keeping table wiring
- Runtime deps: `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`
- Initial public release
- `useDataTable<T>()` hook with full TanStack Table integration
- Built-in pagination, sorting, multi-column sorting, global search, per-column filters
- Debounced search (configurable, default 300ms)
- Auto-reset to page 1 when sort/filter/search changes
- In-flight request cancellation via AbortController
- `manual` mode to defer initial fetch
- `refetch()` for programmatic reloads
- Custom fetcher support (axios, ky, Inertia, etc.)
- `extraParams` for static query params (multi-tenancy, scoping)
- `DataTableError` class with status and response body
- Lower-level exports: `buildQueryString`, `defaultFetcher`, `useDebouncedValue`
- Dual ESM/CJS build via tsup
- Full TypeScript types
- Vitest test suite with happy-dom
- Compatible with React 18 and 19
- Compatible with `manusiakemos/laravel-tanstack` 0.1.0+
