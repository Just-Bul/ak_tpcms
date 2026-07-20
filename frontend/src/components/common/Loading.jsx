import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

export function Loading({ label = 'Loading...', className, size = 'md' }) {
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 py-10 text-slate-500', className)}>
      <Loader2 className={cn(iconSize, 'animate-spin text-orbit-primary')} />
      {label && <p className="text-xs">{label}</p>}
    </div>
  )
}

export default Loading
