import { FileCheck } from "lucide-react";
export default function DocumentsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Documents</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your uploaded documents and certificates.</p>
      </div>
      <div className="bg-orbit-surface rounded-xl border border-orbit-border p-10 text-center">
        <FileCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500">No documents uploaded yet.</p>
      </div>
    </div>
  )
}