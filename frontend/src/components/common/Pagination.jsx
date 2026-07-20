import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

export function Pagination({ page, totalPages, total, onPageChange, className }) {
  if (totalPages <= 1) return null

  return (
    <div className={cn('flex items-center justify-between gap-3 pt-3', className)}>
      <p className="text-xs text-slate-500">
        Page {page} of {totalPages}
        {typeof total === 'number' && <> · {total} total</>}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-orbit-border text-slate-400 hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-orbit-border text-slate-400 hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export default Pagination
