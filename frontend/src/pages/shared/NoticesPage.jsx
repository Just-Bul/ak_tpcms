import { useMemo, useState } from 'react'
import { BookOpen, Plus, Eye, Download, Pencil, Trash2, FileText } from 'lucide-react'
import DashboardShell from '@/components/DashboardShell'
import { Card, CardBody, Button, Input, Textarea, MediaUpload } from '@/components/ui'
import { Loading } from '@/components/common/Loading'
import { EmptyState } from '@/components/common/EmptyState'
import { SearchBar } from '@/components/common/SearchBar'
import { Modal } from '@/components/common/Modal'
import { useAuth } from '@/hooks/useAuth'
import { useRolePermission } from '@/hooks/useRolePermission'
import { useFetchList } from '@/hooks/useFetchList'
import { useDebounce } from '@/hooks/useDebounce'
import { useModal } from '@/hooks/useModal'
import { fetchAllNotes, createNote } from '@/services/notes'
import api from '@/services/api'
import { formatDate } from '@/utils/formatDateTime'

function isImage(url = '') {
  return /\.(jpe?g|png|gif|webp)$/i.test(url)
}
function isPdf(url = '') {
  return /\.pdf$/i.test(url)
}

/**
 * Shared Note Share page (file/study-material sharing — backed by the real note_table
 * API) — replaces superadmin ShareNotes, coordinator ShareNotes (near-95%-identical
 * upload+manage pages), and the student-facing read-only ViewNotes, sharing one upload
 * form and one preview modal instead of three.
 *
 * This is deliberately a separate feature from the "Notices" announcement board
 * (see NoticeBoardPage.jsx) — sharing a PDF/image study material is a different action
 * from posting a text announcement, even though both used to be labelled "Notices".
 *
 * Note: the backend has no PUT/DELETE route for notes for any role — Edit/Delete stay
 * visible (per product decision, to preserve current behavior) but remain non-functional;
 * this is a backend gap, not a frontend bug, and is called out in the refactor report.
 */
export default function NoticesPage() {
  const { role } = useAuth()
  const { can } = useRolePermission()
  const canCreate = can('Super Admin', 'Coordinator', 'Company')

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [form, setForm] = useState({ title: '', description: '', note_url: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { data: notes, loading, refetch } = useFetchList(fetchAllNotes)
  const previewModal = useModal()

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    if (!q) return notes
    return notes.filter((n) => (n.title || '').toLowerCase().includes(q) || (n.description || '').toLowerCase().includes(q))
  }, [notes, debouncedSearch])

  const handleShare = async () => {
    if (!form.note_url) return setError('Upload a file first.')
    if (!form.title.trim()) return setError('Enter a note title.')
    setSaving(true)
    setError('')
    try {
      await createNote(form)
      setForm({ title: '', description: '', note_url: '' })
      refetch()
    } catch (err) {
      setError(err.message || 'Failed to share note')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (note) => {
    if (!window.confirm('Delete this note?')) return
    try {
      await api.delete(`/notes/${note.note_id}`)
      refetch()
    } catch (err) {
      alert(err.message || 'Failed to delete note')
    }
  }

  return (
    <DashboardShell title="Note Share" subtitle={canCreate ? 'Share study materials and files with students' : 'Study materials shared by your college'}>
      <div className="space-y-6">
        {canCreate && (
          <Card>
            <CardBody>
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="text-orbit-primary" size={24} />
                <div>
                  <h2 className="text-sm font-semibold text-orbit-text-primary">Share a Note</h2>
                  <p className="text-xs text-slate-500">Upload PDF or image study material</p>
                </div>
              </div>
              {error && <p className="text-sm text-orbit-danger mb-3">{error}</p>}
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <Input label="Title" placeholder="DBMS Unit 1 Notes" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                <Textarea label="Description" rows={1} placeholder="Optional description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <MediaUpload
                label="File"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.ppt,.pptx"
                value={form.note_url}
                uploadPath="/uploads/notes"
                onChange={(url) => setForm((p) => ({ ...p, note_url: url }))}
              />
              <Button className="mt-4" loading={saving} icon={<Plus size={16} />} onClick={handleShare}>
                Share Note
              </Button>
            </CardBody>
          </Card>
        )}

        <SearchBar value={search} onChange={setSearch} placeholder="Search notes..." className="sm:max-w-sm" />

        {loading ? (
          <Loading label="Loading notes..." />
        ) : filtered.length === 0 ? (
          <EmptyState title="No notes found" icon={<BookOpen size={20} />} />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((note) => (
              <Card key={note.note_id} className="overflow-hidden hover:border-orbit-primary/40 transition-all">
                <CardBody>
                  <div className="mb-4 overflow-hidden rounded-xl border border-orbit-border bg-orbit-surface2 h-40 flex items-center justify-center">
                    {isImage(note.note_url) ? (
                      <img src={note.note_url} alt={note.title} className="h-full w-full object-cover" />
                    ) : (
                      <FileText size={48} className="text-red-400" />
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-orbit-text-primary line-clamp-1">{note.title}</h3>
                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">{note.description || 'No description'}</p>
                  <p className="mt-3 text-[11px] text-slate-600">{formatDate(note.created_on)}</p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button size="sm" icon={<Eye size={14} />} onClick={() => previewModal.open(note)}>View</Button>
                    <Button size="sm" variant="outline" icon={<Download size={14} />} onClick={() => window.open(note.note_url, '_blank')}>Download</Button>
                  </div>
                  {canCreate && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" icon={<Pencil size={14} />} onClick={() => setForm({ title: note.title, description: note.description || '', note_url: note.note_url })}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" icon={<Trash2 size={14} />} onClick={() => handleDelete(note)}>
                        Delete
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal open={previewModal.isOpen} onClose={previewModal.close} title={previewModal.payload?.title} subtitle={previewModal.payload?.description} size="xl">
        {previewModal.payload && (
          <div className="h-[70vh] bg-black rounded-lg overflow-hidden flex items-center justify-center">
            {isImage(previewModal.payload.note_url) ? (
              <img src={previewModal.payload.note_url} alt={previewModal.payload.title} className="max-h-full max-w-full object-contain" />
            ) : isPdf(previewModal.payload.note_url) ? (
              <iframe src={previewModal.payload.note_url} title={previewModal.payload.title} className="h-full w-full" />
            ) : (
              <div className="flex flex-col items-center gap-4 text-white">
                <FileText size={64} className="text-red-400" />
                <p>Preview unavailable</p>
                <Button icon={<Download size={16} />} onClick={() => window.open(previewModal.payload.note_url, '_blank')}>Download File</Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardShell>
  )
}
