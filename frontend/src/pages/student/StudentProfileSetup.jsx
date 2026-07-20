import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, User, GraduationCap, Camera } from 'lucide-react'
import api from '@/services/api'
import { markStudentProfileComplete, saveAuthUser, DASHBOARD_PATHS } from '@/utils/auth'
import MediaUpload from '@/components/ui/MediaUpload'
import { Button, SkillsInput } from '@/components/ui'
import { AvatarUpload } from '@/components/common/AvatarUpload'
import { getAssetUrl } from '@/utils/getAssetUrl'

const mapById = (items, idKey, labelKey) =>
  items.reduce((acc, item) => {
    acc[item[idKey]] = item[labelKey]
    return acc
  }, {})

export default function StudentProfileSetup() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [meta, setMeta] = useState({
    categories: [],
    divisions: [],
    skills: [],
    departments: [],
    semesters: [],
    genders: [],
  })
  const [form, setForm] = useState({
    cgpa: '',
    has_backlog: false,
    category_id: '',
    tenth_divison_id: '',
    twelfth_division_id: '',
    image_url: '',
    resume_url: '',
    selectedSkills: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, categories, divisions, skills, departments, semesters, genders] =
          await Promise.all([
            api.get('/students/me'),
            api.get('/categories/'),
            api.get('/divisions/'),
            api.get('/skills/'),
            api.get('/departments/'),
            api.get('/semesters/'),
            api.get('/genders/'),
          ])
        const p = profileRes?.data
        setProfile(p)
        setForm({
          cgpa: p?.cgpa ?? '',
          has_backlog: Boolean(p?.has_backlog),
          category_id: p?.category_id || '',
          tenth_divison_id: p?.tenth_divison_id || p?.tenth_division_id || '',
          twelfth_division_id: p?.twelfth_division_id || '',
          image_url: p?.image_url || '',
          resume_url: p?.resume_url || '',
          selectedSkills: Array.isArray(p?.skill)
            ? p.skill.map((skill) => (typeof skill === 'object' ? skill.skill : skill)).filter(Boolean)
            : [],
        })
        setMeta({
          categories: categories?.data || [],
          divisions: divisions?.data || [],
          skills: skills?.data || [],
          departments: departments?.data || [],
          semesters: semesters?.data || [],
          genders: genders?.data || [],
        })
      } catch (err) {
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const lookups = useMemo(
    () => ({
      categories: mapById(meta.categories, 'category_id', 'category'),
      divisions: mapById(meta.divisions, 'division_id', 'division'),
      departments: mapById(meta.departments, 'department_id', 'dept_name'),
      semesters: mapById(meta.semesters, 'semester_id', 'semester'),
      genders: mapById(meta.genders, 'gender_id', 'gender'),
    }),
    [meta]
  )

  const toggleSkill = (skillName) => {
    setForm((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skillName)
        ? prev.selectedSkills.filter((name) => name !== skillName)
        : [...prev.selectedSkills, skillName],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.put('/students/me', {
        cgpa: Number(form.cgpa),
        has_backlog: form.has_backlog,
        category_id: Number(form.category_id),
        tenth_division_id: Number(form.tenth_divison_id),
        twelfth_division_id: Number(form.twelfth_division_id),
        image_url: form.image_url,
        resume_url: form.resume_url,
        skills: form.selectedSkills.map((skill) => String(skill).trim()).filter(Boolean),
      })

      markStudentProfileComplete(profile.user_id)
      saveAuthUser({ cgpa: form.cgpa, image_url: form.image_url, resume_url: form.resume_url })
      navigate(`${DASHBOARD_PATHS.Student}?view=dashboard`)
    } catch (err) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orbit-bg text-slate-400">
        Loading profile setup...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orbit-bg px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orbit-primary/15">
            <User className="h-7 w-7 text-orbit-primary-light" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Complete Your Profile</h1>
          <p className="mt-2 text-sm text-slate-500">
            Add your academic details, skills, and photo. Your resume will be auto-generated when you apply for jobs.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-orbit-border bg-orbit-surface p-6">
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Camera className="h-4 w-4" /> Profile Photo
            </h2>
            <AvatarUpload
              value={getAssetUrl(form.image_url)}
              onChange={(url) => setForm((p) => ({ ...p, image_url: url }))}
              uploadPath="/uploads/profile"
              initials={(profile?.name || 'S').slice(0, 2)}
              size="2xl"
            />
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Camera className="h-4 w-4" /> Resume
            </h2>
            <MediaUpload
              label="Upload resume"
              value={getAssetUrl(form.resume_url)}
              onChange={(url) => setForm((p) => ({ ...p, resume_url: url }))}
              accept="image/*,application/pdf"
              uploadPath="/uploads/resume"
              hint="Resume file, max 2 MB"
            />
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <GraduationCap className="h-4 w-4" /> Academic Details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs text-slate-400">CGPA *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                  value={form.cgpa}
                  onChange={(e) => setForm((p) => ({ ...p, cgpa: e.target.value }))}
                  className="w-full rounded-lg border border-orbit-border bg-orbit-surface2 px-3 py-2.5 text-sm text-slate-200"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-slate-400">Category *</label>
                <select
                  required
                  value={form.category_id}
                  onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}
                  className="w-full rounded-lg border border-orbit-border bg-orbit-surface2 px-3 py-2.5 text-sm text-slate-200"
                >
                  <option value="">Select category</option>
                  {meta.categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>{c.category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-slate-400">10th Division *</label>
                <select
                  required
                  value={form.tenth_divison_id}
                  onChange={(e) => setForm((p) => ({ ...p, tenth_divison_id: e.target.value }))}
                  className="w-full rounded-lg border border-orbit-border bg-orbit-surface2 px-3 py-2.5 text-sm text-slate-200"
                >
                  <option value="">Select division</option>
                  {meta.divisions.map((d) => (
                    <option key={d.division_id} value={d.division_id}>{d.division}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-slate-400">12th Division *</label>
                <select
                  required
                  value={form.twelfth_division_id}
                  onChange={(e) => setForm((p) => ({ ...p, twelfth_division_id: e.target.value }))}
                  className="w-full rounded-lg border border-orbit-border bg-orbit-surface2 px-3 py-2.5 text-sm text-slate-200"
                >
                  <option value="">Select division</option>
                  {meta.divisions.map((d) => (
                    <option key={d.division_id} value={d.division_id}>{d.division}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-300 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.has_backlog}
                  onChange={(e) => setForm((p) => ({ ...p, has_backlog: e.target.checked }))}
                />
                I have backlog(s)
              </label>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-200">Skills</h2>
            <SkillsInput
              value={form.selectedSkills}
              onChange={(skills) => setForm((p) => ({ ...p, selectedSkills: skills }))}
              placeholder="Type a skill and press comma or Enter..."
            />
            {meta.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {meta.skills
                  .filter((skill) => !form.selectedSkills.includes(skill.skill))
                  .map((skill) => (
                    <button
                      key={skill.skill_id}
                      type="button"
                      onClick={() => toggleSkill(skill.skill)}
                      className="rounded-full border border-orbit-border bg-orbit-surface2 px-3 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      + {skill.skill}
                    </button>
                  ))}
              </div>
            )}
          </section>

          <div className="rounded-lg border border-orbit-border bg-orbit-bg/40 p-4 text-xs text-slate-500">
            <p><strong className="text-slate-300">{profile?.name}</strong> • {profile?.roll_no}</p>
            <p className="mt-1">
              {lookups.departments[profile?.department_id]} • {lookups.semesters[profile?.semester_id]}
            </p>
          </div>

          <Button type="submit" loading={saving} className="w-full" icon={<Save className="h-4 w-4" />}>
            Save & Continue to Dashboard
          </Button>
        </form>
      </div>
    </div>
  )
}
