import { useEffect, useState } from 'react'
import api from '@/services/api'

const ENDPOINTS = {
  departments: '/departments/',
  divisions: '/divisions/',
  genders: '/genders/',
  semesters: '/semesters/',
  categories: '/categories/',
  skills: '/skills/',
}

let cache = null
let inFlight = null

async function loadAll() {
  const entries = Object.entries(ENDPOINTS)
  const settled = await Promise.allSettled(entries.map(([, path]) => api.get(path)))
  const data = {}
  let anyFailed = false
  entries.forEach(([key], i) => {
    const result = settled[i]
    if (result.status === 'fulfilled') {
      data[key] = result.value?.data ?? []
    } else {
      data[key] = []
      anyFailed = true
    }
  })
  return { data, anyFailed }
}

/**
 * Single cached fetch of all reference/master data (departments, divisions, genders,
 * semesters, categories, skills), replacing the duplicated Promise.all([...]) boilerplate
 * previously copy-pasted across AddStudents, EditStudent, ProfileView, PlacementForm,
 * TrainingForm, CompanyProfile, etc.
 *
 * The result is only cached permanently once every endpoint succeeds — if the backend was
 * briefly unreachable (e.g. mid-restart), a partial/empty result is shown for that mount but
 * NOT cached, so the next component to use this hook retries instead of being stuck with
 * permanently-empty dropdowns for the rest of the browser session.
 */
export function useMasterData(keys) {
  const [data, setData] = useState(cache || {})
  const [loading, setLoading] = useState(!cache)

  useEffect(() => {
    if (cache) return
    let cancelled = false
    if (!inFlight) inFlight = loadAll()
    inFlight.then(({ data: result, anyFailed }) => {
      if (anyFailed) {
        inFlight = null // allow the next mount to retry instead of reusing this failed attempt
      } else {
        cache = result
      }
      if (!cancelled) {
        setData(result)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!keys) return { data, loading }
  const subset = Object.fromEntries(keys.map((k) => [k, data[k] || []]))
  return { data: subset, loading }
}

/** id → label map helper, replacing copy-pasted `mapById` in multiple files. */
export function mapById(list = [], idKey, labelKey) {
  const map = new Map()
  list.forEach((item) => map.set(item[idKey], item[labelKey]))
  return map
}

export default useMasterData
