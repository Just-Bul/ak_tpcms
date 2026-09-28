import { useCallback, useEffect, useState } from 'react'

export function useFetchList(fetcher, { enabled = true } = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)
  const [version, setVersion] = useState(0)

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

        const result = await fetcher()

        console.log('useFetchList RESULT:', result)
        console.log(
          'useFetchList RESULT IS ARRAY:',
          Array.isArray(result)
        )
        console.log(
          'useFetchList RESULT LENGTH:',
          Array.isArray(result)
            ? result.length
            : 'NOT ARRAY'
        )

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
  }, [enabled, version, fetcher])

  return {
    data,
    setData,
    loading,
    error,
    refetch,
  }
}

export default useFetchList