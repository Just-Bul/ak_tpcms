import { useMemo, useState } from 'react'
import { CheckCircle2, XCircle, Eye, Briefcase, BookOpenCheck } from 'lucide-react'
import DashboardShell from '@/components/DashboardShell'
import { Card, CardBody, Button } from '@/components/ui'
import { DataTable } from '@/components/common/DataTable'
import { SearchBar } from '@/components/common/SearchBar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { StudentDetailModal } from '@/components/modals/StudentDetailModal'
import { useAuth } from '@/hooks/useAuth'
import { useFetchList } from '@/hooks/useFetchList'
import { useDebounce } from '@/hooks/useDebounce'
import { useModal } from '@/hooks/useModal'
import {
  fetchPlacementApplications,
  fetchTrainingApplications,
  approvePlacementApplication,
  rejectPlacementApplication,
  approveTrainingApplication,
  rejectTrainingApplication,
} from '@/services/applications'
import { getApplicationStatus } from '@/utils/getApplicationStatus'
import { formatDateTime } from '@/utils/formatDateTime'

/**
 * Shared Applications page — replaces superadmin/coordinator PlacementApplications +
 * TrainingApplications and company's Recruitment.jsx (which merged both types with its own
 * status_id mapping). Also fixes a real pre-existing bug: the coordinator page's Reject button
 * called `api.get(...)` with a body (a no-op — GET requests don't carry bodies) instead of the
 * PATCH the backend actually requires; this page uses the corrected services/applications.js.
 * Applicant details (item 7) reuse StudentDetailModal instead of a separate near-duplicate modal.
 *
 * `filterType`: "Placement" | "Training" | undefined (both)
 */
export default function ApplicationsPage({ filterType }) {
  const { role } = useAuth()
  const isStaff = role === 'Super Admin' || role === 'Coordinator' || role === 'Company'

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [actioning, setActioning] = useState(null)

  const { data: placementApps, loading: loadingP, refetch: refetchP } = useFetchList(fetchPlacementApplications, {
    enabled: filterType !== 'Training',
  })
  const { data: trainingApps, loading: loadingT, refetch: refetchT } = useFetchList(fetchTrainingApplications, {
    enabled: filterType !== 'Placement',
  })
  const loading = loadingP || loadingT

  const detailModal = useModal()

  const rows = useMemo(() => {
    const placements = filterType === 'Training' ? [] : placementApps.map((a) => ({
      key: `placement-${a.placement_id}-${a.student_id}`,
      type: 'Placement',
      icon: Briefcase,
      title: a.placement_table?.title || `Placement #${a.placement_id}`,
      studentName: a.student_table?.user_table?.name || a.student_table?.name || `Student #${a.student_id}`,
      studentId: a.student_id,
      date: a.date_of_submission,
      statusId: a.status_id,
      approve: () => approvePlacementApplication(a.placement_id, a.student_id),
      reject: () => rejectPlacementApplication(a.placement_id, a.student_id),
    }))
    const trainings = filterType === 'Placement' ? [] : trainingApps.map((a) => ({
      key: `training-${a.training_id}-${a.student_id}`,
      type: 'Training',
      icon: BookOpenCheck,
      title: a.training_table?.title || `Training #${a.training_id}`,
      studentName: a.student_table?.user_table?.name || a.student_table?.name || `Student #${a.student_id}`,
      studentId: a.student_id,
      date: a.date_of_submission,
      statusId: a.status_id,
      approve: () => approveTrainingApplication(a.training_id, a.student_id),
      reject: () => rejectTrainingApplication(a.training_id, a.student_id),
    }))
    return [...placements, ...trainings]
  }, [placementApps, trainingApps, filterType])

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    if (!q) return rows
    return rows.filter((r) => r.title.toLowerCase().includes(q) || r.studentName.toLowerCase().includes(q))
  }, [rows, debouncedSearch])

  const handleAction = async (row, action) => {
    setActioning(row.key)
    try {
      await (action === 'approve' ? row.approve() : row.reject())
      refetchP()
      refetchT()
    } catch (err) {
      alert(err.message || 'Failed to update application.')
    } finally {
      setActioning(null)
    }
  }

  const columns = [
    {
      key: 'title',
      header: filterType ? filterType : 'Opportunity',
      render: (r) => (
        <div className="flex items-center gap-2">
          <r.icon size={14} className="text-orbit-primary-light flex-shrink-0" />
          <div>
            <p className="font-medium text-orbit-text-primary">{r.title}</p>
            {!filterType && <p className="text-xs text-slate-500">{r.type}</p>}
          </div>
        </div>
      ),
    },
    { key: 'student', header: 'Student', render: (r) => r.studentName },
    { key: 'date', header: 'Applied On', render: (r) => formatDateTime(r.date) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={getApplicationStatus(r.statusId)} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          {isStaff && (
            <Button size="xs" variant="outline" icon={<Eye size={13} />} onClick={() => detailModal.open(r.studentId)}>
              View
            </Button>
          )}
          {isStaff && r.statusId === 1 && (
            <>
              <Button size="xs" loading={actioning === r.key} icon={<CheckCircle2 size={13} />} onClick={() => handleAction(r, 'approve')}>
                Approve
              </Button>
              <Button size="xs" variant="destructive" loading={actioning === r.key} icon={<XCircle size={13} />} onClick={() => handleAction(r, 'reject')}>
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <DashboardShell
      title={filterType ? `${filterType} Applications` : 'Applications'}
      subtitle={isStaff ? 'Review applicant details before approving or rejecting' : 'Track your submitted applications'}
    >
      <div className="space-y-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by student or title..." className="sm:max-w-sm" />
        <Card>
          <CardBody>
            <DataTable columns={columns} data={filtered} rowKey={(r) => r.key} loading={loading} emptyTitle="No applications found" />
          </CardBody>
        </Card>
      </div>

      {isStaff && (
        <StudentDetailModal open={detailModal.isOpen} onClose={detailModal.close} studentId={detailModal.payload} />
      )}
    </DashboardShell>
  )
}
