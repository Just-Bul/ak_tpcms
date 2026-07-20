import api from './api'

async function fetchStudentProfile(userId) {
  try {
    const res = await api.get(`/students/${userId}`)
    return res?.data || null
  } catch {
    return null
  }
}

/** SuperAdmin: full list. Coordinator: aggregate from applications. */
export async function fetchStudentsForRole() {
  try {
    const res = await api.get('/students/')
    const list = Array.isArray(res?.data) ? res.data : []
    return list.map(normalizeStudentRow)
  } catch {
    return fetchStudentsFromApplications()
  }
}

async function fetchStudentsFromApplications() {
  const [placementApps, trainingApps] = await Promise.all([
    api.get('/placement-applications').catch(() => ({ data: [] })),
    api.get('/training-applications').catch(() => ({ data: [] })),
  ])

  const ids = new Set()
  ;[...(placementApps?.data || []), ...(trainingApps?.data || [])].forEach((app) => {
    if (app.student_id) ids.add(app.student_id)
  })

  const profiles = await Promise.all([...ids].map(fetchStudentProfile))
  const unique = new Map()
  profiles.filter(Boolean).forEach((p) => unique.set(p.user_id, normalizeStudentRow(p)))
  return [...unique.values()]
}

function normalizeStudentRow(user) {
  return {
    user_id: user.user_id,
    roll_no: user.roll_no || 'N/A',
    name: user.name || 'Unknown',
    department_id: user.department_id,
    department_name:
      user.department_name ||
      user.department_table?.dept_name ||
      'Not Assigned',
    semester_id: user.semester_id,
    cgpa: user.cgpa ?? null,
    email: user.email || user.user_table?.email || '',
    mobile_no: user.mobile_no || user.user_table?.mobile_no || '',
    is_active: user.is_active !== false,
    has_backlog: Boolean(user.has_backlog),
    image_url: user.image_url || '',
  }
}

export function filterStudents(students, { search = '', departmentId = '' } = {}) {
  const q = search.trim().toLowerCase()
  return students.filter((s) => {
    const matchSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      String(s.roll_no).toLowerCase().includes(q)
    const matchDept =
      !departmentId || String(s.department_id) === String(departmentId)
    return matchSearch && matchDept
  })
}

export async function disableStudent(userId) {
  return api.put(`/students/${userId}`, { is_graduate: true })
}
