import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

/**
 * Shared modal shell — backdrop, escape-to-close, click-outside-to-close, header/body/footer
 * slots — replacing the hand-rolled `fixed inset-0 bg-black/70` + AnimatePresence markup that
 * was previously duplicated per modal (RejectRemarkModal, notes preview modals, etc).
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  size = 'md',
  footer,
  closeOnBackdrop = true,
  children,
  className,
}) {
  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => closeOnBackdrop && onClose?.()}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 25 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'w-full rounded-2xl border border-orbit-border bg-orbit-surface shadow-2xl max-h-[90vh] flex flex-col',
              SIZES[size],
              className
            )}
          >
            {(title || icon) && (
              <div className="flex items-center justify-between border-b border-orbit-border px-6 py-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  {icon && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orbit-primary/10 text-orbit-primary-light">
                      {icon}
                    </div>
                  )}
                  <div>
                    {title && <h2 className="text-base font-semibold text-orbit-text-primary">{title}</h2>}
                    {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onClose?.()}
                  className="rounded-lg p-2 transition hover:bg-orbit-surface2"
                >
                  <X size={18} className="text-slate-400" />
                </button>
              </div>
            )}

            <div className="px-6 py-5 overflow-y-auto">{children}</div>

            {footer && (
              <div className="flex justify-end gap-3 border-t border-orbit-border px-6 py-4 flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Modal
