import { Navigate, Outlet } from 'react-router-dom';
import { normalizeUiRole } from '@/utils/auth';

/**
 * @param {{ allowedRoles: string[]; children?: React.ReactNode }} props
 */
export function AppRoute({ allowedRoles, children }) {
  const auth = JSON.parse(localStorage.getItem('auth_user') || '{}')
  const role = normalizeUiRole(auth?.user)

  // Not logged in
  if (!auth?.token) {
    return <Navigate to="/sign-in" replace />
  }

  // Logged in but role mismatch
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/" replace />
    }
  }

  return children ? children : <Outlet />
}

