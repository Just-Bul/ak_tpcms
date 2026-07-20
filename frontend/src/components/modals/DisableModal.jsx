import { useState } from 'react'
import { Ban } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Loading } from '@/components/common/Loading'
import { EmptyState } from '@/components/common/EmptyState'
import { SearchBar } from '@/components/common/SearchBar'
import { Button, Badge } from '@/components/ui'
import { useDebounce } from '@/hooks/useDebounce'

/**
 * Generic enable/disable management list, shown in a modal instead of a dedicated page.
 * Reusable across Students/Companies/etc — caller supplies field accessors.
 */
export function DisableModal({
  open,
  onClose,
  title = 'Manage Status',
  items = [],
  loading = false,
  getId,
  getLabel,
  getSubLabel,
  isDisabled,
  onToggle,
  disabledLabel = 'Disabled',
  activeLabel = 'Active',
}) {
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const debouncedSearch = useDebounce(search)

  const filtered = items.filter((item) => {
    const q = debouncedSearch.toLowerCase()
    if (!q) return true
    return (
      String(getLabel(item)).toLowerCase().includes(q) ||
      String(getSubLabel?.(item) || '').toLowerCase().includes(q)
    )
  })

  const handleToggle = async (item) => {
    setUpdatingId(getId(item))
    try {
      await onToggle(item)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title} icon={<Ban size={18} />} size="lg">
      <div className="space-y-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search..." />
        {loading ? (
          <Loading label="Loading..." />
        ) : filtered.length === 0 ? (
          <EmptyState title="Nothing found" />
        ) : (
          <div className="max-h-[50vh] overflow-y-auto space-y-1.5">
            {filtered.map((item) => {
              const id = getId(item)
              const disabled = isDisabled(item)
              return (
                <div
                  key={id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-orbit-border bg-orbit-surface2/40 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-orbit-text-primary truncate">{getLabel(item)}</p>
                    {getSubLabel && <p className="text-xs text-slate-500 truncate">{getSubLabel(item)}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={disabled ? 'neutral' : 'success'}>{disabled ? disabledLabel : activeLabel}</Badge>
                    <Button
                      size="sm"
                      variant={disabled ? 'outline' : 'destructive'}
                      loading={updatingId === id}
                      onClick={() => handleToggle(item)}
                    >
                      {disabled ? 'Enable' : 'Disable'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default DisableModal
