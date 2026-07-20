import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  const auth = JSON.parse(localStorage.getItem('auth_user') || '{}')

  if (!auth?.token) {
    return <Navigate to="/sign-in" replace />
  }

  return <Outlet />
}
