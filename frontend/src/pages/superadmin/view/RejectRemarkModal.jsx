import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { XCircle, X } from "lucide-react";
import { Button } from "../../../components/ui";

export default function RejectRemarkModal({
  open,
  company,
 loading = false,
  onClose,
  onConfirm,
}) {
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (open) {
      setRemarks("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, [open, loading, onClose]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!remarks.trim()) {
      alert("Please enter a rejection remark.");
      return;
    }

    onConfirm(remarks.trim());
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          if (!loading) onClose();
        }}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{
            opacity: 0,
            scale: 0.9,
            y: 25,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.9,
            y: 25,
          }}
          transition={{
            duration: 0.2,
          }}
          className="w-full max-w-xl rounded-2xl border border-orbit-border bg-orbit-surface shadow-2xl"
        >
          {/* Header */}

          <div className="flex items-center justify-between border-b border-orbit-border px-6 py-5">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">

                <XCircle
                  size={26}
                  className="text-red-500"
                />

              </div>

              <div>

                <h2 className="text-lg font-semibold text-slate-100">
                  Reject Organization
                </h2>

                <p className="text-sm text-slate-400">
                  Please provide a reason before rejecting.
                </p>

              </div>

            </div>

            <button
              disabled={loading}
              onClick={onClose}
              className="rounded-lg p-2 transition hover:bg-orbit-surface2 disabled:opacity-50"
            >
              <X
                size={18}
                className="text-slate-400"
              />
            </button>

          </div>

          {/* Company Info */}

          {company && (
            <div className="px-6 pt-5">

              <div className="rounded-xl border border-orbit-border bg-orbit-surface2 p-4">

                <h3 className="font-semibold text-slate-100">
                  {company.name}
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  {company.email}
                </p>

                <p className="text-sm text-slate-500">
                  {company.mobile_no}
                </p>

              </div>

            </div>
          )}

          {/* Body */}

          <div className="px-6 py-5">

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Rejection Remark
            </label>

            <textarea
              rows={5}
              maxLength={500}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Example: Company registration documents are incomplete."
              className="
                w-full
                rounded-xl
                border
                border-orbit-border
                bg-orbit-surface2
                px-4
                py-3
                text-sm
                text-slate-200
                placeholder:text-slate-500
                outline-none
                resize-none
                focus:border-red-500
                focus:ring-2
                focus:ring-red-500/20
              "
            />

            <div className="mt-2 flex items-center justify-between">

              <p className="text-xs text-slate-500">
                This remark will be stored and visible later.
              </p>

              <span className="text-xs text-slate-500">
                {remarks.length}/500
              </span>

            </div>

          </div>

          {/* Footer */}

          <div className="flex justify-end gap-3 border-t border-orbit-border px-6 py-5">

            <Button
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              loading={loading}
              onClick={handleSubmit}
            >
              Reject Company
            </Button>

          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}