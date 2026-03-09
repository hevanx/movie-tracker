import { useState } from 'react'

// Drop-in replacement for useState that syncs to localStorage.
// key    — the localStorage key string
// initial — default value if nothing is stored yet
export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initial
    } catch {
      return initial
    }
  })

  const set = (newValue) => {
    try {
      const resolved =
        typeof newValue === 'function' ? newValue(value) : newValue
      localStorage.setItem(key, JSON.stringify(resolved))
      setValue(resolved)
    } catch {
      // localStorage is unavailable (private browsing quota, etc.) — fail silently
    }
  }

  return [value, set]
}
