import { Briefcase, Building2, Clock, Users, IndianRupee } from 'lucide-react'
import { Card, CardBody, Badge, Button } from '@/components/ui'
import { getAssetUrl } from '@/utils/getAssetUrl'
import { formatDate } from '@/utils/formatDateTime'

function formatLpa(value) {
  if (!value) return null
  return `₹${(value / 100000).toFixed(1)}L`
}

/** Modern placement/job card (item 25), shared across all roles' list views. */
export function PlacementCard({ placement, applicantCount, hasApplied, onView, onApply, applying }) {
  const p = placement
  const company = p.organization_table?.user_table?.name || p.user_table?.name || 'Company'
  const isExpired = p.last_date_of_submission && new Date(p.last_date_of_submission) < new Date()

  return (
    <Card className="hover:border-orbit-primary/40 transition-all cursor-pointer" onClick={onView}>
      {p.image_url && (
        <img src={getAssetUrl(p.image_url)} alt="" className="h-28 w-full rounded-t-xl object-cover" />
      )}
      <CardBody>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-orbit-text-primary truncate">{p.title || 'Untitled Placement'}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <Building2 size={12} /> {company}
            </p>
          </div>
          <Badge variant={p.is_active && !isExpired ? 'success' : 'neutral'}>
            {p.is_active && !isExpired ? 'Active' : isExpired ? 'Expired' : 'Closed'}
          </Badge>
        </div>

        {p.description && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{p.description}</p>}

        <div className="flex flex-wrap items-center gap-2 mt-3">
          {(p.salary_lower || p.salary_upper) && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
              <IndianRupee size={10} /> {formatLpa(p.salary_lower) || 'N/A'} - {formatLpa(p.salary_upper) || 'N/A'}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
            <Clock size={11} /> Apply by {formatDate(p.last_date_of_submission)}
          </span>
          {typeof applicantCount === 'number' && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
              <Users size={11} /> {applicantCount} applicant{applicantCount === 1 ? '' : 's'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" icon={<Briefcase size={13} />} onClick={onView} className="flex-1">
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

export default PlacementCard
