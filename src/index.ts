// Main hook
export { useDataTable } from './hooks/useDataTable'
export type {
  UseDataTableOptions,
  UseDataTableResult,
} from './hooks/useDataTable'

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

// Lower-level utilities, exported for advanced users who want to build
// their own hooks or use the adapter standalone.
export { buildQueryString } from './adapters/buildQueryString'
export type { BuildQueryStringInput } from './adapters/buildQueryString'
export { defaultFetcher } from './utils/defaultFetcher'
export { useDebouncedValue } from './utils/useDebouncedValue'
