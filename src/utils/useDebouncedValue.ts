import { useEffect, useState } from 'react'

/**
 * Debounce a value. Useful for search inputs to avoid one HTTP request
 * per keystroke. Default delay is 300ms.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(handle)
  }, [value, delay])

  return debounced
}
