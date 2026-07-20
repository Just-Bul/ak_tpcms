import { Bell } from "lucide-react";
export default function NotificationsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Notifications</h1>
        <p className="text-sm text-slate-500 mt-1">Stay updated with the latest alerts and announcements.</p>
      </div>
      <div className="bg-orbit-surface rounded-xl border border-orbit-border p-10 text-center">
        <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500">No new notifications at this time.</p>
      </div>
    </div>
  )
}
