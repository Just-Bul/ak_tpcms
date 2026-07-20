import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { Button, Input, Select, Textarea } from '@/components/ui'
import { AvatarUpload } from '@/components/common/AvatarUpload'
import api from '@/services/api'

/**
 * Shared company profile form — replaces the duplicated field set previously
 * hand-built separately in CompanyProfileSetup.jsx (first-login onboarding) and
 * CompanyProfile.jsx (later editing). `name/email/mobile_no/sector_id` persist via
 * PUT /organizations/:id (the only fields that route accepts); website/description/
 * logo/banner have no backend columns for organizations, so they remain a
 * localStorage-only fallback (`company_extras_<user_id>`), matching prior behavior.
 */
export function CompanyForm({ userId, initial, disabled = false, onSaved, submitLabel = 'Save Changes' }) {
  const [sectors, setSectors] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile_no: '',
    website: '',
    description: '',
    industry: '',
    logo_url: '',
    banner_url: '',
    ...initial,
  })

  useEffect(() => {
    api
      .get('/masters/sectors')
      .then((res) => setSectors(res?.data?.data ?? res?.data ?? []))
      .catch(() => setSectors([]))
  }, [])

  const update = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const extrasKey = `company_extras_${userId}`
      const extras = {
        website: form.website,
        description: form.description,
        industry: form.industry,
        logo_url: form.logo_url,
        banner_url: form.banner_url,
      }
      localStorage.setItem(extrasKey, JSON.stringify(extras))

      const selectedSector = sectors.find((s) => s.sector_name === form.industry)
      await api.put(`/organizations/${userId}`, {
        name: form.name,
        email: form.email,
        mobile_no: form.mobile_no || undefined,
        sector_id: selectedSector ? selectedSector.sector_id : undefined,
      })

      onSaved?.(form)
    } catch (err) {
      setError(err.message || 'Failed to save company profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="text-sm text-orbit-danger">{error}</p>}

      {disabled && (form.logo_url || form.banner_url) && (
        <div className="relative h-40 w-full rounded-xl overflow-hidden bg-orbit-surface2 border border-orbit-border">
          {form.banner_url ? (
            <img src={form.banner_url} alt="Company banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">No banner set</div>
          )}
          {form.logo_url && (
            <div className="absolute bottom-3 left-3 h-14 w-14 rounded-xl bg-orbit-surface border border-orbit-border p-1.5 flex items-center justify-center shadow-lg">
              <img src={form.logo_url} alt="Company logo" className="max-h-full max-w-full object-contain rounded-lg" />
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Company Name" value={form.name} onChange={update('name')} required disabled={disabled} />
        <Select label="Industry / Sector" value={form.industry} onChange={update('industry')} disabled={disabled}>
          <option value="">Select an industry</option>
          {sectors.map((s) => (
            <option key={s.sector_id} value={s.sector_name}>{s.sector_name}</option>
          ))}
        </Select>
        <Input label="Email" type="email" value={form.email} onChange={update('email')} required disabled={disabled} />
        <Input label="Mobile Number" value={form.mobile_no} onChange={update('mobile_no')} maxLength={10} disabled={disabled} />
        <Input label="Website" type="url" value={form.website} onChange={update('website')} placeholder="https://company.com" disabled={disabled} className="md:col-span-2" />
      </div>

      <Textarea label="About Company" rows={3} value={form.description} onChange={update('description')} disabled={disabled} />

      {!disabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-orbit-border pt-4">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">Company Logo</p>
            <AvatarUpload
              value={form.logo_url}
              onChange={(url) => setForm((p) => ({ ...p, logo_url: url }))}
              uploadPath="/uploads/profile"
              initials={(form.name || 'C').slice(0, 2)}
              size="2xl"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">Company Banner</p>
            <AvatarUpload
              value={form.banner_url}
              onChange={(url) => setForm((p) => ({ ...p, banner_url: url }))}
              uploadPath="/uploads/banner"
              shape="square"
              aspect={3}
            />
          </div>
        </div>
      )}

      {!disabled && (
        <Button type="submit" loading={saving} icon={<Save size={16} />}>
          {submitLabel}
        </Button>
      )}
    </form>
  )
}

export default CompanyForm
