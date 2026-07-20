import { useEffect, useRef, useState } from 'react'
import { Download, Save, Loader2, ChevronDown, Plus, Trash2 } from 'lucide-react'
import DashboardShell from '@/components/DashboardShell'
import { Card, CardBody, Button, Input, Textarea, SkillsInput } from '@/components/ui'
import { Loading } from '@/components/common/Loading'
import { ResumeDocument } from '@/components/resume/ResumeDocument'
import { useAuth } from '@/hooks/useAuth'
import api from '@/services/api'
import { generateResumePdfBlob } from '@/utils/generateResumePdf'
import { getResumeExtras, saveResumeExtras, emptyResumeExtras } from '@/utils/resumeExtras'

const emptyProject = { title: '', technology: '', description: '', github: '', live: '' }
const emptyInternship = { company: '', role: '', duration: '', description: '' }
const emptyCertificate = { title: '', issuer: '', year: '' }

/**
 * Unified Resume page (items 9/10) — replaces the separate "Resume Builder" form page and
 * "Resume Preview" page. Opening it immediately fetches the profile and renders the resume;
 * the extra resume-only fields (objective, links, projects, internships, certificates — none
 * of which exist on student_table) live in an optional, collapsed-by-default "Edit Details"
 * panel instead of a separate page, and persist to localStorage (see utils/resumeExtras.js).
 */
