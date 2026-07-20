import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { Card, CardHeader, CardBody, Button } from '@/components/ui'
import { AlertCircle, Briefcase, Plus, Loader2 } from 'lucide-react'
import MediaUpload from '@/components/ui/MediaUpload'

export default function PlacementForm({ onSuccess }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Master options
  const [divisions, setDivisions] = useState([])
  const [categories, setCategories] = useState([])
  const [semesters, setSemesters] = useState([])
  const [departments, setDepartments] = useState([])
  const [loadingMasters, setLoadingMasters] = useState(true)

  const [form, setForm] = useState({
    title: '',
    description: '',
    min_cgpa: '',
    last_date_of_submission: '',
    image_url: '',
    is_active: true,
    min_tenth_division_id: '',
    min_twelfth_division_id: '',
    has_backlog: false,
    salary_lower: '',
    salary_upper: '',
    only_category: [],
    only_semester: [],
    only_department: [],
    start_date: '',
    end_date: '',
  })

  // Load master data
  useEffect(() => {
    const loadMasters = async () => {
      try {
        setLoadingMasters(true)
        const [divsRes, catsRes, semsRes, deptsRes] = await Promise.all([
          api.get('/masters/divisions').catch(() => []),
          api.get('/masters/categories').catch(() => []),
          api.get('/masters/semesters').catch(() => []),
          api.get('/departments').catch(() => []),
        ])

        setDivisions(divsRes?.data?.data ?? divsRes?.data ?? divsRes ?? [])
        setCategories(catsRes?.data?.data ?? catsRes?.data ?? catsRes ?? [])
        setSemesters(semsRes?.data?.data ?? semsRes?.data ?? semsRes ?? [])
        setDepartments(deptsRes?.data?.data ?? deptsRes?.data ?? deptsRes ?? [])
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
        image_url: form.image_url || undefined,
        last_date_of_submission: form.last_date_of_submission
          ? new Date(form.last_date_of_submission).toISOString()
          : undefined,
        is_active: form.is_active,
        min_tenth_division_id: form.min_tenth_division_id
          ? parseInt(form.min_tenth_division_id)
          : undefined,
        min_twelfth_division_id: form.min_twelfth_division_id
          ? parseInt(form.min_twelfth_division_id)
          : undefined,
        has_backlog: form.has_backlog,
        salary_lower: form.salary_lower ? parseInt(form.salary_lower) : undefined,
        salary_upper: form.salary_upper ? parseInt(form.salary_upper) : undefined,
        only_category: form.only_category.map((id) => parseInt(id)),
        only_semester: form.only_semester.map((id) => parseInt(id)),
        only_department: form.only_department.map((id) => parseInt(id)),
        start_date: form.start_date ? new Date(form.start_date).toISOString() : undefined,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : undefined,
      }

      await api.post('/placements', payload)
      setSuccess('Placement/Job posted successfully!')
      
      // Reset form
      setForm({
        title: '',
        description: '',
        min_cgpa: '',
        last_date_of_submission: '',
        image_url: '',
        is_active: true,
        min_tenth_division_id: '',
        min_twelfth_division_id: '',
        has_backlog: false,
        salary_lower: '',
        salary_upper: '',
        only_category: [],
        only_semester: [],
        only_department: [],
        start_date: '',
        end_date: '',
      })

      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message || 'Failed to post job.')
    } finally {
      setSaving(false)
    }
  }

  if (loadingMasters) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading job form configuration...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
          <AlertCircle size={14} /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400">
          <Briefcase size={14} /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Job Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={update('title')}
              required
              placeholder="e.g. Associate Software Engineer"
              className="auth-input w-full rounded-lg border border-orbit-border bg-orbit-surface2 px-4 py-2.5 text-sm text-slate-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Minimum CGPA</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={form.min_cgpa}
              onChange={update('min_cgpa')}
              placeholder="e.g. 7.50"
              className="auth-input w-full rounded-lg border border-orbit-border bg-orbit-surface2 px-4 py-2.5 text-sm text-slate-200"
            />
          </div>

          <div className="flex items-center mt-6">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.has_backlog}
                onChange={update('has_backlog')}
                className="h-4 w-4 rounded border-orbit-border bg-orbit-surface2 text-orbit-primary outline-none"
              />
              Allow active backlogs?
            </label>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Salary Range (Lower Limit)</label>
            <input
              type="number"
              value={form.salary_lower}
              onChange={update('salary_lower')}
              placeholder="e.g. 600000"
              className="auth-input w-full rounded-lg border border-orbit-border bg-orbit-surface2 px-4 py-2.5 text-sm text-slate-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Salary Range (Upper Limit)</label>
            <input
              type="number"
              value={form.salary_upper}
              onChange={update('salary_upper')}
              placeholder="e.g. 1200000"
              className="auth-input w-full rounded-lg border border-orbit-border bg-orbit-surface2 px-4 py-2.5 text-sm text-slate-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Minimum Class 10th Division</label>
            <select
              value={form.min_tenth_division_id}
              onChange={update('min_tenth_division_id')}
              className="appearance-none w-full px-4 py-2.5 rounded-lg bg-orbit-surface2 border border-orbit-border text-sm text-slate-200 outline-none"
            >
              <option value="" className="bg-orbit-surface">No division criteria</option>
              {divisions.map((div) => (
                <option key={div.division_id} value={div.division_id} className="bg-orbit-surface">
                  {div.division}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Minimum Class 12th Division</label>
            <select
              value={form.min_twelfth_division_id}
              onChange={update('min_twelfth_division_id')}
              className="appearance-none w-full px-4 py-2.5 rounded-lg bg-orbit-surface2 border border-orbit-border text-sm text-slate-200 outline-none"
            >
              <option value="" className="bg-orbit-surface">No division criteria</option>
              {divisions.map((div) => (
                <option key={div.division_id} value={div.division_id} className="bg-orbit-surface">
                  {div.division}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Start Date</label>
            <input
              type="date"
              value={form.start_date}
              onChange={update('start_date')}
              className="auth-input w-full rounded-lg border border-orbit-border bg-orbit-surface2 px-4 py-2.5 text-sm text-slate-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">End Date</label>
            <input
              type="date"
              value={form.end_date}
              onChange={update('end_date')}
              className="auth-input w-full rounded-lg border border-orbit-border bg-orbit-surface2 px-4 py-2.5 text-sm text-slate-200"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Last Date of Submission *</label>
            <input
              type="date"
              value={form.last_date_of_submission}
              onChange={update('last_date_of_submission')}
              required
              className="auth-input w-full rounded-lg border border-orbit-border bg-orbit-surface2 px-4 py-2.5 text-sm text-slate-200"
            />
          </div>
        </div>

        {/* Target filters */}
        <div className="border-t border-orbit-border pt-5 space-y-6">
          {/* Target Departments */}
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

          {/* Target Categories */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider">Target Categories (Select all applicable)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <label
                  key={cat.category_id}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    form.only_category.includes(cat.category_id)
                      ? 'border-orbit-primary/45 bg-orbit-primary/5 text-slate-200 font-medium'
                      : 'border-orbit-border bg-orbit-surface hover:bg-white/3 text-slate-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.only_category.includes(cat.category_id)}
                    onChange={() => handleCheckboxChange('only_category', cat.category_id)}
                    className="h-3.5 w-3.5 rounded border-orbit-border bg-orbit-surface2 text-orbit-primary outline-none"
                  />
                  {cat.category}
                </label>
              ))}
            </div>
          </div>

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
                  Semester {sem.semester}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Media Upload & Description */}
        <div className="border-t border-orbit-border pt-5 space-y-4">
          <MediaUpload
            label="Job Banner / Notification Image"
            value={form.image_url}
            uploadPath="/uploads/banner"
            onChange={(url) => setForm((p) => ({ ...p, image_url: url }))}
            accept="image/*"
          />

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Description</label>
            <textarea
              value={form.description}
              onChange={update('description')}
              rows={4}
              placeholder="e.g. Roles, responsibilities, package details, selection process..."
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
          Post Placement / Job
        </Button>
      </form>
    </div>
  )
}
