import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import api from '@/services/api'
import { CompanyForm } from '@/components/forms/CompanyForm'
import {
  getAuthUser,
  markCompanyProfileComplete,
  saveAuthUser,
  DASHBOARD_PATHS,
} from '@/utils/auth'

export default function CompanyProfileSetup() {
  const navigate = useNavigate()
  const user = getAuthUser()
  const [loading, setLoading] = useState(true)
  const [initial, setInitial] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const orgRes = await api.get(`/organizations/${user.user_id}`).catch(() => null)
        const data = orgRes?.data?.data ?? orgRes?.data ?? user
        const extras = JSON.parse(localStorage.getItem(`company_extras_${user.user_id}`) || '{}')
        setInitial({
          name: data.name || user.name || '',
          email: data.email || user.email || '',
          mobile_no: data.mobile_no || '',
          description: extras.description || '',
          logo_url: extras.logo_url || data.image_url || '',
          banner_url: extras.banner_url || '',
          website: extras.website || '',
          industry: extras.industry || '',
        })
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSaved = (form) => {
    markCompanyProfileComplete(user.user_id)
    saveAuthUser({ name: form.name, email: form.email, mobile_no: form.mobile_no })
    navigate(`${DASHBOARD_PATHS.Company}?view=dashboard`)
  }

  if (user.approval_id === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orbit-bg px-6">
        <div className="max-w-md rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
          <Building2 className="mx-auto mb-4 h-10 w-10 text-amber-400" />
          <h1 className="text-xl font-bold text-orbit-text-primary">Awaiting Approval</h1>
          <p className="mt-2 text-sm text-slate-400">
            Your organization registration is pending Super Admin approval. You will be able to complete your profile after approval.
          </p>
        </div>
      </div>
    )
  }

  if (loading || !initial) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orbit-bg text-slate-400">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orbit-bg px-6 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center">
          <Building2 className="mx-auto mb-4 h-10 w-10 text-emerald-400" />
          <h1 className="text-2xl font-bold text-orbit-text-primary">Set Up Company Profile</h1>
          <p className="mt-2 text-sm text-slate-500">
            Add your company branding and details before posting jobs and trainings.
          </p>
        </div>

        <div className="rounded-2xl border border-orbit-border bg-orbit-surface p-6">
          <CompanyForm userId={user.user_id} initial={initial} onSaved={handleSaved} submitLabel="Save & Go to Dashboard" />
        </div>
      </div>
    </div>
  )
}
