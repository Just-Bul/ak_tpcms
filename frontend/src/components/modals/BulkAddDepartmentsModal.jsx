import { useRef, useState } from 'react'
import { Plus, Trash2, Upload, CheckCircle2, XCircle, FileSpreadsheet, Download } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Button, Input } from '@/components/ui'
import { parseCsv, downloadCsv } from '@/utils/csv'
import { createDepartment } from '@/services/departmentApi'

const emptyRow = () => ({ department_name: '', name: '', email: '', password: '' })

const TEMPLATE_HEADERS = ['department_name', 'name', 'email', 'password']
const TEMPLATE_SAMPLE = [
  { department_name: 'Computer Science', name: 'John Coordinator', email: 'john.coordinator@example.com', password: 'changeme123' },
]

/**
 * Bulk Add Departments — mirrors BulkAddStudentsModal's manual-rows + CSV import pattern.
 * No bulk backend endpoint exists, so each row still submits individually via the existing
 * POST /departments/register (same contract as the single-add flow in DepartmentModal).
 */
export function BulkAddDepartmentsModal({ open, onClose, onSaved }) {
  const [rows, setRows] = useState([emptyRow()])
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState(null)
  const fileInputRef = useRef(null)

  const updateRow = (i, field, value) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))
  }
  const addRow = () => setRows((prev) => [...prev, emptyRow()])
  const removeRow = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i))

  const handleClose = () => {
    setRows([emptyRow()])
    setResults(null)
    onClose()
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
    setRows(
      parsed.map((r) => ({
        department_name: r.department_name || '',
        name: r.name || '',
        email: r.email || '',
        password: r.password || '',
      }))
    )
  }

  const handleDownloadTemplate = () => {
    downloadCsv('departments_bulk_add_template.csv', TEMPLATE_SAMPLE, TEMPLATE_HEADERS)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const outcomes = []
    for (const row of rows) {
      if (!row.department_name.trim() || !row.name.trim() || !row.email.trim() || !row.password.trim()) {
        outcomes.push({ row, ok: false, message: 'Missing required fields' })
        continue
      }
      try {
        await createDepartment({
          department_name: row.department_name.trim(),
          name: row.name.trim(),
          email: row.email.trim(),
          password: row.password,
          is_active: true,
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
      title="Bulk Add Departments"
      icon={<Upload size={18} />}
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Close</Button>
          {!results && (
            <Button loading={submitting} icon={<Upload size={16} />} onClick={handleSubmit}>
              Add {rows.length} Department{rows.length === 1 ? '' : 's'}
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
              <span className="text-orbit-text-primary">{r.row.department_name || `Row ${i + 1}`}</span>
              {!r.ok && <span className="text-xs text-orbit-danger ml-auto">{r.message}</span>}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-orbit-border bg-orbit-surface2/40 p-3">
            <FileSpreadsheet size={18} className="text-orbit-primary-light flex-shrink-0" />
            <p className="text-xs text-slate-400 flex-1 min-w-[200px]">
              Import a CSV (department_name, name, email, password) instead of typing rows by hand.
            </p>
            <Button type="button" size="sm" variant="outline" icon={<Download size={14} />} onClick={handleDownloadTemplate}>
              Template
            </Button>
            <Button type="button" size="sm" icon={<Upload size={14} />} onClick={() => fileInputRef.current?.click()}>
              Upload CSV
            </Button>
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvUpload} />
          </div>

          <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1">
            {rows.map((row, i) => (
              <div key={i} className="rounded-xl border border-orbit-border p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-medium text-slate-500">Department {i + 1}</p>
                  {rows.length > 1 && (
                    <Button type="button" size="xs" variant="destructive" icon={<Trash2 size={13} />} onClick={() => removeRow(i)} />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Department Name" value={row.department_name} onChange={(e) => updateRow(i, 'department_name', e.target.value)} />
                  <Input label="Coordinator Name" value={row.name} onChange={(e) => updateRow(i, 'name', e.target.value)} />
                  <Input label="Coordinator Email" type="email" value={row.email} onChange={(e) => updateRow(i, 'email', e.target.value)} />
                  <Input label="Coordinator Password" type="password" value={row.password} onChange={(e) => updateRow(i, 'password', e.target.value)} />
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

export default BulkAddDepartmentsModal
