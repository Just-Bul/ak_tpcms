import { BookOpenCheck, Building2, Clock, Users } from 'lucide-react'
import { Card, CardBody, Badge, Button } from '@/components/ui'
import { getAssetUrl } from '@/utils/getAssetUrl'
import { formatDate } from '@/utils/formatDateTime'

/** Modern training card (item 25), shared across all roles' list views. */
export function TrainingCard({ training, applicantCount, hasApplied, onView, onApply, applying }) {
  const t = training
  const company = t.organization_table?.user_table?.name || t.user_table?.name || 'Organizer'
  const isExpired = t.last_date_of_submission && new Date(t.last_date_of_submission) < new Date()

  return (
    <Card className="hover:border-orbit-primary/40 transition-all cursor-pointer" onClick={onView}>
      {t.image_url && (
        <img src={getAssetUrl(t.image_url)} alt="" className="h-28 w-full rounded-t-xl object-cover" />
      )}
      <CardBody>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-orbit-text-primary truncate">{t.title || 'Untitled Training'}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <Building2 size={12} /> {company}
            </p>
          </div>
          <Badge variant={t.is_active && !isExpired ? 'success' : 'neutral'}>
            {t.is_active && !isExpired ? 'Active' : isExpired ? 'Expired' : 'Closed'}
          </Badge>
        </div>

        {t.description && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{t.description}</p>}

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
            <Clock size={11} /> Apply by {formatDate(t.last_date_of_submission)}
          </span>
          {typeof applicantCount === 'number' && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
              <Users size={11} /> {applicantCount} applicant{applicantCount === 1 ? '' : 's'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" icon={<BookOpenCheck size={13} />} onClick={onView} className="flex-1">
            View Details
          </Button>
          {onApply && (
            <Button size="sm" disabled={hasApplied} loading={applying} onClick={onApply} className="flex-1">
              {hasApplied ? 'Applied' : 'Apply'}
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

export default TrainingCard
