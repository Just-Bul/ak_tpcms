import { useEffect, useState } from 'react'
import DashboardShell from '@/components/DashboardShell'
import { Card, CardHeader, CardBody, Button } from '@/components/ui'
import { Loader2, Save } from 'lucide-react'
import { CompanyForm } from '@/components/forms/CompanyForm'
import { getAuthUser } from '@/utils/auth'

export default function CompanyProfile() {
  const user = getAuthUser()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [initial, setInitial] = useState(null)

  useEffect(() => {
    const extras = JSON.parse(localStorage.getItem(`company_extras_${user.user_id}`) || '{}')
    setInitial({
      name: user.name || '',
      email: user.email || '',
      mobile_no: user.mobile_no || extras.mobile_no || '',
      website: extras.website || '',
      description: extras.description || '',
      industry: extras.industry || '',
      logo_url: extras.logo_url || '',
      banner_url: extras.banner_url || '',
    })
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading || !initial) {
    return (
      <DashboardShell title="Company Profile" subtitle="View and edit your company details">
        <Card>
          <CardBody>
            <div className="flex items-center justify-center gap-2 text-slate-400 py-12">
              <Loader2 size={18} className="animate-spin" /> Loading profile...
            </div>
          </CardBody>
        </Card>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell title="Company Profile" subtitle="View and edit your company details">
      <Card>
        <CardHeader
          title="Company Information"
          subtitle={editing ? 'Update your details' : 'Your registered company details'}
          actions={
            !editing ? (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            ) : null
          }
        />
        <CardBody>
          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 mb-4">
              <Save size={14} /> Profile updated successfully
            </div>
          )}
          <CompanyForm
            userId={user.user_id}
            initial={initial}
            disabled={!editing}
            onSaved={(form) => {
              setInitial(form)
              setEditing(false)
              setSuccess(true)
            }}
          />
        </CardBody>
      </Card>
    </DashboardShell>
  )
}
