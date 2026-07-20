/**
 * Resume-only fields (objective, links, projects, internships, certificates, languages,
 * hobbies) have no backend columns on student_table — persisting them server-side would
 * require a schema change, which is out of scope. They're kept in localStorage per student,
 * same fallback pattern already used elsewhere in the app (company profile extras, etc).
 */
const KEY_PREFIX = 'resume_extras_'

export const emptyResumeExtras = () => ({
  objective: '',
  address: '',
  github: '',
  linkedin: '',
  portfolio: '',
  languages: '',
  hobbies: '',
  declaration: true,
  skills: [],
  projects: [],
  internships: [],
  certificates: [],
})

export function getResumeExtras(userId) {
  try {
    const raw = localStorage.getItem(`${KEY_PREFIX}${userId}`)
    return raw ? { ...emptyResumeExtras(), ...JSON.parse(raw) } : emptyResumeExtras()
  } catch {
    return emptyResumeExtras()
  }
}

export function saveResumeExtras(userId, extras) {
  localStorage.setItem(`${KEY_PREFIX}${userId}`, JSON.stringify(extras))
}
