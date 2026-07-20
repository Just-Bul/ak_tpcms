import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RefreshCw, Ban } from 'lucide-react'
import DashboardShell from '@/components/DashboardShell'
import { Button } from '@/components/ui'
import { Loading } from '@/components/common/Loading'
import { EmptyState } from '@/components/common/EmptyState'
import { SearchBar } from '@/components/common/SearchBar'
import { DisableModal } from '@/components/modals/DisableModal'
import { useFetchList } from '@/hooks/useFetchList'
import { useDebounce } from '@/hooks/useDebounce'
import CompanyCard from '@/pages/superadmin/view/CompanyCard'
import RejectRemarkModal from '@/pages/superadmin/view/RejectRemarkModal'
import {
  fetchOrganizations,
  fetchAllOrganizations,
  approveOrganization,
  rejectOrganization,
  setOrganizationActiveState,
} from '@/services/organizationApi'

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

const getCompanyId = (company) => company?.user_id

/**
 * Shared Companies page — replaces ViewCompanies/ApprovedCompanies/RejectedCompanies
 * (confirmed ~90% identical card-list layouts) with one tabbed view. Company approval
 * workflow (item 1) lives here: approve, reject with remark, status badge, disabled list.
 */
const VIEW_TO_TAB = {
  'view-companies': 'pending',
  'approved-companies': 'approved',
  'rejected-companies': 'rejected',
}

export default function CompaniesPage() {
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(() => VIEW_TO_TAB[searchParams.get('view')] || 'pending')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [actionLoading, setActionLoading] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [showDisabled, setShowDisabled] = useState(false)

  const { data: companies, loading, refetch } = useFetchList(() => fetchOrganizations(tab))
  const { data: allCompanies, loading: loadingAll, refetch: refetchAll } = useFetchList(fetchAllOrganizations, {
    enabled: showDisabled,
  })

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const filtered = companies.filter((c) => {
    const q = debouncedSearch.toLowerCase()
    if (!q) return true
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.mobile_no || '').includes(debouncedSearch)
    )
  })

  const handleApprove = async (company) => {
    const id = getCompanyId(company)
    setActionLoading(id)
    try {
      await approveOrganization(id)
      refetch()
    } catch (err) {
      alert(err.message || 'Unable to approve company.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (remarks) => {
    const id = getCompanyId(rejectTarget)
    if (!id) return
    setActionLoading(id)
    try {
      await rejectOrganization(id, remarks)
      setRejectTarget(null)
      refetch()
    } catch (err) {
      alert(err.message || 'Unable to reject company.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleActive = async (company) => {
    await setOrganizationActiveState(getCompanyId(company), company.is_active === false)
    refetchAll()
  }

  return (
    <DashboardShell title="Companies" subtitle="Review and manage organization registrations">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex gap-1.5 rounded-lg border border-orbit-border bg-orbit-surface2 p-1 w-fit">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  tab === t.key ? 'bg-orbit-primary text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <SearchBar value={search} onChange={setSearch} placeholder="Search company, email, mobile..." className="sm:w-72" />
            <Button variant="outline" size="icon" icon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />} onClick={refetch} />
            <Button variant="outline" icon={<Ban size={16} />} onClick={() => setShowDisabled(true)}>
              Disabled
            </Button>
          </div>
        </div>

        {loading ? (
          <Loading label="Loading companies..." />
        ) : filtered.length === 0 ? (
          <EmptyState title={`No ${tab} companies found`} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((company) => (
              <CompanyCard
                key={getCompanyId(company)}
                company={company}
                tab={tab}
                loading={actionLoading === getCompanyId(company)}
                onApprove={handleApprove}
                onReject={(c) => setRejectTarget(c)}
              />
            ))}
          </div>
        )}
      </div>

      <RejectRemarkModal
        open={Boolean(rejectTarget)}
        company={rejectTarget}
        loading={actionLoading === getCompanyId(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
      />

      <DisableModal
        open={showDisabled}
        onClose={() => setShowDisabled(false)}
        title="Company Status"
        items={allCompanies}
        loading={loadingAll}
        getId={getCompanyId}
        getLabel={(c) => c.name}
        getSubLabel={(c) => c.email}
        isDisabled={(c) => c.is_active === false}
        onToggle={handleToggleActive}
      />
    </DashboardShell>
  )
}
