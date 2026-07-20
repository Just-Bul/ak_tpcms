import api from './api'
import { generateResumePdfBlob } from '@/utils/generateResumePdf'
import { getResumeExtras } from '@/utils/resumeExtras'

/**
 * Regenerates the resume PDF from the student's current profile + saved resume extras,
 * uploads it via the existing /uploads/resume endpoint, and persists the returned URL via
 * PUT /students/me (both already-existing, unchanged backend endpoints). Returns the new
 * resume_url. Used by the Resume page's "Save" action and by the auto-attach-on-apply flow
 * (item 33) so an application always carries the latest resume without the student having
 * to manually regenerate it first.
 *
 * `userId` must be passed explicitly — GET /students/me returns a flat profile shape with
 * no user_id field, so the caller supplies it from the authenticated session (useAuth()).
 */
export async function regenerateAndAttachResume(student, userId) {
  const extras = getResumeExtras(userId)
  const blob = await generateResumePdfBlob(student, extras)
  const file = new File([blob], `${(student.name || 'resume').replace(/\s+/g, '_')}_resume.pdf`, {
    type: 'application/pdf',
  })

  const uploadRes = await api.upload('/uploads/resume', file)
  const resumeUrl = uploadRes?.fileUrl || uploadRes?.data?.fileUrl
  if (!resumeUrl) {
    throw new Error('Failed to get resume URL from upload response.')
  }

  await api.put('/students/me', { resume_url: resumeUrl })
  return resumeUrl
}

export default regenerateAndAttachResume
