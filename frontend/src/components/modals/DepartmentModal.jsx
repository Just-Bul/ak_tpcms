import { useEffect, useState } from 'react'
import { Building2, Save, UserPlus } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Button, Input, Switch } from '@/components/ui'
import { createDepartment, updateDepartment } from '@/services/departmentApi'

const emptyForm = { department_name: '', name: '', email: '', password: '', is_active: true }

/**
 * Create/edit department — one modal replacing AddDepartment.jsx + EditDepartment.jsx.
 * Create: POST /departments/register {department_name, name, email, password, is_active}.
 * Edit: PATCH /departments/:id {department_name, name, email, is_active} — the edit field
 * is `name` (coordinator name), not `coordinator_name`; the old EditDepartment.jsx sent
 * `coordinator_name`, which the backend's strict schema rejects — fixed here.
 */
export function DepartmentModal({ open, onClose, department, onSaved }) {
  const isEdit = Boolean(department)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setError('')
    setForm(
      isEdit
        ? {
            department_name: department.department_name || '',
            name: department.user_table?.name || '',
            email: department.user_table?.email || '',
            password: '',
            is_active: department.is_active ?? true,
          }
        : emptyForm
    )
  }, [open, isEdit, department])

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.department_name.trim() || !form.name.trim() || !form.email.trim()) {
      setError('Department name, coordinator name, and email are required.')
      return
    }
    if (!isEdit && !form.password.trim()) {
      setError('Password is required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (isEdit) {
        await updateDepartment(department.department_id, {
          department_name: form.department_name.trim(),
          name: form.name.trim(),
          email: form.email.trim(),
          is_active: form.is_active,
        })
      } else {
        await createDepartment({
          department_name: form.department_name.trim(),
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          is_active: form.is_active,
        })
      }
      onSaved?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save department')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Department' : 'Add Department'}
      icon={<Building2 size={18} />}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving} icon={isEdit ? <Save size={16} /> : <UserPlus size={16} />}>
            {isEdit ? 'Save Changes' : 'Create Department'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-orbit-danger">{error}</p>}
        <Input label="Department Name" value={form.department_name} onChange={update('department_name')} required />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Coordinator Name" value={form.name} onChange={update('name')} required />
          <Input label="Coordinator Email" type="email" value={form.email} onChange={update('email')} required />
        </div>
        {!isEdit && (
          <Input label="Coordinator Password" type="password" value={form.password} onChange={update('password')} required />
        )}
        <div className="flex items-center gap-3">
          <Switch checked={form.is_active} onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))} />
          <span className="text-sm text-slate-300">Department Active</span>
        </div>
      </form>
    </Modal>
  )
}

export default DepartmentModal