export default function ResumePage() {
  const { userId } = useAuth()
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState(null)
  const [extras, setExtras] = useState(emptyResumeExtras())
  const [editing, setEditing] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [saving, setSaving] = useState(false)
  const previewRef = useRef(null)

  useEffect(() => {
    api
      .get('/students/me')
      .then((res) => setStudent(res.data))
      .catch(() => setStudent(null))
      .finally(() => setLoading(false))
    setExtras(getResumeExtras(userId))
  }, [userId])

  const updateExtras = (patch) => setExtras((prev) => ({ ...prev, ...patch }))
  const persistExtras = (next) => {
    setExtras(next)
    saveResumeExtras(userId, next)
  }

  const listOps = (key, empty) => ({
    add: () => persistExtras({ ...extras, [key]: [...extras[key], { ...empty }] }),
    remove: (i) => persistExtras({ ...extras, [key]: extras[key].filter((_, idx) => idx !== i) }),
    update: (i, field, value) => {
      const list = extras[key].map((item, idx) => (idx === i ? { ...item, [field]: value } : item))
      persistExtras({ ...extras, [key]: list })
    },
  })
  const projectOps = listOps('projects', emptyProject)
  const internshipOps = listOps('internships', emptyInternship)
  const certificateOps = listOps('certificates', emptyCertificate)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const blob = await generateResumePdfBlob(student, extras)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${(student.name || 'resume').replace(/\s+/g, '_')}_resume.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const handleSaveToProfile = async () => {
    setSaving(true)
    try {
      const blob = await generateResumePdfBlob(student, extras)
      const file = new File([blob], `${(student.name || 'resume').replace(/\s+/g, '_')}_resume.pdf`, { type: 'application/pdf' })
      const uploadRes = await api.upload('/uploads/resume', file)
      const resumeUrl = uploadRes?.fileUrl || uploadRes?.data?.fileUrl
      if (!resumeUrl) throw new Error('Upload did not return a file URL.')
      await api.put('/students/me', { resume_url: resumeUrl })
      setStudent((prev) => ({ ...prev, resume_url: resumeUrl }))
      alert('Resume saved to your profile.')
    } catch (err) {
      alert(err.message || 'Failed to save resume.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardShell title="Resume">
        <Loading label="Generating your resume..." />
      </DashboardShell>
    )
  }

  if (!student) {
    return (
      <DashboardShell title="Resume">
        <Card><CardBody><p className="text-sm text-orbit-danger">Failed to load your profile.</p></CardBody></Card>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell title="Resume" subtitle="Automatically generated from your profile — ATS-friendly, one page">
      <div className="space-y-6">
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outline" onClick={() => setEditing((e) => !e)} icon={<ChevronDown size={16} className={editing ? 'rotate-180 transition-transform' : 'transition-transform'} />}>
            {editing ? 'Hide Details' : 'Edit Details'}
          </Button>
          <Button
            variant="outline"
            disabled={downloading}
            icon={downloading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            onClick={handleDownload}
          >
            {downloading ? 'Downloading...' : 'Download PDF'}
          </Button>
          <Button disabled={saving} icon={saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} onClick={handleSaveToProfile}>
            {saving ? 'Saving...' : 'Save to Profile'}
          </Button>
        </div>

        {editing && (
          <Card>
            <CardBody className="space-y-6">
              <Textarea label="Career Objective" rows={4} value={extras.objective} onChange={(e) => updateExtras({ objective: e.target.value })} onBlur={() => persistExtras(extras)} />
              <Textarea label="Permanent Address" rows={2} value={extras.address} onChange={(e) => updateExtras({ address: e.target.value })} onBlur={() => persistExtras(extras)} />

              <div className="grid gap-4 md:grid-cols-3">
                <Input label="GitHub" value={extras.github} onChange={(e) => updateExtras({ github: e.target.value })} onBlur={() => persistExtras(extras)} />
                <Input label="LinkedIn" value={extras.linkedin} onChange={(e) => updateExtras({ linkedin: e.target.value })} onBlur={() => persistExtras(extras)} />
                <Input label="Portfolio" value={extras.portfolio} onChange={(e) => updateExtras({ portfolio: e.target.value })} onBlur={() => persistExtras(extras)} />
              </div>

              <SkillsInput label="Technical Skills" value={extras.skills} onChange={(skills) => persistExtras({ ...extras, skills })} />

              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Languages" placeholder="English, Hindi" value={extras.languages} onChange={(e) => updateExtras({ languages: e.target.value })} onBlur={() => persistExtras(extras)} />
                <Input label="Hobbies" value={extras.hobbies} onChange={(e) => updateExtras({ hobbies: e.target.value })} onBlur={() => persistExtras(extras)} />
              </div>

              <ListSection
                title="Projects"
                items={extras.projects}
                ops={projectOps}
                empty={emptyProject}
                renderFields={(item, i) => (
                  <>
                    <Input label="Project Title" value={item.title} onChange={(e) => projectOps.update(i, 'title', e.target.value)} />
                    <Input label="Tools / Technology Used (optional)" value={item.technology} onChange={(e) => projectOps.update(i, 'technology', e.target.value)} />
                    <Textarea label="Description" rows={3} value={item.description} onChange={(e) => projectOps.update(i, 'description', e.target.value)} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Link (optional)" value={item.github} onChange={(e) => projectOps.update(i, 'github', e.target.value)} />
                      <Input label="Live/Demo (optional)" value={item.live} onChange={(e) => projectOps.update(i, 'live', e.target.value)} />
                    </div>
                  </>
                )}
              />

              <ListSection
                title="Internships"
                items={extras.internships}
                ops={internshipOps}
                empty={emptyInternship}
                renderFields={(item, i) => (
                  <>
                    <Input label="Company" value={item.company} onChange={(e) => internshipOps.update(i, 'company', e.target.value)} />
                    <Input label="Role" value={item.role} onChange={(e) => internshipOps.update(i, 'role', e.target.value)} />
                    <Input label="Duration" placeholder="Jan 2025 - Mar 2025" value={item.duration} onChange={(e) => internshipOps.update(i, 'duration', e.target.value)} />
                    <Textarea label="Description" rows={3} value={item.description} onChange={(e) => internshipOps.update(i, 'description', e.target.value)} />
                  </>
                )}
              />

              <ListSection
                title="Certificates"
                items={extras.certificates}
                ops={certificateOps}
                empty={emptyCertificate}
                renderFields={(item, i) => (
                  <>
                    <Input label="Certificate Name" value={item.title} onChange={(e) => certificateOps.update(i, 'title', e.target.value)} />
                    <Input label="Issued By" value={item.issuer} onChange={(e) => certificateOps.update(i, 'issuer', e.target.value)} />
                    <Input label="Year" value={item.year} onChange={(e) => certificateOps.update(i, 'year', e.target.value)} />
                  </>
                )}
              />
            </CardBody>
          </Card>
        )}

        <div className="rounded-xl overflow-hidden shadow-xl">
          <ResumeDocument ref={previewRef} student={student} extras={extras} />
        </div>
      </div>
    </DashboardShell>
  )
}

function ListSection({ title, items, ops, renderFields }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-orbit-text-primary">{title}</h3>
        <Button type="button" size="sm" icon={<Plus size={14} />} onClick={ops.add}>Add</Button>
      </div>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-orbit-border p-4 space-y-3">
            <div className="flex justify-end">
              <Button type="button" size="xs" variant="destructive" icon={<Trash2 size={13} />} onClick={() => ops.remove(i)} />
            </div>
            {renderFields(item, i)}
          </div>
        ))}
      </div>
    </div>
  )
}
