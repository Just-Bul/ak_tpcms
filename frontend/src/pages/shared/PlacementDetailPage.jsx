import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Building2, IndianRupee, Clock, GraduationCap, CheckCircle2 } from 'lucide-react'
import DashboardShell from '@/components/DashboardShell'
import { Card, CardBody, Badge, Button } from '@/components/ui'
import { Loading } from '@/components/common/Loading'
import { ApplyModal } from '@/components/modals/ApplyModal'
import { useAuth } from '@/hooks/useAuth'
import { useMasterData } from '@/hooks/useMasterData'
import { useModal } from '@/hooks/useModal'
import { fetchPlacement } from '@/services/placements'
import { fetchPlacementApplications } from '@/services/applications'
import { getAssetUrl } from '@/utils/getAssetUrl'
import { formatDateTime } from '@/utils/formatDateTime'

function formatLpa(value) {
  if (!value) return null
  return `₹${(value / 100000).toFixed(1)}L`
}

/**
 * Placement Details Page (item 8) — banner, description, eligibility, company, salary,
 * deadline, Apply/Back. Shared across all roles (Student sees Apply; others see it read-only).
 * Note: the backend placement schema has no "location" field, so it is not shown here —
 * displaying one would mean fabricating data with nothing to back it.
 */
export default function PlacementDetailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { role } = useAuth()
  const isStudent = role === 'Student'
  const placementId = searchParams.get('id')

  const [placement, setPlacement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasApplied, setHasApplied] = useState(false)
  const applyModal = useModal()

  const { data: master } = useMasterData(['divisions'])

  useEffect(() => {
    if (!placementId) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetchPlacement(placementId)
      .then(setPlacement)
      .catch((err) => setError(err.message || 'Failed to load placement'))
      .finally(() => setLoading(false))

    if (isStudent) {
      fetchPlacementApplications()
        .then((apps) => setHasApplied(apps.some((a) => String(a.placement_id) === String(placementId))))
        .catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placementId])

  const divisionLabel = (id) => master.divisions?.find((d) => d.division_id === id)?.division

  return (
    <DashboardShell title="Placement Details">
      {loading ? (
        <Loading label="Loading placement..." />
      ) : error || !placement ? (
        <Card>
          <CardBody>
            <p className="text-sm text-orbit-danger">{error || 'Placement not found.'}</p>
            <Button className="mt-4" variant="outline" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>Back</Button>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-5">
          <Card className="overflow-hidden">
            {placement.image_url && (
              <img src={getAssetUrl(placement.image_url)} alt="" className="h-56 w-full object-cover" />
            )}
            <CardBody>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold text-orbit-text-primary">{placement.title}</h1>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                    <Building2 size={14} />
                    {placement.organization_table?.user_table?.name || 'Company'}
                  </p>
                </div>
                <Badge variant={placement.is_active ? 'success' : 'neutral'}>
                  {placement.is_active ? 'Active' : 'Closed'}
                </Badge>
              </div>

              {placement.description && (
                <p className="mt-4 text-sm text-slate-400 leading-relaxed whitespace-pre-line">{placement.description}</p>
              )}
            </CardBody>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            {(placement.salary_lower || placement.salary_upper) && (
              <Card>
                <CardBody className="flex items-center gap-3">
                  <IndianRupee className="text-emerald-400" size={20} />
                  <div>
                    <p className="text-xs text-slate-500">Salary</p>
                    <p className="text-sm font-semibold text-orbit-text-primary">
                      {formatLpa(placement.salary_lower) || 'N/A'} – {formatLpa(placement.salary_upper) || 'N/A'}
                    </p>
                  </div>
                </CardBody>
              </Card>
            )}
            <Card>
              <CardBody className="flex items-center gap-3">
                <Clock className="text-amber-400" size={20} />
                <div>
                  <p className="text-xs text-slate-500">Apply By</p>
                  <p className="text-sm font-semibold text-orbit-text-primary">{formatDateTime(placement.last_date_of_submission)}</p>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="flex items-center gap-3">
                <GraduationCap className="text-violet-400" size={20} />
                <div>
                  <p className="text-xs text-slate-500">Minimum CGPA</p>
                  <p className="text-sm font-semibold text-orbit-text-primary">{placement.min_cgpa ?? 'N/A'}</p>
                </div>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardBody>
              <h2 className="text-sm font-semibold text-orbit-text-primary mb-3 flex items-center gap-2">
                <CheckCircle2 size={16} /> Eligibility Criteria
              </h2>
              <div className="flex flex-wrap gap-2">
                <Badge variant={placement.has_backlog ? 'warning' : 'info'}>
                  {placement.has_backlog ? 'Backlogs Allowed' : 'No Active Backlogs'}
                </Badge>
                {placement.min_tenth_division_id && (
                  <Badge variant="neutral">10th: {divisionLabel(placement.min_tenth_division_id) || `Division ${placement.min_tenth_division_id}`}</Badge>
                )}
                {placement.min_twelfth_division_id && (
                  <Badge variant="neutral">12th: {divisionLabel(placement.min_twelfth_division_id) || `Division ${placement.min_twelfth_division_id}`}</Badge>
                )}
              </div>
            </CardBody>
          </Card>

          <div className="flex items-center gap-3">
            <Button variant="outline" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>Back</Button>
            {isStudent && (
              <Button disabled={hasApplied} onClick={() => applyModal.open()}>
                {hasApplied ? 'Applied' : 'Apply Now'}
              </Button>
            )}
          </div>
        </div>
      )}

      {isStudent && placement && (
        <ApplyModal
          open={applyModal.isOpen}
          onClose={applyModal.close}
          opportunity={placement}
          type="Placement"
          onApplied={() => setHasApplied(true)}
        />
      )}
    </DashboardShell>
  )
}
