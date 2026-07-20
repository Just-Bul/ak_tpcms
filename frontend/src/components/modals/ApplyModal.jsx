import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Pencil, ArrowRight, FileText, AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Loading } from '@/components/common/Loading'
import { Button, Badge } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import api from '@/services/api'
import { regenerateAndAttachResume } from '@/services/resume'
import { applyToPlacement, applyToTraining } from '@/services/applications'
import { DASHBOARD_PATHS } from '@/utils/auth'

/**
 * Apply flow (items 6, 11, 33): Apply -> Profile Summary (Edit Profile / Continue) ->
 * Application Preview (student/resume/CGPA/backlog/skills/company/job, Edit / Submit) ->
 * auto-generate the latest resume PDF from the current profile -> attach it (PUT
 * /students/me resume_url, an existing endpoint) -> submit the application. The student
 * never has to manually generate or upload a resume.
 */
export function ApplyModal({ open, onClose, opportunity, type, onApplied }) {
  const navigate = useNavigate()
  const { role, userId } = useAuth()
  const [step, setStep] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setStep('profile')
    setError('')
    setLoading(true)
    api
      .get('/students/me')
      .then((res) => setStudent(res.data))
      .catch((err) => setError(err.message || 'Failed to load profile'))
      .finally(() => setLoading(false))
  }, [open])

  const goEditProfile = () => {
    onClose()
    navigate(`${DASHBOARD_PATHS[role]}?view=profile`)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      await regenerateAndAttachResume(student, userId)
      if (type === 'Placement') {
        await applyToPlacement({ placement_id: opportunity.placement_id })
      } else {
        await applyToTraining({ training_id: opportunity.training_id })
      }
      onApplied?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to submit application.')
    } finally {
      setSubmitting(false)
    }
  }

  const missingCgpa = student && (student.cgpa === null || student.cgpa === undefined)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={step === 'profile' ? 'Confirm Your Profile' : 'Review Application'}
      icon={<CheckCircle2 size={18} />}
      size="md"
      footer={
        step === 'profile' ? (
          <>
            <Button variant="outline" icon={<Pencil size={15} />} onClick={goEditProfile}>Edit Profile</Button>
            <Button icon={<ArrowRight size={15} />} onClick={() => setStep('preview')} disabled={loading || !student}>Continue</Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => setStep('profile')}>Back</Button>
            <Button loading={submitting} icon={<CheckCircle2 size={15} />} onClick={handleSubmit}>
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </>
        )
      }
    >
      {loading || !opportunity ? (
        <Loading label="Loading your profile..." />
      ) : error && !student ? (
        <p className="text-sm text-orbit-danger">{error}</p>
      ) : step === 'profile' ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Review your profile before applying — this is what the company will see.</p>
          <div className="grid grid-cols-2 gap-3">
            <ProfileField label="Name" value={student.name} />
            <ProfileField label="Department" value={student.department} />
            <ProfileField label="CGPA" value={student.cgpa ?? 'Not set'} warn={missingCgpa} />
            <ProfileField label="Backlog" value={student.has_backlog ? 'Yes' : 'No'} />
          </div>
          {student.skill?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-1.5">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {student.skill.map((s) => <Badge key={s} variant="primary">{s}</Badge>)}
              </div>
            </div>
          )}
          {missingCgpa && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
              <AlertTriangle size={14} /> Your CGPA isn't set — some opportunities filter on it. Consider updating your profile.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {error && <p className="text-sm text-orbit-danger">{error}</p>}
          <div className="rounded-xl border border-orbit-border bg-orbit-surface2/40 p-4">
            <p className="text-xs text-slate-500">Applying to</p>
            <p className="text-sm font-semibold text-orbit-text-primary">{opportunity.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {opportunity.organization_table?.user_table?.name || 'Company'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ProfileField label="Student" value={student.name} />
            <ProfileField label="CGPA" value={student.cgpa ?? 'N/A'} />
            <ProfileField label="Backlog" value={student.has_backlog ? 'Yes' : 'No'} />
            <ProfileField label="Skills" value={student.skill?.length ? `${student.skill.length} listed` : 'None'} />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-orbit-border bg-orbit-surface2/40 p-3 text-xs text-slate-400">
            <FileText size={14} className="text-orbit-primary-light flex-shrink-0" />
            Your latest resume will be generated automatically from this profile and attached to the application.
          </div>
        </div>
      )}
    </Modal>
  )
}

function ProfileField({ label, value, warn }) {
  return (
    <div className="rounded-lg border border-orbit-border bg-orbit-surface2/40 p-3">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className={`text-sm font-medium mt-0.5 ${warn ? 'text-amber-400' : 'text-orbit-text-primary'}`}>{value}</p>
    </div>
  )
}

export default ApplyModal
