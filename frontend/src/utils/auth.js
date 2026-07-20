/** Backend role names → frontend sidebar role keys */
export const BACKEND_TO_UI_ROLE = {
  SuperAdmin: 'Super Admin',
  Coordinator: 'Coordinator',
  Organization: 'Company',
  Student: 'Student',
}

export const UI_TO_BACKEND_ROLE = {
  'Super Admin': 'SuperAdmin',
  'Coordinator': 'Coordinator',
  'Company': 'Organization',
  'Student': 'Student',
}

export const ROLE_ID_MAP = {
  'Super Admin': 1,
  'Student': 2,
  'Coordinator': 3,
  'Company': 4,
}

export const DASHBOARD_PATHS = {
  'Super Admin': '/super-admin/dashboard',
  'Coordinator': '/coordinator/dashboard',
  'Company': '/company/dashboard',
  'Student': '/students/dashboard',
}

export function getAuth() {
  try {
    return JSON.parse(localStorage.getItem('auth_user') || '{}')
  } catch {
    return {}
  }
}

export function getAuthUser() {
  return getAuth()?.user || {}
}

export function normalizeUiRole(user = getAuthUser()) {
  const raw = user?.role_table?.role || user?.role || ''
  return BACKEND_TO_UI_ROLE[raw] || raw || 'Student'
}

export function saveAuthUser(userPatch) {
  const auth = getAuth()
  const nextUser = { ...auth.user, ...userPatch }
  localStorage.setItem(
    'auth_user',
    JSON.stringify({
      ...auth,
      user: nextUser,
      token: nextUser.auth_token || auth.token,
    })
  )
  return nextUser
}

export function isStudentProfileComplete(profile) {
  if (!profile) return false
  return Boolean(
    profile.cgpa != null &&
      profile.category_id &&
      profile.image_url &&
      profile.resume_url &&
      (profile.tenth_divison_id || profile.tenth_division_id) &&
      profile.twelfth_division_id
  )
}

export function isCompanyProfileComplete(user = getAuthUser()) {
  const key = `company_profile_setup_${user.user_id}`
  if (localStorage.getItem(key) === '1') return true
  return Boolean(user.name && user.approval_id === 1)
}

export function markCompanyProfileComplete(userId) {
  localStorage.setItem(`company_profile_setup_${userId}`, '1')
}

export function markStudentProfileComplete(userId) {
  localStorage.setItem(`student_profile_setup_${userId}`, '1')
}

export function needsProfileSetup(uiRole, user = getAuthUser()) {
  if (uiRole === 'Student') {
    const key = `student_profile_setup_${user.user_id}`
    if (localStorage.getItem(key) === '1') return false
    return !user.cgpa || !user.image_url
  }
  if (uiRole === 'Company') {
    if (user.approval_id === 0) return false
    return !isCompanyProfileComplete(user)
  }
  return false
}
