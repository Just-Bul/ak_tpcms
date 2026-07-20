import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Building2, Clock, GraduationCap } from 'lucide-react'
import DashboardShell from '@/components/DashboardShell'
import { Card, CardBody, Badge, Button } from '@/components/ui'
import { Loading } from '@/components/common/Loading'
import { ApplyModal } from '@/components/modals/ApplyModal'
import { useAuth } from '@/hooks/useAuth'
import { useModal } from '@/hooks/useModal'
import { fetchTraining } from '@/services/trainings'
import { fetchTrainingApplications } from '@/services/applications'
import { getAssetUrl } from '@/utils/getAssetUrl'
import { formatDateTime } from '@/utils/formatDateTime'

/** Training Details Page, mirroring PlacementDetailPage (item 8's pattern applied to trainings). */
export default function TrainingDetailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { role } = useAuth()
  const isStudent = role === 'Student'
  const trainingId = searchParams.get('id')

  const [training, setTraining] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasApplied, setHasApplied] = useState(false)
  const applyModal = useModal()

  useEffect(() => {
    if (!trainingId) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetchTraining(trainingId)
      .then(setTraining)
      .catch((err) => setError(err.message || 'Failed to load training'))
      .finally(() => setLoading(false))

    if (isStudent) {
      fetchTrainingApplications()
        .then((apps) => setHasApplied(apps.some((a) => String(a.training_id) === String(trainingId))))
        .catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainingId])

  return (
    <DashboardShell title="Training Details">
      {loading ? (
        <Loading label="Loading training..." />
      ) : error || !training ? (
        <Card>
          <CardBody>
            <p className="text-sm text-orbit-danger">{error || 'Training not found.'}</p>
            <Button className="mt-4" variant="outline" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>Back</Button>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-5">
          <Card className="overflow-hidden">
            {training.image_url && (
              <img src={getAssetUrl(training.image_url)} alt="" className="h-56 w-full object-cover" />
            )}
            <CardBody>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold text-orbit-text-primary">{training.title}</h1>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                    <Building2 size={14} />
                    {training.organization_table?.user_table?.name || 'Organizer'}
                  </p>
                </div>
                <Badge variant={training.is_active ? 'success' : 'neutral'}>
                  {training.is_active ? 'Active' : 'Closed'}
                </Badge>
              </div>

              {training.description && (
                <p className="mt-4 text-sm text-slate-400 leading-relaxed whitespace-pre-line">{training.description}</p>
              )}
            </CardBody>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardBody className="flex items-center gap-3">
                <Clock className="text-amber-400" size={20} />
                <div>
                  <p className="text-xs text-slate-500">Apply By</p>
                  <p className="text-sm font-semibold text-orbit-text-primary">{formatDateTime(training.last_date_of_submission)}</p>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="flex items-center gap-3">
                <GraduationCap className="text-violet-400" size={20} />
                <div>
                  <p className="text-xs text-slate-500">Minimum CGPA</p>
                  <p className="text-sm font-semibold text-orbit-text-primary">{training.min_cgpa ?? 'N/A'}</p>
                </div>
              </CardBody>
            </Card>
          </div>

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

      {isStudent && training && (
        <ApplyModal
          open={applyModal.isOpen}
          onClose={applyModal.close}
          opportunity={training}
          type="Training"
          onApplied={() => setHasApplied(true)}
        />
      )}
    </DashboardShell>
  )
}
