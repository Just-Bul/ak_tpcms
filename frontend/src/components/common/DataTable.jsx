import { cn } from '@/utils/cn'
import { Loading } from '@/components/common/Loading'
import { EmptyState } from '@/components/common/EmptyState'

/**
 * Shared table — replaces the hand-rolled <table> markup duplicated across
 * Students/Companies/Departments/Coordinators list pages per role.
 *
 * columns: [{ key, header, render?: (row) => node, className? }]
 * rowKey: (row) => string | number
 * Optional bulk-selection (item 27): pass `selectable` + `selectedKeys`/`onSelectionChange`.
 */
export function DataTable({
  columns,
  data = [],
  rowKey,
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription,
  onRowClick,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  className,
}) {
  if (loading) return <Loading label="Loading records..." />
  if (!data.length) return <EmptyState title={emptyTitle} description={emptyDescription} />

  const getKey = (row) => (rowKey ? rowKey(row) : row.id ?? row.user_id)
  const allSelected = selectable && data.length > 0 && data.every((row) => selectedKeys?.has(getKey(row)))

  const toggleAll = () => {
    if (!onSelectionChange) return
    if (allSelected) {
      const next = new Set(selectedKeys)
      data.forEach((row) => next.delete(getKey(row)))
      onSelectionChange(next)
    } else {
      const next = new Set(selectedKeys)
      data.forEach((row) => next.add(getKey(row)))
      onSelectionChange(next)
    }
  }

  const toggleRow = (key) => {
    if (!onSelectionChange) return
    const next = new Set(selectedKeys)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onSelectionChange(next)
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-orbit-border">
            {selectable && (
              <th className="px-3 py-2.5 w-8">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-orbit-border" />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn('text-left text-xs font-medium text-slate-500 px-3 py-2.5 whitespace-nowrap', col.headerClassName)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const key = getKey(row)
            return (
              <tr
                key={key}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b border-orbit-border/60 last:border-0',
                  onRowClick && 'cursor-pointer hover:bg-white/5'
                )}
              >
                {selectable && (
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedKeys?.has(key) || false}
                      onChange={() => toggleRow(key)}
                      className="rounded border-orbit-border"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-3 py-2.5 text-orbit-text-secondary', col.className)}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
