import { cn } from '@/utils/cn'

export function Card({ className, glass, gradient, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-orbit-border bg-orbit-surface',
        glass && 'glass',
        gradient && 'gradient-border',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, actions, className, children, ...props }) {
  return (
    <div className={cn('flex items-start justify-between px-5 pt-5', className)} {...props}>
      {(title || subtitle) ? (
        <div>
          {title && <h3 className="text-sm font-semibold text-slate-200">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      ) : children}
      {actions && <div className="ml-4 flex-shrink-0">{actions}</div>}
    </div>
  )
}

export function CardBody({ className, children, ...props }) {
  return (
    <div className={cn('px-5 py-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn('px-5 pb-5 pt-0 border-t border-orbit-border mt-2 pt-4', className)} {...props}>
      {children}
    </div>
  )
}
