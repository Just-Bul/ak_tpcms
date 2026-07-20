import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

/** items: [{ label, to? }] — last item renders as plain text (current page). */
export function Breadcrumb({ items = [], className }) {
  return (
    <nav className={cn('flex items-center gap-1.5 text-xs text-slate-500 mb-3', className)}>
      <Home className="w-3.5 h-3.5" />
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-slate-600" />
            {item.to && !isLast ? (
              <Link to={item.to} className="hover:text-slate-300 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-orbit-text-secondary font-medium' : ''}>{item.label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}

export default Breadcrumb
