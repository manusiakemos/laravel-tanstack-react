import { Search as SearchIcon } from 'lucide-react'
import type { Table } from '@tanstack/react-table'
import {
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  useEffect,
  useState,
} from 'react'

import { cn } from '../lib/cn'
import { useDebouncedValue } from '../utils/useDebouncedValue'
import { Button } from './ui/button'
import { Input } from './ui/input'

export interface DataTableSearchRenderProps {
  /** Current uncommitted input value (pre-debounce / pre-submit). */
  value: string
  /** Update the input value (debounced commit if `debounce` is on). */
  setValue: (next: string) => void
  /** Immediately commit the current value to the table's global filter. */
  submit: () => void
  /** The value currently applied to the table's global filter. */
  appliedValue: string
}

export type DataTableSearchDebounce = boolean | number

export interface DataTableSearchProps<TData> {
  table: Table<TData>
  /**
   * Debounce behavior:
   *   - `true`  → debounced with default delay (300ms)
   *   - number  → debounced with the given delay in ms
   *   - `false` → no debounce; instead the component renders a Search button
   *               and only commits to the table on submit (button click / Enter)
   *
   * Defaults to `true`.
   */
  debounce?: DataTableSearchDebounce
  /** Placeholder text for the default input. */
  placeholder?: string
  /** Label for the search submit button (when `debounce` is `false`). */
  submitLabel?: ReactNode
  /** Class for the root wrapper element (ignored when `render` is provided). */
  className?: string
  /** Class merged into the underlying shadcn Input. */
  inputClassName?: string
  /** Class merged into the submit Button (when `debounce` is `false`). */
  buttonClassName?: string
  /** Extra props spread onto the underlying Input. */
  inputProps?: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'type' | 'className'
  >
  /** Fired whenever the search value is committed to the table. */
  onSearch?: (value: string) => void
  /**
   * Full render override. Receives the controlled value, setter, and a manual
   * `submit()` so you can drop in any custom UI.
   */
  render?: (props: DataTableSearchRenderProps) => ReactNode
}

const DEFAULT_DEBOUNCE_MS = 300

/**
 * Debounced (or manual-submit) global search wired to a TanStack `Table`.
 *
 * @example Debounced (default)
 * <DataTableSearch table={table} placeholder="Search users..." />
 *
 * @example Manual submit (search button)
 * <DataTableSearch table={table} debounce={false} placeholder="Search..." />
 *
 * @example Custom UI
 * <DataTableSearch
 *   table={table}
 *   render={({ value, setValue, submit }) => (
 *     <MyCombobox value={value} onChange={setValue} onSubmit={submit} />
 *   )}
 * />
 */
export function DataTableSearch<TData>(props: DataTableSearchProps<TData>) {
  const {
    table,
    debounce = true,
    placeholder = 'Search...',
    submitLabel,
    className,
    inputClassName,
    buttonClassName,
    inputProps,
    onSearch,
    render,
  } = props

  const isDebounced = debounce !== false
  const debounceMs =
    typeof debounce === 'number' ? debounce : DEFAULT_DEBOUNCE_MS

  const appliedValue = (table.getState().globalFilter as string | undefined) ?? ''
  const [value, setValue] = useState(appliedValue)
  const debounced = useDebouncedValue(value, debounceMs)

  const commit = (next: string) => {
    if (next === appliedValue) return
    table.setGlobalFilter(next)
    onSearch?.(next)
  }

  // Debounced auto-commit. Disabled entirely when `debounce={false}`.
  useEffect(() => {
    if (!isDebounced) return
    commit(debounced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, isDebounced, table])

  // Keep local state in sync if the table's filter is changed elsewhere.
  useEffect(() => {
    setValue(appliedValue)
  }, [appliedValue])

  const submit = () => commit(value)

  if (render) {
    return <>{render({ value, setValue, submit, appliedValue })}</>
  }

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    submit()
  }

  // Debounced mode → just an input, no form / button needed.
  if (isDebounced) {
    return (
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn(className, inputClassName)}
        {...inputProps}
      />
    )
  }

  // Manual mode → input + submit button, wrapped in a form so Enter submits.
  return (
    <form
      onSubmit={handleFormSubmit}
      className={cn('flex w-full max-w-md items-center gap-2', className)}
    >
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={inputClassName}
        {...inputProps}
      />
      <Button type="submit" className={buttonClassName}>
        {submitLabel ?? (
          <>
            <SearchIcon className="h-4 w-4" aria-hidden="true" />
            <span>Search</span>
          </>
        )}
      </Button>
    </form>
  )
}
