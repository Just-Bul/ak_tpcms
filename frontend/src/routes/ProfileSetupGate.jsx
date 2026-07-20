import { Navigate, useLocation } from 'react-router-dom'
import { normalizeUiRole, needsProfileSetup, getAuthUser } from '@/utils/auth'

export default function ProfileSetupGate({ children }) {
  const location = useLocation()
  const user = getAuthUser()
  const uiRole = normalizeUiRole(user)

  if (!needsProfileSetup(uiRole, user)) {
    return children
  }

  const setupPaths = {
    Student: '/students/profile-setup',
    Company: '/company/profile-setup',
  }

  const setupPath = setupPaths[uiRole]
  if (setupPath && location.pathname !== setupPath) {
    return <Navigate to={setupPath} replace />
  }

  return children
}
