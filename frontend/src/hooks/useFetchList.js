import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Generic list-fetching hook, replacing the copy-pasted
 * useState+useEffect+try/catch/finally pattern used across list pages.
 * Fetches once on mount (and whenever `enabled` flips true); call `refetch()` to re-run.
 *
 * @param {() => Promise<any[]>} fetcher
 * @param {{ enabled?: boolean }} options
 */
export function useFetchList(fetcher, { enabled = true } = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)
  const [version, setVersion] = useState(0)
  const fetcherRef = useRef(fetcher)

  useEffect(() => {
    fetcherRef.current = fetcher
  })

  const refetch = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetcherRef
      .current()
      .then((result) => {
        if (!cancelled) setData(Array.isArray(result) ? result : [])
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [enabled, version])

  return { data, setData, loading, error, refetch }
}

export default useFetchList
