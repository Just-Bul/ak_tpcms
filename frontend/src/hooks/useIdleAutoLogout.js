import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const DEFAULT_IDLE_MS = 12 * 60 * 60 * 1000

/**
 * Logs out user after `idleMs` of inactivity.
 * Inactivity = no mouse movement, clicks, key presses, or touch.
 */
export default function useIdleAutoLogout({ idleMs = DEFAULT_IDLE_MS } = {}) {
  const navigate = useNavigate()
  const timerRef = useRef(null)
  const lastActiveRef = useRef(0)


  useEffect(() => {
    if (!idleMs || idleMs <= 0) return undefined

    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    const resetTimer = () => {
      lastActiveRef.current = Date.now()
      clearTimer()
      timerRef.current = setTimeout(() => {
        localStorage.removeItem('auth_user')
        navigate('/sign-in', { replace: true })
      }, idleMs)
    }

    const onActivity = () => resetTimer()

    // Do not log out on passive events like scroll.
    lastActiveRef.current = Date.now()

    window.addEventListener('mousemove', onActivity)

    window.addEventListener('mousedown', onActivity)
    window.addEventListener('keydown', onActivity)
    window.addEventListener('touchstart', onActivity, { passive: true })
    window.addEventListener('click', onActivity)

    resetTimer()

    return () => {
      clearTimer()
      window.removeEventListener('mousemove', onActivity)
      window.removeEventListener('mousedown', onActivity)
      window.removeEventListener('keydown', onActivity)
      window.removeEventListener('touchstart', onActivity)
      window.removeEventListener('click', onActivity)
    }
  }, [idleMs, navigate])
}

