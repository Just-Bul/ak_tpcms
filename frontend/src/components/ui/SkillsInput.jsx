import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Comma-separated skills input that converts entries into removable chips/tags (item 18).
 * `value` is always an array of strings; typing a comma (or pressing Enter) commits a chip.
 */
export function SkillsInput({ label, value = [], onChange, placeholder = 'Type a skill and press comma or Enter...' }) {
  const [draft, setDraft] = useState('')

  const commit = (raw) => {
    const parts = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (!parts.length) return
    const next = [...value]
    parts.forEach((p) => {
      if (!next.some((existing) => existing.toLowerCase() === p.toLowerCase())) next.push(p)
    })
    onChange(next)
  }

  const handleChange = (e) => {
    const raw = e.target.value
    if (raw.includes(',')) {
      commit(raw)
      setDraft('')
    } else {
      setDraft(raw)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commit(draft)
      setDraft('')
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  const remove = (skill) => onChange(value.filter((s) => s !== skill))

  return (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>}
      <div
        className={cn(
          'flex flex-wrap items-center gap-1.5 min-h-9 rounded-lg border bg-orbit-surface2 px-2 py-1.5',
          'border-orbit-border focus-within:border-orbit-primary focus-within:ring-1 focus-within:ring-orbit-primary/30'
        )}
      >
        {value.map((skill) => (
          <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-orbit-primary/15 text-orbit-primary-light text-xs px-2.5 py-1">
            {skill}
            <button type="button" onClick={() => remove(skill)} className="hover:text-orbit-danger">
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (draft.trim()) {
              commit(draft)
              setDraft('')
            }
          }}
          placeholder={value.length ? '' : placeholder}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none py-0.5"
        />
      </div>
    </div>
  )
}

export default SkillsInput
