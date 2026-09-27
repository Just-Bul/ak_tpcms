import { useEffect, useState} from 'react'
import { Download, Mail, Phone, Building2, GraduationCap, Award, Calendar, VenusAndMars } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Loading } from '@/components/common/Loading'
import { Badge, Avatar, Button } from '@/components/ui'
import api from '@/services/api'
import { getAssetUrl } from '@/utils/getAssetUrl'
import { formatDate } from '@/utils/formatDateTime'

/**
 * Shared student profile detail — replaces the near-duplicate full-page StudentDetails
 * views previously hand-built separately per role. GET /students/:id returns a flat
 * shape (email, mobile_no, name, department, gender, cgpa, semester, skill[], ...),
 * not the nested user_table/department_table shape the list endpoint returns.
 */
export function StudentDetailModal({ open, onClose, studentId }) {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !studentId) return
    let cancelled = false
    setLoading(true)
    setError('')
    api
      .get(`/students/${studentId}`)
      .then((res) => {
        if (!cancelled) setStudent(res?.data || null)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load student')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, studentId])

  return (
    <Modal open={open} onClose={onClose} title="Student Profile" size="lg">
      {loading ? (
        <Loading label="Loading student..." />
      ) : error ? (
        <p className="text-sm text-orbit-danger">{error}</p>
      ) : !student ? (
        <p className="text-sm text-slate-500">Student not found.</p>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar
              size="2xl"
              src={getAssetUrl(student.image_url)}
              initials={(student.name || 'S').slice(0, 2)}
            />
            <div>
              <h3 className="text-lg font-semibold text-orbit-text-primary">{student.name}</h3>
              <p className="text-sm text-slate-500">{student.roll_no}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {student.department && (
                  <Badge variant="neutral"><Building2 size={11} className="mr-1" />{student.department}</Badge>
                )}
                {student.semester && (
                  <Badge variant="neutral"><GraduationCap size={11} className="mr-1" />Semester {student.semester}</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatTile icon={<Award size={16} />} label="CGPA" value={student.cgpa ?? 'N/A'} />
            <StatTile icon={<VenusAndMars size={16} />} label="Gender" value={student.gender || '—'} />
            <StatTile icon={<Calendar size={16} />} label="Date of Birth" value={formatDate(student.date_of_birth)} />
            <StatTile icon={<Award size={16} />} label="Category" value={student.category || '—'} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <ContactRow icon={<Mail size={16} />} label="Email" value={student.email} />
            <ContactRow icon={<Phone size={16} />} label="Mobile" value={student.mobile_no} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-orbit-border bg-orbit-surface2/40 p-4">
              <p className="text-xs text-slate-500 mb-1">10th Division</p>
              <p className="text-sm font-medium text-orbit-text-primary">{student.tenth_division || '—'}</p>
            </div>
            <div className="rounded-xl border border-orbit-border bg-orbit-surface2/40 p-4">
              <p className="text-xs text-slate-500 mb-1">12th Division</p>
              <p className="text-sm font-medium text-orbit-text-primary">{student.twelfth_division || '—'}</p>
            </div>
          </div>

          {Array.isArray(student.skill) && student.skill.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {student.skill.map((s) => (
                  <Badge key={s} variant="primary">{s}</Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Resume</p>
            {student.resume_url ? (
              <Button
                variant="outline"
                icon={<Download size={16} />}
                onClick={() => window.open(getAssetUrl(student.resume_url), '_blank', 'noopener,noreferrer')}
              >
                Download Resume
              </Button>
            ) : (
              <p className="text-sm text-slate-500">No resume uploaded.</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

function StatTile({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-orbit-border bg-orbit-surface2/40 p-3 text-center">
      <div className="flex items-center justify-center text-orbit-primary-light mb-1">{icon}</div>
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-orbit-text-primary truncate">{value}</p>
    </div>
  )
}

function ContactRow({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-orbit-border bg-orbit-surface2/40 p-4 flex items-center gap-3">
      <span className="text-orbit-primary-light">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-orbit-text-primary truncate">{value || '—'}</p>
      </div>
    </div>
  )
}

export default StudentDetailModal
