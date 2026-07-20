import { Card, CardHeader, CardBody } from '@/components/ui'
import { cn } from '@/utils/cn'

/**
 * Label/value grid for detail views (applicant details, placement details, application detail).
 * fields: [{ label, value, full? }]
 */
export function DetailCard({ title, subtitle, actions, fields = [], children, className }) {
  return (
    <Card className={className}>
      {(title || subtitle || actions) && <CardHeader title={title} subtitle={subtitle} actions={actions} />}
      <CardBody>
        {fields.length > 0 && (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {fields.map((f, i) => (
              <div key={i} className={cn(f.full && 'sm:col-span-2')}>
                <dt className="text-xs font-medium text-slate-500">{f.label}</dt>
                <dd className="text-sm text-orbit-text-primary mt-0.5 break-words">{f.value ?? '—'}</dd>
              </div>
            ))}
          </dl>
        )}
        {children}
      </CardBody>
    </Card>
  )
}

export default DetailCard
