import { format, formatDistanceToNow, isValid } from 'date-fns'

function toDate(value) {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  return isValid(d) ? d : null
}

/** e.g. "20 Jul 2026, 3:45 PM" */
export function formatDateTime(value, fallback = '—') {
  const d = toDate(value)
  return d ? format(d, 'dd MMM yyyy, h:mm a') : fallback
}

/** e.g. "20 Jul 2026" */
export function formatDate(value, fallback = '—') {
  const d = toDate(value)
  return d ? format(d, 'dd MMM yyyy') : fallback
}

/** e.g. "3 hours ago" */
export function formatRelative(value, fallback = '—') {
  const d = toDate(value)
  return d ? formatDistanceToNow(d, { addSuffix: true }) : fallback
}

export default formatDateTime
