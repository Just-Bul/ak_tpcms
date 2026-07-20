import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import DashboardShell from '@/components/DashboardShell'
import { Button } from '@/components/ui'
import { Loading } from '@/components/common/Loading'
import { EmptyState } from '@/components/common/EmptyState'
import { SearchBar } from '@/components/common/SearchBar'
import { Modal } from '@/components/common/Modal'
import { PlacementCard } from '@/components/cards/PlacementCard'
import PlacementForm from '@/components/PlacementForm'
import { ApplyModal } from '@/components/modals/ApplyModal'
import { useAuth } from '@/hooks/useAuth'
import { useRolePermission } from '@/hooks/useRolePermission'
import { useFetchList } from '@/hooks/useFetchList'
import { useDebounce } from '@/hooks/useDebounce'
import { useModal } from '@/hooks/useModal'
import { fetchPlacements } from '@/services/placements'
import { fetchPlacementApplications } from '@/services/applications'
import { DASHBOARD_PATHS } from '@/utils/auth'

/**
 * Shared Placements list/browse — replaces the 4 independent per-role list implementations
 * (superadmin PlacementActivity, coordinator ViewPlacements, company ManageJobs, student
 * JobsView), which each hand-rolled their own status derivation. Posting reuses the
 * already-shared PlacementForm; browsing/applying/viewing is unified here.
 */
export default function PlacementsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { role } = useAuth()
  const { can } = useRolePermission()
  const isStudent = role === 'Student'
  const canPost = can('Super Admin', 'Coordinator', 'Company')

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)

  const { data: placements, loading, refetch } = useFetchList(fetchPlacements)
  const { data: applications, refetch: refetchApplications } = useFetchList(fetchPlacementApplications, {
    enabled: !canPost || isStudent,
  })

  const postModal = useModal()

  useEffect(() => {
    const view = searchParams.get('view')
    if (view === 'post-placement' || view === 'post-job') postModal.open()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const appliedIds = useMemo(() => new Set(applications.map((a) => a.placement_id)), [applications])
  const applicantCounts = useMemo(() => {
    const counts = new Map()
    applications.forEach((a) => counts.set(a.placement_id, (counts.get(a.placement_id) || 0) + 1))
    return counts
  }, [applications])

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    if (!q) return placements
    return placements.filter(
      (p) =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.organization_table?.user_table?.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
    )
  }, [placements, debouncedSearch])

  const applyModal = useModal()

  const goToDetail = (placementId) => {
    navigate(`${DASHBOARD_PATHS[role]}?view=placement-detail&id=${placementId}`)
  }

  return (
    <DashboardShell title="Placements" subtitle={isStudent ? 'Browse and apply to eligible placements' : 'Manage placement drives'}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <SearchBar value={search} onChange={setSearch} placeholder="Search placements..." className="sm:max-w-sm" />
          {canPost && (
            <Button icon={<Plus size={16} />} onClick={() => postModal.open()}>
              Post Placement
            </Button>
          )}
        </div>

        {loading ? (
          <Loading label="Loading placements..." />
        ) : filtered.length === 0 ? (
          <EmptyState title="No placements found" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <PlacementCard
                key={p.placement_id}
                placement={p}
                applicantCount={!isStudent ? applicantCounts.get(p.placement_id) || 0 : undefined}
                hasApplied={isStudent ? appliedIds.has(p.placement_id) : undefined}
                onView={() => goToDetail(p.placement_id)}
                onApply={isStudent ? () => applyModal.open(p) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={postModal.isOpen} onClose={postModal.close} title="Post Placement" size="xl">
        <PlacementForm
          onSuccess={() => {
            postModal.close()
            refetch()
          }}
        />
      </Modal>

      {isStudent && (
        <ApplyModal
          open={applyModal.isOpen}
          onClose={applyModal.close}
          opportunity={applyModal.payload}
          type="Placement"
          onApplied={refetchApplications}
        />
      )}
    </DashboardShell>
  )
}
