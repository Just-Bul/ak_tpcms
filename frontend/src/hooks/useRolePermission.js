import { useAuth } from '@/hooks/useAuth'

/**
 * Role-gate helper for shared pages, e.g.:
 *   const { can, role } = useRolePermission()
 *   {can('SuperAdmin', 'Coordinator') && <Button>Add Student</Button>}
 */
export function useRolePermission() {
  const { role } = useAuth()

  return {
    role,
    can: (...allowedRoles) => allowedRoles.includes(role),
    isSuperAdmin: role === 'Super Admin',
    isCoordinator: role === 'Coordinator',
    isCompany: role === 'Company',
    isStudent: role === 'Student',
  }
}

export default useRolePermission
