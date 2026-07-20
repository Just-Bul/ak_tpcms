import { GraduationCap } from "lucide-react";
export default function AcademicView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Academic Records</h1>
        <p className="text-sm text-slate-500 mt-1">View your academic history and grades.</p>
      </div>
      <div className="bg-orbit-surface rounded-xl border border-orbit-border p-10 text-center">
        <GraduationCap className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500">Academic records will appear here.</p>
      </div>
    </div>
  )
}