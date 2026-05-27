import { forwardRef, type SelectHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

/**
 * Shadcn-styled native <select>. We use the native element (not Radix) to
 * keep the dependency footprint minimal; consumers who want a Radix-based
 * popover select can swap it in via the `render` prop on the parent
 * component.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, multiple, ...props }, ref) => (
    <select
      ref={ref}
      multiple={multiple}
      className={cn(
        'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        multiple ? 'min-h-[6rem]' : 'h-10',
        className,
      )}
      {...props}
    />
  ),
)
Select.displayName = 'Select'
