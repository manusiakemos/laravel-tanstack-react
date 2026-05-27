// Main hook
export { useDataTable } from './hooks/useDataTable'
export type {
  UseDataTableOptions,
  UseDataTableResult,
} from './hooks/useDataTable'

// Ready-made, shadcn-styled components — customizable via props
export { DataTable } from './components/DataTable'
export type {
  DataTableProps,
  DataTableClassNames,
} from './components/DataTable'

export { DataTableSearch } from './components/DataTableSearch'
export type {
  DataTableSearchProps,
  DataTableSearchRenderProps,
  DataTableSearchDebounce,
} from './components/DataTableSearch'

export { DataTablePagination } from './components/DataTablePagination'
export type {
  DataTablePaginationProps,
  DataTablePaginationLabels,
  DataTablePaginationClassNames,
  DataTablePaginationRenderProps,
} from './components/DataTablePagination'

export { DataTableFilter } from './components/DataTableFilter'
export type {
  DataTableFilterProps,
  DataTableFilterOption,
  DataTableFilterRenderProps,
  DataTableFilterValue,
} from './components/DataTableFilter'

// Shadcn-style UI primitives — re-exported so consumers can use them
// directly (or swap them for their own).
export { Button, buttonVariants } from './components/ui/button'
export type { ButtonProps } from './components/ui/button'
export { Input } from './components/ui/input'
export type { InputProps } from './components/ui/input'
export { Select } from './components/ui/select'
export type { SelectProps } from './components/ui/select'
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from './components/ui/table'

// Utilities
export { cn } from './lib/cn'

// Types
export {
  DataTableError,
} from './types'
export type {
  DataTableFetcher,
  DataTableMeta,
  DataTableRequestParams,
  DataTableResponse,
} from './types'

// Lower-level utilities, exported for advanced users.
export { buildQueryString } from './adapters/buildQueryString'
export type { BuildQueryStringInput } from './adapters/buildQueryString'
export { defaultFetcher } from './utils/defaultFetcher'
export { useDebouncedValue } from './utils/useDebouncedValue'
