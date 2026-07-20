import { useEffect, useState } from 'react'
import DashboardShell from '@/components/DashboardShell'
import { Card, CardHeader, CardBody, Button } from '@/components/ui'
import { Calendar, Loader2, AlertCircle, Clock, FileDown } from 'lucide-react'
import { api } from '@/services/api'
import { downloadInterviewLetter } from '@/utils/interviewLetter'

/**
 * Interview Scheduler (item 28) — moved from company-only to shared so Coordinator and
 * SuperAdmin can also schedule interviews ("Coordinator/Admin can Schedule interview" per the
 * brief; this was previously wired only into the Company role's sidebar). Candidates are drawn
 * from GET /placement-applications, which the backend already scopes to placements the current
 * user created — so each role only sees candidates for their own postings, same as everywhere
 * else in the app. Browser-local stub (localStorage) since no backend interview model exists.
 */
export default function ScheduleInterviewsPage() {
  const [interviews, setInterviews] = useState([])
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    application_id: '',
    date: '',
    time: '',
    mode: 'Online',
    meeting_link: '',
    offline_location: '',
    notes: '',
  })

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
  }

  useEffect(() => {
    const loadInterviewsAndCandidates = async () => {
      try {
        setLoading(true)
        setError('')

        const stored = localStorage.getItem('company_interviews')
        const parsed = stored ? JSON.parse(stored) : []
        setInterviews(parsed)

        const result = await api.get('/placement-applications')
        const data = result?.data || result || []
        const shortlisted = data
          .filter((app) => app.status_id === 2)
          .map((app) => ({
            application_id: `${app.placement_id}-${app.student_id}`,
            student_name: app.student_table?.user_table?.name || 'Student',
            job_title: app.placement_table?.title || 'Placement Job',
          }))
        setCandidates(shortlisted)
      } catch (err) {
        setError(err.message || 'Failed to load interviews and candidates')
      } finally {
        setLoading(false)
      }
    }
    loadInterviewsAndCandidates()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)

      const cand = candidates.find((c) => c.application_id === form.application_id)
      const studentName = cand ? cand.student_name : 'Candidate'
      const jobTitle = cand ? cand.job_title : 'Job Post'
      const studentId = form.application_id.split('-')[1]

      const newInterview = {
        interview_id: Date.now(),
        application_id: form.application_id,
        student_id: studentId ? Number(studentId) : null,
        student_name: studentName,
        job_title: jobTitle,
        date: form.date,
        time: form.time,
        mode: form.mode,
        meeting_link: form.meeting_link,
        offline_location: form.offline_location,
        notes: form.notes,
      }

      const updated = [newInterview, ...interviews]
      localStorage.setItem('company_interviews', JSON.stringify(updated))
      setInterviews(updated)
      setShowForm(false)
      setForm({
        application_id: '',
        date: '',
        time: '',
        mode: 'Online',
        meeting_link: '',
        offline_location: '',
        notes: '',
      })
    } catch (err) {
      setError(err.message || 'Failed to schedule interview')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardShell title="Schedule Interviews" subtitle="Manage interview schedules for candidates">
      <Card>
        <CardHeader
          title="Interview Schedule"
          subtitle={`${interviews.length} scheduled interviews`}
          actions={
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'Schedule Interview'}
            </Button>
          }
        />
        <CardBody>
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 mb-4">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-lg border border-orbit-border bg-orbit-surface2 space-y-4">
              <h3 className="text-sm font-semibold text-slate-200">New Interview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Candidate *</label>
                  <select
                    value={form.application_id}
                    onChange={update('application_id')}
                    required
                    className="appearance-none w-full px-4 py-2.5 pr-8 rounded-lg bg-orbit-surface2 border border-orbit-border text-sm text-slate-200 cursor-pointer outline-none"
                  >
                    <option value="" className="bg-orbit-surface">Select a Candidate</option>
                    {candidates.map((cand) => (
                      <option key={cand.application_id} value={cand.application_id} className="bg-orbit-surface">
                        {cand.student_name} ({cand.job_title})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={update('date')}
                    required
                    className="auth-input w-full px-4 py-2.5 rounded-lg bg-orbit-surface2 border border-orbit-border text-sm text-slate-200 placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Time *</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={update('time')}
                    required
                    className="auth-input w-full px-4 py-2.5 rounded-lg bg-orbit-surface2 border border-orbit-border text-sm text-slate-200 placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Mode</label>
                  <div className="relative">
                    <select
                      value={form.mode}
                      onChange={update('mode')}
                      className="appearance-none w-full px-4 py-2.5 pr-8 rounded-lg bg-orbit-surface2 border border-orbit-border text-sm text-slate-200 cursor-pointer outline-none"
                    >
                      <option value="Online" className="bg-orbit-surface">Online</option>
                      <option value="Offline" className="bg-orbit-surface">Offline</option>
                    </select>
                  </div>
                </div>
                {form.mode === 'Offline' ? (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Offline Location</label>
                    <input
                      type="text"
                      value={form.offline_location}
                      onChange={update('offline_location')}
                      className="auth-input w-full px-4 py-2.5 rounded-lg bg-orbit-surface2 border border-orbit-border text-sm text-slate-200 placeholder-slate-600"
                      placeholder="e.g. Block A, Room 204, Campus Address"
                    />
                  </div>
                ) : (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Meeting Link</label>
                    <input
                      type="url"
                      value={form.meeting_link}
                      onChange={update('meeting_link')}
                      className="auth-input w-full px-4 py-2.5 rounded-lg bg-orbit-surface2 border border-orbit-border text-sm text-slate-200 placeholder-slate-600"
                      placeholder="https://meet.example.com/..."
                    />
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={update('notes')}
                    rows={2}
                    className="auth-input w-full px-4 py-2.5 rounded-lg bg-orbit-surface2 border border-orbit-border text-sm text-slate-200 placeholder-slate-600 resize-none"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              <Button type="submit" loading={saving}>
                Schedule Interview
              </Button>
            </form>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 text-slate-400 py-8">
              <Loader2 size={18} className="animate-spin" /> Loading interviews...
            </div>
          )}

          {!loading && interviews.length === 0 && !error && !showForm && (
            <div className="flex items-center gap-2 text-sm text-slate-500 py-8">
              <Clock size={18} /> No interviews scheduled yet.
            </div>
          )}

          {!loading && interviews.length > 0 && (
            <div className="space-y-3">
              {interviews.map((interview, i) => (
                <div
                  key={interview.interview_id || interview.id || i}
                  className="flex items-center justify-between p-4 rounded-lg border border-orbit-border hover:border-orbit-border2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 flex-shrink-0">
                      <Calendar size={16} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {interview.student_name || `Application ${interview.application_id}`}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {interview.job_title || interview.position || 'Position'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-200">
                      {interview.date ? new Date(interview.date).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {interview.time || ''} {interview.mode ? `• ${interview.mode}` : ''}
                    </p>
                    {interview.mode === 'Offline' && interview.offline_location && (
                      <p className="text-[10px] text-slate-500 mt-1">{interview.offline_location}</p>
                    )}
                    {interview.mode !== 'Offline' && interview.meeting_link && (
                      <a
                        href={interview.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-orbit-primary-light hover:text-orbit-accent mt-1 inline-block"
                      >
                        Join Link
                      </a>
                    )}
                    <Button
                      size="xs"
                      variant="outline"
                      icon={<FileDown size={12} />}
                      className="mt-2"
                      onClick={() => downloadInterviewLetter(interview)}
                    >
                      Letter
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </DashboardShell>
  )
}
