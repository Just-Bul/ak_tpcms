import { Badge } from '@/components/ui'

/**
 * Wraps the base Badge with the app's actual cva variants (success/warning/danger/info/
 * primary/accent/neutral) so callers can't accidentally pass an invalid variant like
 * "secondary"/"destructive" (previously silently fell back to unstyled neutral in several pages).
 */
export function StatusBadge({ status, variant, label, dot = true, ...props }) {
  const resolved = status && typeof status === 'object' ? status : { label: label ?? status, variant }
  return (
    <Badge variant={resolved.variant ?? 'neutral'} dot={dot} {...props}>
      {resolved.label}
    </Badge>
  )
}

export default StatusBadge
