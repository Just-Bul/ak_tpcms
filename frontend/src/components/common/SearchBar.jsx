import { Search, X } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Shared search input — replaces the near-identical hand-written
 * `<Search icon> + <input>` combo duplicated across nearly every list page.
 * Trims leading/trailing whitespace on change (item 31).
 */
export function SearchBar({ value, onChange, placeholder = 'Search...', className }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 h-9 rounded-lg border border-orbit-border bg-orbit-surface2 px-3',
        'focus-within:border-orbit-primary focus-within:ring-1 focus-within:ring-orbit-primary/30',
        className
      )}
    >
      <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value.replace(/^\s+/, ''))}
        onBlur={(e) => onChange?.(e.target.value.trim())}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none min-w-0"
      />
      {value && (
        <button type="button" onClick={() => onChange?.('')} className="flex-shrink-0">
          <X className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
        </button>
      )}
    </div>
  )
}

export default SearchBar
