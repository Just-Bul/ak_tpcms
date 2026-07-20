import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { Card, CardHeader, CardBody, Button } from '@/components/ui'
import { AlertCircle, BookOpenCheck, Plus, Loader2 } from 'lucide-react'
import MediaUpload from '@/components/ui/MediaUpload'

export default function TrainingForm({ onSuccess }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // User Role
  const authUser = JSON.parse(
    sessionStorage.getItem('auth_user') || localStorage.getItem('auth_user') || '{}'
  )
  const role = authUser?.user?.role || ''

  // Master options
  const [semesters, setSemesters] = useState([])
  const [departments, setDepartments] = useState([])
  const [loadingMasters, setLoadingMasters] = useState(true)

  const [form, setForm] = useState({
    title: '',
    description: '',
    min_cgpa: '',
    start_date: '',
    end_date: '',
    last_date_of_submission: '',
    image_url: '',
    is_active: true,
    only_semester: [],
    only_department: [],
  })

  // Load master data
  useEffect(() => {
    const loadMasters = async () => {
      try {
        setLoadingMasters(true)
        const [semsRes, deptsRes] = await Promise.all([
          api.get('/semesters').catch(() => ({ data: [] })),
          api.get('/departments').catch(() => ({ data: [] })),
        ])

        setSemesters(semsRes?.data || [])
        setDepartments(deptsRes?.data || [])
      } catch (err) {
        setError('Failed to load form master criteria.')
      } finally {
        setLoadingMasters(false)
      }
    }
    loadMasters()
  }, [])

  const update = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [field]: val })
    setSuccess('')
    setError('')
  }

  const handleCheckboxChange = (field, id) => {
    const current = form[field]
    const updated = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id]
    setForm({ ...form, [field]: updated })
    setSuccess('')
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const payload = {
        title: form.title,
        description: form.description || undefined,
        min_cgpa: form.min_cgpa ? parseFloat(form.min_cgpa) : undefined,
        start_date: form.start_date ? new Date(form.start_date).toISOString() : undefined,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : undefined,
        last_date_of_submission: form.last_date_of_submission
          ? new Date(form.last_date_of_submission).toISOString()
          : undefined,
        image_url: form.image_url || undefined,
        is_active: form.is_active,
        only_semester: form.only_semester,
        only_department: role === 'Super Admin' ? form.only_department : [],
      }

      await api.post('/trainings', payload)

      setSuccess('Training program posted successfully.')
      setForm({
        title: '',
        description: '',
        min_cgpa: '',
        start_date: '',
        end_date: '',
        last_date_of_submission: '',
        image_url: '',
        is_active: true,
        only_semester: [],
        only_department: [],
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err.message || 'Failed to submit training program.')
    } finally {
      setSaving(false)
    }
  }

  if (loadingMasters) {
    return (
      <div className="flex items-center justify-center gap-3 py-16 text-slate-400 text-sm">
        <Loader2 className="animate-spin" size={16} /> Loading master fields...
      </div>
    )
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-400">
          <BookOpenCheck size={14} className="shrink-0" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Training Title *</label>
            <input
              required
              type="text"
              value={form.title}
              onChange={update('title')}
              placeholder="e.g. Full Stack Web Development Boot Camp"
              className="auth-input w-full rounded-lg border border-orbit-border bg-orbit-surface2 px-4 py-2.5 text-sm text-slate-200"
            />
          </div>

          {/* Min CGPA */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Minimum CGPA Criteria</label>
            <input
              type="number"
              step="0.01"
              value={form.min_cgpa}
              onChange={update('min_cgpa')}
              placeholder="e.g. 6.5"
              className="auth-input w-full rounded-lg border border-orbit-border bg-orbit-surface2 px-4 py-2.5 text-sm text-slate-200"
            />
          </div>

          {/* Submission Deadline */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Submission Deadline</label>
            <input
              type="date"
              value={form.last_date_of_submission}
              onChange={update('last_date_of_submission')}
              className="auth-input w-full rounded-lg border border-orbit-border bg-orbit-surface2 px-4 py-2.5 text-sm text-slate-200"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Start Date</label>
            <input
              type="date"
              value={form.start_date}
              onChange={update('start_date')}
              className="auth-input w-full rounded-lg border border-orbit-border bg-orbit-surface2 px-4 py-2.5 text-sm text-slate-200"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">End Date</label>
            <input
              type="date"
              value={form.end_date}
              onChange={update('end_date')}
              className="auth-input w-full rounded-lg border border-orbit-border bg-orbit-surface2 px-4 py-2.5 text-sm text-slate-200"
            />
          </div>
        </div>

        {/* Dynamic Targets */}
        <div className="border-t border-orbit-border pt-5 space-y-6">
          {/* Target Departments */}
          {role === 'Super Admin' && (
            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider">Target Departments (Select all applicable)</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {departments.map((dept) => (
                  <label
                    key={dept.department_id}
                    className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      form.only_department.includes(dept.department_id)
                        ? 'border-orbit-primary/45 bg-orbit-primary/5 text-slate-200 font-medium'
                        : 'border-orbit-border bg-orbit-surface hover:bg-white/3 text-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.only_department.includes(dept.department_id)}
                      onChange={() => handleCheckboxChange('only_department', dept.department_id)}
                      className="h-3.5 w-3.5 rounded border-orbit-border bg-orbit-surface2 text-orbit-primary outline-none"
                    />
                    {dept.department_name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Target Semesters */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider">Target Semesters (Select all applicable)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {semesters.map((sem) => (
                <label
                  key={sem.semester_id}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    form.only_semester.includes(sem.semester_id)
                      ? 'border-orbit-primary/45 bg-orbit-primary/5 text-slate-200 font-medium'
                      : 'border-orbit-border bg-orbit-surface hover:bg-white/3 text-slate-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.only_semester.includes(sem.semester_id)}
                    onChange={() => handleCheckboxChange('only_semester', sem.semester_id)}
                    className="h-3.5 w-3.5 rounded border-orbit-border bg-orbit-surface2 text-orbit-primary outline-none"
                  />
                  {sem.semester_name || `Semester ${sem.semester}`}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Media Upload & Description */}
        <div className="border-t border-orbit-border pt-5 space-y-4">
          <MediaUpload
            label="Training Banner / Notification Image"
            value={form.image_url}
            uploadPath="/uploads/banner"
            onChange={(url) => setForm((p) => ({ ...p, image_url: url }))}
            accept="image/*"
          />

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Description *</label>
            <textarea
              required
              value={form.description}
              onChange={update('description')}
              rows={4}
              placeholder="Provide a comprehensive description of the training program, topics covered, schedule, etc..."
              className="auth-input w-full resize-none rounded-lg border border-orbit-border bg-orbit-surface2 px-4 py-2.5 text-sm text-slate-200"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={update('is_active')}
                className="h-4 w-4 rounded border-orbit-border bg-orbit-surface2 text-orbit-primary outline-none"
              />
              Publish immediately? (Active)
            </label>
          </div>
        </div>

        <Button type="submit" loading={saving} icon={<Plus size={14} />} className="w-full">
          Post Training Program
        </Button>
      </form>
    </div>
  )
}
