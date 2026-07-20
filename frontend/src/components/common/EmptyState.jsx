import { Inbox } from 'lucide-react'

export function EmptyState({ icon, title = 'Nothing here yet', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orbit-surface2 text-slate-500">
        {icon ?? <Inbox className="w-5 h-5" />}
      </div>
      <div>
        <p className="text-sm font-medium text-orbit-text-primary">{title}</p>
        {description && <p className="text-xs text-slate-500 mt-1 max-w-xs">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export default EmptyState
