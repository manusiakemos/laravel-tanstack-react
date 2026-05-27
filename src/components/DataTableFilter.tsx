import type { Column, Table } from '@tanstack/react-table'
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react'

import { cn } from '../lib/cn'
import { Input } from './ui/input'
import { Select } from './ui/select'

export type DataTableFilterValue = string | string[] | undefined

export interface DataTableFilterOption {
  label: string
  value: string
}

export interface DataTableFilterRenderProps<TData> {
  /** The current filter value for this column. */
  value: DataTableFilterValue
  /** Commit a new filter value (use `undefined` or `''` to clear). */
  setValue: (next: DataTableFilterValue) => void
  /** The TanStack column instance. */
  column: Column<TData, unknown>
  /** The parent table instance. */
  table: Table<TData>
}

interface BaseFilterProps<TData> {
  table: Table<TData>
  /** The column id this filter applies to. */
  columnId: string
  /** Class for the root element (when not using `render`). */
  className?: string
  /**
   * Full render override. You get the raw column filter value + setter, so
   * any UI (popover, multi-select combobox, date picker, …) can be plugged
   * in while still feeding the same TanStack column filter pipeline.
   */
  render?: (props: DataTableFilterRenderProps<TData>) => ReactNode
}

interface SelectFilterProps<TData> extends BaseFilterProps<TData> {
  type?: 'select'
  options: DataTableFilterOption[]
  /** Placeholder option label (renders an empty value option). */
  placeholder?: string
  /** Whether to render the empty/placeholder option. Defaults to true. */
  includeEmptyOption?: boolean
  selectProps?: Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    'value' | 'onChange' | 'className'
  >
}

interface MultiSelectFilterProps<TData> extends BaseFilterProps<TData> {
  type: 'multiselect'
  options: DataTableFilterOption[]
  selectProps?: Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    'value' | 'onChange' | 'multiple' | 'className'
  >
}

interface InputFilterProps<TData> extends BaseFilterProps<TData> {
  type: 'input'
  placeholder?: string
  inputProps?: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'type' | 'className'
  >
}

interface CustomFilterProps<TData> extends BaseFilterProps<TData> {
  type?: 'custom'
  /** Required when `type` is `"custom"` (or when no `options` given). */
  render: (props: DataTableFilterRenderProps<TData>) => ReactNode
}

export type DataTableFilterProps<TData> =
  | SelectFilterProps<TData>
  | MultiSelectFilterProps<TData>
  | InputFilterProps<TData>
  | CustomFilterProps<TData>

/**
 * Shadcn-styled per-column filter wired to a TanStack `Table`.
 *
 * Supports four modes:
 *   - `type="select"` — single-select (default when `options` given)
 *   - `type="multiselect"` — multi-select
 *   - `type="input"` — text input
 *   - `type="custom"` (or `render`) — fully custom UI
 *
 * @example Select
 * <DataTableFilter
 *   table={table}
 *   columnId="status"
 *   options={[
 *     { label: 'Active', value: 'active' },
 *     { label: 'Inactive', value: 'inactive' },
 *   ]}
 *   placeholder="All statuses"
 * />
 *
 * @example Custom render
 * <DataTableFilter
 *   table={table}
 *   columnId="status"
 *   render={({ value, setValue }) => (
 *     <MyCustomFilter value={value} onChange={setValue} />
 *   )}
 * />
 */
export function DataTableFilter<TData>(props: DataTableFilterProps<TData>) {
  const { table, columnId, className, render } = props
  const column = table.getColumn(columnId)

  if (!column) {
    if (typeof console !== 'undefined') {
      console.warn(
        `[DataTableFilter] Column "${columnId}" not found on table. ` +
          `Make sure a column with this id exists.`,
      )
    }
    return null
  }

  const value = column.getFilterValue() as DataTableFilterValue
  const setValue = (next: DataTableFilterValue) => {
    if (
      next === undefined ||
      next === '' ||
      (Array.isArray(next) && next.length === 0)
    ) {
      column.setFilterValue(undefined)
    } else {
      column.setFilterValue(next)
    }
  }

  if (render) {
    return <>{render({ value, setValue, column, table })}</>
  }

  // Multi-select
  if (props.type === 'multiselect') {
    const arrayValue = Array.isArray(value)
      ? value
      : value
        ? [String(value)]
        : []
    return (
      <Select
        multiple
        value={arrayValue}
        onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions).map((o) => o.value)
          setValue(selected)
        }}
        className={cn('w-auto min-w-[10rem]', className)}
        {...props.selectProps}
      >
        {props.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    )
  }

  // Text input
  if (props.type === 'input') {
    return (
      <Input
        type="text"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => setValue(e.target.value)}
        placeholder={props.placeholder}
        className={cn('w-auto min-w-[10rem]', className)}
        {...props.inputProps}
      />
    )
  }

  // Default: single-select. Only valid if `options` was provided.
  if ('options' in props && props.options) {
    const includeEmpty = props.includeEmptyOption ?? true
    return (
      <Select
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => setValue(e.target.value)}
        className={cn('w-auto min-w-[10rem]', className)}
        {...props.selectProps}
      >
        {includeEmpty && (
          <option value="">{props.placeholder ?? 'All'}</option>
        )}
        {props.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    )
  }

  if (typeof console !== 'undefined') {
    console.warn(
      `[DataTableFilter] No "options" or "render" prop provided for column ` +
        `"${columnId}". Nothing will render.`,
    )
  }
  return null
}
