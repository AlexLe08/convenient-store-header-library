type ChangeListener = (event: MediaQueryListEvent) => void

const listenersByQuery = new Map<string, Set<ChangeListener>>()
const matchesByQuery = new Map<string, boolean>()

/**
 * Test helper: changes what `matchMedia(query).matches` returns and fires
 * a `change` event so subscribed components re-render.
 */
export function setViewportMatch(query: string, matches: boolean): void {
  matchesByQuery.set(query, matches)
  const event = { matches, media: query } as MediaQueryListEvent
  listenersByQuery.get(query)?.forEach((listener) => listener(event))
}

/** Test helper: resets all mocked matchMedia state. Call in beforeEach. */
export function resetViewportMatches(): void {
  listenersByQuery.clear()
  matchesByQuery.clear()
}

if (typeof window !== 'undefined') {
  window.matchMedia = ((query: string): MediaQueryList => {
    if (!listenersByQuery.has(query)) listenersByQuery.set(query, new Set())
    return {
      get matches() {
        return matchesByQuery.get(query) ?? false
      },
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
        if (type === 'change') {
          listenersByQuery.get(query)!.add(listener as ChangeListener)
        }
      },
      removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
        if (type === 'change') {
          listenersByQuery.get(query)!.delete(listener as ChangeListener)
        }
      },
      dispatchEvent: () => true,
    } as unknown as MediaQueryList
  }) as typeof window.matchMedia
}
