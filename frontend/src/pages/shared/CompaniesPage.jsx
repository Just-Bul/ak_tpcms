import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  RefreshCw,
  Ban,
} from 'lucide-react'

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


/* =============================================================
   TABS
============================================================= */

const TABS = [
  {
    key: 'pending',
    label: 'Pending',
  },
  {
    key: 'approved',
    label: 'Approved',
  },
  {
    key: 'rejected',
    label: 'Rejected',
  },
]


/* =============================================================
   COMPANY ID
============================================================= */

const getCompanyId = (company) => company?.user_id


/* =============================================================
   ROUTE -> TAB
============================================================= */

const VIEW_TO_TAB = {
  'view-companies': 'pending',
  'approved-companies': 'approved',
  'rejected-companies': 'rejected',
}


/* =============================================================
   COMPONENT
============================================================= */

export default function CompaniesPage() {
  const [searchParams] = useSearchParams()


  /* ===========================================================
     TAB
  =========================================================== */

  const [tab, setTab] = useState(() => {
    return (
      VIEW_TO_TAB[searchParams.get('view')] ||
      'pending'
    )
  })


  /* ===========================================================
     SEARCH
  =========================================================== */

  const [search, setSearch] = useState('')

  const debouncedSearch = useDebounce(search)


  /* ===========================================================
     ACTION STATE
  =========================================================== */

  const [actionLoading, setActionLoading] = useState(null)


  /* ===========================================================
     REJECTION
  =========================================================== */

  const [rejectTarget, setRejectTarget] = useState(null)


  /* ===========================================================
     DISABLED COMPANIES
  =========================================================== */

  const [showDisabled, setShowDisabled] = useState(false)


  /* ===========================================================
     FETCH CURRENT TAB
  =========================================================== */

  const {
    data: companies,
    loading,
    refetch,
  } = useFetchList(
    () => fetchOrganizations(tab)
  )


  /* ===========================================================
     FETCH ALL COMPANIES
  =========================================================== */

  const {
    data: allCompanies,
    loading: loadingAll,
    refetch: refetchAll,
  } = useFetchList(
    fetchAllOrganizations,
    {
      enabled: showDisabled,
    }
  )


  /* ===========================================================
     REFRESH WHEN TAB CHANGES
  =========================================================== */

  useEffect(() => {
    refetch()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])


  /* ===========================================================
     SEARCH FILTER
  =========================================================== */

  const filtered = companies.filter((company) => {
    const query = debouncedSearch
      .trim()
      .toLowerCase()

    if (!query) {
      return true
    }

    return (
      String(company.name || '')
        .toLowerCase()
        .includes(query)
      ||

      String(company.email || '')
        .toLowerCase()
        .includes(query)
      ||

      String(company.mobile_no || '')
        .includes(debouncedSearch)
    )
  })


  /* ===========================================================
     APPROVE COMPANY
  =========================================================== */

  const handleApprove = async (company) => {
    const id = getCompanyId(company)

    if (!id) {
      alert('Company ID is missing.')
      return
    }

    setActionLoading(id)

    try {
      await approveOrganization(id)

      /*
       * Refresh the current tab.
       *
       * Pending company will disappear from Pending
       * and appear under Approved.
       */
      await refetch()

    } catch (err) {
      alert(
        err?.message ||
          'Unable to approve company.'
      )
    } finally {
      setActionLoading(null)
    }
  }


  /* ===========================================================
     OPEN REJECT MODAL
  =========================================================== */

  const handleOpenReject = (company) => {
    if (!company) {
      return
    }

    setRejectTarget(company)
  }


  /* ===========================================================
     REJECT COMPANY
  =========================================================== */

  const handleReject = async (remarks) => {
    const id = getCompanyId(rejectTarget)

    if (!id) {
      alert('Company ID is missing.')
      return
    }

    const cleanRemarks = String(
      remarks || ''
    ).trim()

    if (!cleanRemarks) {
      alert(
        'Please enter a rejection remark.'
      )
      return
    }

    setActionLoading(id)

    try {
      await rejectOrganization(
        id,
        cleanRemarks
      )

      /*
       * Close rejection modal.
       */
      setRejectTarget(null)

      /*
       * Refresh current list.
       */
      await refetch()

    } catch (err) {
      alert(
        err?.message ||
          'Unable to reject company.'
      )
    } finally {
      setActionLoading(null)
    }
  }


  /* ===========================================================
     ENABLE / DISABLE COMPANY
  =========================================================== */

  const handleToggleActive = async (company) => {
    const id = getCompanyId(company)

    if (!id) {
      alert('Company ID is missing.')
      return
    }

    try {
      await setOrganizationActiveState(
        id,
        company.is_active === false
      )

      await refetchAll()

    } catch (err) {
      alert(
        err?.message ||
          'Unable to update company status.'
      )
    }
  }


  /* ===========================================================
     RENDER
  =========================================================== */

  return (
    <DashboardShell
      title="Companies"
      subtitle="Review and manage organization registrations"
    >
      <div className="w-full min-w-0 space-y-5">

        {/* =====================================================
            TOP CONTROLS
        ===================================================== */}

        <div
          className="
            flex
            flex-col
            gap-3
            xl:flex-row
            xl:items-center
            xl:justify-between
          "
        >

          {/* ===================================================
              TABS
          =================================================== */}

          <div
            className="
              flex
              w-fit
              max-w-full
              gap-1.5
              overflow-x-auto
              rounded-lg
              border border-orbit-border
              bg-orbit-surface2
              p-1
            "
          >
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`
                  shrink-0
                  rounded-md
                  px-4
                  py-2
                  text-sm
                  font-medium
                  transition-colors

                  ${
                    tab === item.key
                      ? 'bg-orbit-primary text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }
                `}
              >
                {item.label}
              </button>
            ))}
          </div>


          {/* =================================================
              SEARCH + ACTIONS
          ================================================= */}

          <div
            className="
              flex
              w-full
              flex-col
              gap-2
              sm:flex-row
              xl:w-auto
            "
          >

            {/* Search */}
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search company, email, mobile..."
              className="w-full sm:w-72"
            />

            {/* Refresh */}
            <Button
              variant="outline"
              size="icon"
              icon={
                <RefreshCw
                  size={16}
                  className={
                    loading
                      ? 'animate-spin'
                      : ''
                  }
                />
              }
              onClick={refetch}
            />

            {/* Disabled */}
            <Button
              variant="outline"
              icon={
                <Ban size={16} />
              }
              onClick={() =>
                setShowDisabled(true)
              }
            >
              Disabled
            </Button>
          </div>
        </div>


        {/* =====================================================
            COMPANY LIST
        ===================================================== */}

        {loading ? (
          <Loading
            label="Loading companies..."
          />
        ) : filtered.length === 0 ? (

          <EmptyState
            title={`No ${tab} companies found`}
          />

        ) : (

          <div
            className="
              grid
              w-full
              min-w-0
              grid-cols-1
              gap-5
              md:grid-cols-2
            "
          >
            {filtered.map((company) => (

              <CompanyCard
                key={getCompanyId(company)}
                company={company}
                tab={tab}
                loading={
                  actionLoading ===
                  getCompanyId(company)
                }
                onApprove={
                  handleApprove
                }
                onReject={
                  handleOpenReject
                }
              />

            ))}
          </div>
        )}
      </div>


      {/* =======================================================
          REJECTION REMARK MODAL
      ======================================================= */}

      <RejectRemarkModal
        open={Boolean(rejectTarget)}
        company={rejectTarget}
        loading={
          actionLoading ===
          getCompanyId(rejectTarget)
        }
        onClose={() =>
          setRejectTarget(null)
        }
        onConfirm={handleReject}
      />


      {/* =======================================================
          DISABLED COMPANIES
      ======================================================= */}

      <DisableModal
        open={showDisabled}
        onClose={() =>
          setShowDisabled(false)
        }
        title="Company Status"
        items={allCompanies}
        loading={loadingAll}
        getId={getCompanyId}
        getLabel={(company) =>
          company.name
        }
        getSubLabel={(company) =>
          company.email
        }
        isDisabled={(company) =>
          company.is_active === false
        }
        onToggle={
          handleToggleActive
        }
      />

    </DashboardShell>
  )
}