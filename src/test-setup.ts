import '@testing-library/jest-dom'
import { expect } from 'vitest'
import * as axeMatchers from 'vitest-axe/matchers'
import './test-match-media'

expect.extend(axeMatchers)

// Node 22.4+ ships an experimental localStorage that shadows jsdom's.
// The stub has no clear/getItem/setItem/removeItem, so we replace it.
function createMemoryStorage(): Storage {
  let store = new Map<string, string>()
  return {
    get length() {
      return store.size
    },
    clear() {
      store = new Map()
    },
    getItem(key: string) {
      return store.has(key) ? (store.get(key) as string) : null
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null
    },
    removeItem(key: string) {
      store.delete(key)
    },
    setItem(key: string, value: string) {
      store.set(key, String(value))
    },
  }
}

function patchStorage(name: 'localStorage' | 'sessionStorage'): void {
  if (typeof window === 'undefined') return
  try {
    const existing = (window as unknown as Record<string, unknown>)[name] as
      Partial<Storage> | undefined
    const isWorking =
      existing &&
      typeof existing.clear === 'function' &&
      typeof existing.getItem === 'function' &&
      typeof existing.setItem === 'function' &&
      typeof existing.removeItem === 'function'
    if (isWorking) return

    const storage = createMemoryStorage()
    const assignStorage = (target: object): void => {
      const record = target as Record<string, unknown>
      record[name] = storage
    }
    for (const target of [window, globalThis]) {
      try {
        Object.defineProperty(target, name, {
          value: storage,
          configurable: true,
          writable: true,
        })
      } catch {
        try {
          assignStorage(target)
        } catch {
          // Fallback failed; nothing more we can do.
        }
      }
    }
  } catch {
    // Never let setup crash the test run.
  }
}

patchStorage('localStorage')
patchStorage('sessionStorage')
