import useIdleAutoLogout from '../hooks/useIdleAutoLogout'
import { Breadcrumb } from '@/components/common/Breadcrumb'

/**
 * Page shell used by nearly every dashboard page. The greeting banner (item 24) has been
 * removed entirely — it added a redundant, ever-present "Good Morning, X" heading on top of
 * each page's own title. `title` is optional: pages whose content already renders its own
 * heading (e.g. ProfileView, NotificationsView) omit it to avoid a duplicate heading.
 */
export default function DashboardShell({ title, subtitle, breadcrumb, children }) {
  useIdleAutoLogout()

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      {title && (
        <div>
          <h1 className="text-xl font-bold text-orbit-text-primary">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}
