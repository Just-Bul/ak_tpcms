import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import DashboardShell from '@/components/DashboardShell'
import { Button } from '@/components/ui'
import { Loading } from '@/components/common/Loading'
import { EmptyState } from '@/components/common/EmptyState'
import { SearchBar } from '@/components/common/SearchBar'
import { Modal } from '@/components/common/Modal'
import { TrainingCard } from '@/components/cards/TrainingCard'
import TrainingForm from '@/components/TrainingForm'
import { ApplyModal } from '@/components/modals/ApplyModal'
import { useAuth } from '@/hooks/useAuth'
import { useRolePermission } from '@/hooks/useRolePermission'
import { useFetchList } from '@/hooks/useFetchList'
import { useDebounce } from '@/hooks/useDebounce'
import { useModal } from '@/hooks/useModal'
import { fetchTrainings } from '@/services/trainings'
import { fetchTrainingApplications } from '@/services/applications'
import { DASHBOARD_PATHS } from '@/utils/auth'

/**
 * Shared Trainings list/browse — replaces the 4 independent per-role list implementations,
 * mirroring PlacementsPage. Posting reuses the already-shared TrainingForm.
 */
export default function TrainingsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { role } = useAuth()
  const { can } = useRolePermission()
  const isStudent = role === 'Student'
  const canPost = can('Super Admin', 'Coordinator', 'Company')

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)

  const { data: trainings, loading, refetch } = useFetchList(fetchTrainings)
  const { data: applications, refetch: refetchApplications } = useFetchList(fetchTrainingApplications, {
    enabled: !canPost || isStudent,
  })

  const postModal = useModal()

  useEffect(() => {
    const view = searchParams.get('view')
    if (view === 'post-training' || view === 'post-training-admin') postModal.open()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const appliedIds = useMemo(() => new Set(applications.map((a) => a.training_id)), [applications])
  const applicantCounts = useMemo(() => {
    const counts = new Map()
    applications.forEach((a) => counts.set(a.training_id, (counts.get(a.training_id) || 0) + 1))
    return counts
  }, [applications])

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    if (!q) return trainings
    return trainings.filter(
      (t) =>
        (t.title || '').toLowerCase().includes(q) ||
        (t.organization_table?.user_table?.name || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
    )
  }, [trainings, debouncedSearch])

  const applyModal = useModal()

  const goToDetail = (trainingId) => {
    navigate(`${DASHBOARD_PATHS[role]}?view=training-detail&id=${trainingId}`)
  }

  return (
    <DashboardShell title="Trainings" subtitle={isStudent ? 'Browse and apply to eligible trainings' : 'Manage training programs'}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <SearchBar value={search} onChange={setSearch} placeholder="Search trainings..." className="sm:max-w-sm" />
          {canPost && (
            <Button icon={<Plus size={16} />} onClick={() => postModal.open()}>
              Post Training
            </Button>
          )}
        </div>

        {loading ? (
          <Loading label="Loading trainings..." />
        ) : filtered.length === 0 ? (
          <EmptyState title="No trainings found" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t) => (
              <TrainingCard
                key={t.training_id}
                training={t}
                applicantCount={!isStudent ? applicantCounts.get(t.training_id) || 0 : undefined}
                hasApplied={isStudent ? appliedIds.has(t.training_id) : undefined}
                onView={() => goToDetail(t.training_id)}
                onApply={isStudent ? () => applyModal.open(t) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={postModal.isOpen} onClose={postModal.close} title="Post Training" size="xl">
        <TrainingForm
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
          type="Training"
          onApplied={refetchApplications}
        />
      )}
    </DashboardShell>
  )
}
