import { useMemo, useSyncExternalStore } from 'react'
import { getAuth, getAuthUser, normalizeUiRole } from '@/utils/auth'

const listeners = new Set()

function subscribe(callback) {
  listeners.add(callback)
  window.addEventListener('storage', callback)
  return () => {
    listeners.delete(callback)
    window.removeEventListener('storage', callback)
  }
}

function getSnapshot() {
  return localStorage.getItem('auth_user')
}

/** Notify in-tab subscribers after code in this tab writes auth_user (storage event only fires cross-tab). */
export function notifyAuthChanged() {
  listeners.forEach((cb) => cb())
}

/** Single source of truth for the logged-in user, replacing ad hoc localStorage reads across the app. */
export function useAuth() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  return useMemo(() => {
    const auth = getAuth()
    const user = getAuthUser()
    return {
      auth,
      user,
      token: auth?.token || '',
      role: normalizeUiRole(user),
      userId: user?.user_id,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw])
}

export default useAuth
