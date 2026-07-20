import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

export const Select = forwardRef(
  ({ className, label, error, hint, id, children, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-slate-400 mb-1.5">
            {label}
          </label>
        )}
        <div className={cn(
          'relative flex items-center h-9 rounded-lg border bg-orbit-surface2 text-sm transition-colors',
          'border-orbit-border focus-within:border-orbit-primary focus-within:ring-1 focus-within:ring-orbit-primary/30',
          error && 'border-orbit-danger focus-within:border-orbit-danger focus-within:ring-orbit-danger/30',
          props.disabled && 'opacity-50 cursor-not-allowed',
        )}>
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'flex-1 h-full bg-transparent text-slate-200 outline-none min-w-0 pl-3 pr-8 appearance-none',
              props.disabled && 'cursor-not-allowed',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 pointer-events-none" />
        </div>
        {(error || hint) && (
          <p className={cn('text-xs mt-1.5', error ? 'text-orbit-danger' : 'text-slate-500')}>
            {error ?? hint}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
