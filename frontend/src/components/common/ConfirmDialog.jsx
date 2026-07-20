import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/ui'

/**
 * Shared yes/no confirmation dialog (disable student/company, delete, etc.),
 * built on the common Modal shell instead of a bespoke implementation per caller.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'destructive',
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      icon={<AlertTriangle size={20} />}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {description && <p className="text-sm text-slate-400">{description}</p>}
    </Modal>
  )
}

export default ConfirmDialog
