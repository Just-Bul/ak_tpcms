import { useRef, useState } from 'react'
import { Plus, Trash2, Upload, CheckCircle2, XCircle, FileSpreadsheet, Download, AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Button, Input, Select } from '@/components/ui'
import { useMasterData } from '@/hooks/useMasterData'
import { parseCsv, downloadCsv } from '@/utils/csv'
import api from '@/services/api'

const emptyRow = () => ({ roll_no: '', name: '', email: '', password: '', department_id: '', semester_id: '' })

const TEMPLATE_HEADERS = ['roll_no', 'name', 'email', 'password', 'department', 'semester']
const TEMPLATE_SAMPLE = [
  { roll_no: '2026CS001', name: 'Jane Doe', email: 'jane.doe@example.com', password: 'changeme123', department: 'Computer Science', semester: 'Sem 1' },
]

/**
 * Bulk Add Students (item 27) — no bulk backend endpoint exists, so each row is still submitted
 * individually via the existing POST /students/ (same contract as the single-add flow), with
 * per-row success/failure tracking. Rows can now be populated either by typing them in directly
 * or by importing a CSV (roll_no,name,email,password,department,semester — department/semester
 * are matched by name, case-insensitively, against the existing master-data lists so the CSV
 * doesn't need to know internal ids). Imported rows stay editable before submit so a bad/
 * unmatched department or semester can be fixed by hand rather than silently failing.
 */
export function BulkAddStudentsModal({ open, onClose, onSaved }) {
  const { data: master } = useMasterData(['departments', 'semesters'])
  const [rows, setRows] = useState([emptyRow()])
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState(null)
  const [csvWarnings, setCsvWarnings] = useState([])
  const fileInputRef = useRef(null)

  const updateRow = (i, field, value) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))
  }
  const addRow = () => setRows((prev) => [...prev, emptyRow()])
  const removeRow = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i))

  const handleClose = () => {
    setRows([emptyRow()])
    setResults(null)
    setCsvWarnings([])
    onClose()
  }

  const findDepartmentId = (name) => {
    const match = (master.departments || []).find((d) => d.department_name?.toLowerCase() === name.toLowerCase())
    return match?.department_id || ''
  }
  const findSemesterId = (name) => {
    const match = (master.semesters || []).find((s) => s.semester?.toLowerCase() === name.toLowerCase())
    return match?.semester_id || ''
  }

  const handleCsvUpload = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const text = await file.text()
    const parsed = parseCsv(text)
    if (!parsed.length) {
      alert('No rows found in that CSV.')
      return
    }

    const warnings = []
    const nextRows = parsed.map((r, i) => {
      const departmentId = r.department ? findDepartmentId(r.department) : ''
      const semesterId = r.semester ? findSemesterId(r.semester) : ''
      if (r.department && !departmentId) warnings.push(`Row ${i + 1}: department "${r.department}" not found — select it manually.`)
      if (r.semester && !semesterId) warnings.push(`Row ${i + 1}: semester "${r.semester}" not found — select it manually.`)
      return {
        roll_no: r.roll_no || '',
        name: r.name || '',
        email: r.email || '',
        password: r.password || '',
        department_id: departmentId,
        semester_id: semesterId,
      }
    })

    setRows(nextRows)
    setCsvWarnings(warnings)
  }

  const handleDownloadTemplate = () => {
    downloadCsv('students_bulk_add_template.csv', TEMPLATE_SAMPLE, TEMPLATE_HEADERS)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const outcomes = []
    for (const row of rows) {
      if (!row.roll_no.trim() || !row.name.trim() || !row.email.trim() || !row.password.trim() || !row.department_id || !row.semester_id) {
        outcomes.push({ row, ok: false, message: 'Missing required fields' })
        continue
      }
      try {
        await api.post('/students/', {
          roll_no: row.roll_no.trim(),
          name: row.name.trim(),
          email: row.email.trim(),
          password: row.password,
          department_id: Number(row.department_id),
          semester_id: Number(row.semester_id),
        })
        outcomes.push({ row, ok: true })
      } catch (err) {
        outcomes.push({ row, ok: false, message: err.message })
      }
    }
    setResults(outcomes)
    setSubmitting(false)
    if (outcomes.some((o) => o.ok)) onSaved?.()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Bulk Add Students"
      icon={<Upload size={18} />}
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Close</Button>
          {!results && (
            <Button loading={submitting} icon={<Upload size={16} />} onClick={handleSubmit}>
              Add {rows.length} Student{rows.length === 1 ? '' : 's'}
            </Button>
          )}
        </>
      }
    >
      {results ? (
        <div className="space-y-2">
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-orbit-border bg-orbit-surface2/40 px-3 py-2 text-sm">
              {r.ok ? <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" /> : <XCircle size={16} className="text-orbit-danger flex-shrink-0" />}
              <span className="text-orbit-text-primary">{r.row.name || r.row.roll_no || `Row ${i + 1}`}</span>
              {!r.ok && <span className="text-xs text-orbit-danger ml-auto">{r.message}</span>}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-orbit-border bg-orbit-surface2/40 p-3">
            <FileSpreadsheet size={18} className="text-orbit-primary-light flex-shrink-0" />
            <p className="text-xs text-slate-400 flex-1 min-w-[200px]">
              Import a CSV (roll_no, name, email, password, department, semester) instead of typing rows by hand.
            </p>
            <Button type="button" size="sm" variant="outline" icon={<Download size={14} />} onClick={handleDownloadTemplate}>
              Template
            </Button>
            <Button type="button" size="sm" icon={<Upload size={14} />} onClick={() => fileInputRef.current?.click()}>
              Upload CSV
            </Button>
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvUpload} />
          </div>

          {csvWarnings.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 space-y-1">
              {csvWarnings.map((w, i) => (
                <p key={i} className="flex items-start gap-2 text-xs text-amber-300">
                  <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" /> {w}
                </p>
              ))}
            </div>
          )}

          <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1">
            {rows.map((row, i) => (
              <div key={i} className="rounded-xl border border-orbit-border p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-medium text-slate-500">Student {i + 1}</p>
                  {rows.length > 1 && (
                    <Button type="button" size="xs" variant="destructive" icon={<Trash2 size={13} />} onClick={() => removeRow(i)} />
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Input label="Roll No" value={row.roll_no} onChange={(e) => updateRow(i, 'roll_no', e.target.value)} />
                  <Input label="Name" value={row.name} onChange={(e) => updateRow(i, 'name', e.target.value)} />
                  <Input label="Email" type="email" value={row.email} onChange={(e) => updateRow(i, 'email', e.target.value)} />
                  <Input label="Password" type="password" value={row.password} onChange={(e) => updateRow(i, 'password', e.target.value)} />
                  <Select label="Department" value={row.department_id} onChange={(e) => updateRow(i, 'department_id', e.target.value)}>
                    <option value="">Select</option>
                    {(master.departments || []).map((d) => (
                      <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                    ))}
                  </Select>
                  <Select label="Semester" value={row.semester_id} onChange={(e) => updateRow(i, 'semester_id', e.target.value)}>
                    <option value="">Select</option>
                    {(master.semesters || []).map((s) => (
                      <option key={s.semester_id} value={s.semester_id}>{s.semester}</option>
                    ))}
                  </Select>
                </div>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" icon={<Plus size={14} />} onClick={addRow}>
            Add Another Row
          </Button>
        </div>
      )}
    </Modal>
  )
}

export default BulkAddStudentsModal
