import { useCallback, useEffect, useRef, useState } from 'react'

export function useFetchList(fetcher, { enabled = true } = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)
  const [version, setVersion] = useState(0)

  // Store fetcher in a ref so we always call the latest version
  // without needing it in the dependency array (which causes infinite loops
  // when callers pass inline arrow functions)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const refetch = useCallback(() => {
    setVersion((v) => v + 1)
  }, [])

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await fetcherRef.current()

        if (!cancelled) {
          setData(
            Array.isArray(result)
              ? result
              : []
          )
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : String(err)
          )
          setData([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [enabled, version])

  return {
    data,
    setData,
    loading,
    error,
    refetch,
  }
}

export default useFetchList