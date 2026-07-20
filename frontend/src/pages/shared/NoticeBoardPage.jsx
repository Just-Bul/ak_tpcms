import { useMemo, useState } from 'react'
import { Megaphone, Plus, Trash2 } from 'lucide-react'
import DashboardShell from '@/components/DashboardShell'
import { Card, CardBody, Button, Input, Textarea } from '@/components/ui'
import { EmptyState } from '@/components/common/EmptyState'
import { SearchBar } from '@/components/common/SearchBar'
import { useAuth } from '@/hooks/useAuth'
import { useRolePermission } from '@/hooks/useRolePermission'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDateTime } from '@/utils/formatDateTime'

const STORAGE_KEY = 'tpcms_notice_board'

function loadNotices() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveNotices(notices) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notices))
}

/**
 * Notices (announcement board) — genuinely separate from Note Share (NoticesPage.jsx),
 * which uploads/shares files against the real note_table API. There is no backend table
 * for plain-text announcements, so this is a browser-local stub (same pattern as
 * ScheduleInterviewsPage) — every user on this browser sees the same list since it's
 * stored under one shared localStorage key, but it won't sync across devices/browsers
 * until a real `notice_table` + API exists (see backend/NEW_TABLES.sql for the schema).
 */
export default function NoticeBoardPage() {
  const { user } = useAuth()
  const { can } = useRolePermission()
  const canCreate = can('Super Admin', 'Coordinator')

  const [notices, setNotices] = useState(() => loadNotices())
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [form, setForm] = useState({ title: '', message: '' })
  const [error, setError] = useState('')

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    const sorted = [...notices].sort((a, b) => new Date(b.created_on) - new Date(a.created_on))
    if (!q) return sorted
    return sorted.filter(
      (n) => (n.title || '').toLowerCase().includes(q) || (n.message || '').toLowerCase().includes(q)
    )
  }, [notices, debouncedSearch])

  const handlePost = () => {
    if (!form.title.trim() || !form.message.trim()) {
      setError('Title and message are required.')
      return
    }
    setError('')
    const notice = {
      notice_id: Date.now(),
      title: form.title.trim(),
      message: form.message.trim(),
      creator_name: user?.name || 'Staff',
      created_on: new Date().toISOString(),
    }
    const next = [notice, ...notices]
    setNotices(next)
    saveNotices(next)
    setForm({ title: '', message: '' })
  }

  const handleDelete = (notice) => {
    if (!window.confirm('Delete this notice?')) return
    const next = notices.filter((n) => n.notice_id !== notice.notice_id)
    setNotices(next)
    saveNotices(next)
  }

  return (
    <DashboardShell title="Notices" subtitle={canCreate ? 'Post announcements for students and staff' : 'Announcements from your college'}>
      <div className="space-y-6">
        {canCreate && (
          <Card>
            <CardBody>
              <div className="flex items-center gap-3 mb-4">
                <Megaphone className="text-orbit-primary" size={24} />
                <div>
                  <h2 className="text-sm font-semibold text-orbit-text-primary">Post a Notice</h2>
                  <p className="text-xs text-slate-500">Short text announcement — no file needed</p>
                </div>
              </div>
              {error && <p className="text-sm text-orbit-danger mb-3">{error}</p>}
              <div className="space-y-4">
                <Input label="Title" placeholder="Placement drive on 25th July" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                <Textarea label="Message" rows={3} placeholder="Details for students..." value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} />
              </div>
              <Button className="mt-4" icon={<Plus size={16} />} onClick={handlePost}>
                Post Notice
              </Button>
            </CardBody>
          </Card>
        )}

        <SearchBar value={search} onChange={setSearch} placeholder="Search notices..." className="sm:max-w-sm" />

        {filtered.length === 0 ? (
          <EmptyState title="No notices found" icon={<Megaphone size={20} />} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((notice) => (
              <Card key={notice.notice_id} className="hover:border-orbit-primary/40 transition-all">
                <CardBody>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-orbit-text-primary">{notice.title}</h3>
                    {canCreate && (
                      <button
                        onClick={() => handleDelete(notice)}
                        className="text-slate-500 hover:text-orbit-danger transition-colors flex-shrink-0"
                        aria-label="Delete notice"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-400 whitespace-pre-wrap">{notice.message}</p>
                  <p className="mt-3 text-[11px] text-slate-600">{notice.creator_name} &middot; {formatDateTime(notice.created_on)}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
