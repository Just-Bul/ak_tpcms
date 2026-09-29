import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Building2,
  Mail,
  Phone,
  Calendar,
  FileText,
  Download,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { Button, Badge } from "../ui";
import { getAssetUrl } from "../../utils/getAssetUrl";

export default function CompanyApplicationModal({
  company,
  open,
  onClose,
  loading = false,
  onApprove,
  onReject,
}) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open, onClose]);

  if (!company || !open) {
    return null;
  }

  const companyName =
    company.name || "Unnamed Company";

  const email =
    company.email || "Not provided";

  const mobile =
    company.mobile_no || "Not provided";

  const registeredDate = company.created_on
    ? new Date(company.created_on).toLocaleString()
    : "Not available";

  const documentUrl = company.document_url
    ? getAssetUrl(company.document_url)
    : null;

  const documentName =
    company.document_name ||
    company.document_url?.split("/").pop() ||
    "Supporting Document";

  const documentType =
    company.document_type || "";

  const lowerDocumentUrl =
    documentUrl?.toLowerCase() || "";

  const isPdf =
    lowerDocumentUrl.includes(".pdf") ||
    documentType.toLowerCase() === "pdf";

  const isImage =
    /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(
      lowerDocumentUrl
    );

  const status =
    company.status || "pending";

  const getStatus = () => {
    switch (status) {
      case "approved":
        return {
          text: "Approved",
          variant: "success",
        };

      case "rejected":
        return {
          text: "Rejected",
          variant: "danger",
        };

      default:
        return {
          text: "Pending",
          variant: "warning",
        };
    }
  };

  const currentStatus = getStatus();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: 20,
            }}
            transition={{
              duration: 0.2,
            }}
            className="w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl border border-orbit-border bg-orbit-surface shadow-2xl"
          >

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="flex items-center justify-between border-b border-orbit-border px-6 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orbit-primary/10 border border-orbit-primary/20">

                  <Building2
                    size={21}
                    className="text-orbit-primary-light"
                  />

                </div>

                <div>

                  <h2 className="text-lg font-semibold text-slate-100">
                    Company Application
                  </h2>

                  <p className="text-sm text-slate-400">
                    Review company registration details
                    and supporting documents
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                aria-label="Close application"
              >
                <X size={20} />
              </button>

            </div>

            {/* ================================================= */}
            {/* BODY */}
            {/* ================================================= */}

            <div className="max-h-[calc(92vh-145px)] overflow-y-auto p-6">

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                {/* ================================================= */}
                {/* LEFT - APPLICATION DETAILS */}
                {/* ================================================= */}

                <div className="space-y-5">

                  <div>

                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                      Application Information
                    </h3>

                    <div className="rounded-xl border border-orbit-border bg-orbit-surface2/40 p-5 space-y-5">

                      {/* Company Name */}
                      <div>

                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                          Company Name
                        </label>

                        <div className="flex items-center gap-2 text-sm text-slate-100">

                          <Building2
                            size={16}
                            className="flex-shrink-0 text-orbit-primary-light"
                          />

                          <span className="break-words">
                            {companyName}
                          </span>

                        </div>

                      </div>

                      {/* Email */}
                      <div>

                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                          Email Address
                        </label>

                        <div className="flex items-center gap-2 text-sm text-slate-200 break-all">

                          <Mail
                            size={16}
                            className="flex-shrink-0 text-orbit-primary-light"
                          />

                          <span>
                            {email}
                          </span>

                        </div>

                      </div>

                      {/* Mobile */}
                      <div>

                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                          Mobile Number
                        </label>

                        <div className="flex items-center gap-2 text-sm text-slate-200">

                          <Phone
                            size={16}
                            className="flex-shrink-0 text-orbit-primary-light"
                          />

                          <span>
                            {mobile}
                          </span>

                        </div>

                      </div>

                      {/* Application Date */}
                      <div>

                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                          Application Submitted
                        </label>

                        <div className="flex items-center gap-2 text-sm text-slate-200">

                          <Calendar
                            size={16}
                            className="flex-shrink-0 text-orbit-primary-light"
                          />

                          <span>
                            {registeredDate}
                          </span>

                        </div>

                      </div>

                      {/* Status */}
                      <div>

                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                          Application Status
                        </label>

                        <Badge
                          variant={currentStatus.variant}
                        >
                          {currentStatus.text}
                        </Badge>

                      </div>

                    </div>

                  </div>

                  {/* ================================================= */}
                  {/* REJECTION REMARK */}
                  {/* ================================================= */}

                  {status === "rejected" && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">

                      <div className="mb-2 flex items-center gap-2">

                        <XCircle
                          size={17}
                          className="text-red-400"
                        />

                        <h3 className="font-medium text-red-300">
                          Rejection Remark
                        </h3>

                      </div>

                      <p className="text-sm leading-6 text-slate-300">
                        {company.remarks ||
                          "No rejection remark provided."}
                      </p>

                    </div>
                  )}

                </div>

                {/* ================================================= */}
                {/* RIGHT - SUPPORTING DOCUMENT */}
                {/* ================================================= */}

                <div>

                  <div className="mb-4 flex items-center justify-between">

                    <div>

                      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                        Supporting Document
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Submitted document for verification
                      </p>

                    </div>

                    {documentUrl && (
                      <a
                        href={documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-orbit-primary-light hover:underline"
                      >
                        <ExternalLink size={13} />
                        Open
                      </a>
                    )}

                  </div>

                  <div className="overflow-hidden rounded-xl border border-orbit-border bg-black/20">

                    {documentUrl ? (
                      <>

                        {/* PDF PREVIEW */}
                        {isPdf && (
                          <iframe
                            src={documentUrl}
                            title="Supporting Document"
                            className="h-[500px] w-full bg-white"
                          />
                        )}

                        {/* IMAGE PREVIEW */}
                        {isImage && !isPdf && (
                          <div className="flex min-h-[500px] items-center justify-center bg-slate-950 p-4">

                            <img
                              src={documentUrl}
                              alt="Supporting document"
                              className="max-h-[500px] max-w-full rounded-lg object-contain"
                            />

                          </div>
                        )}

                        {/* OTHER DOCUMENT TYPE */}
                        {!isPdf && !isImage && (
                          <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">

                            <FileText
                              size={48}
                              className="mb-4 text-orbit-primary-light"
                            />

                            <p className="text-sm font-medium text-slate-200 break-all">
                              {documentName}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Preview is not available for
                              this file type.
                            </p>

                            <a
                              href={documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-orbit-border px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
                            >

                              <Download size={15} />

                              Open Document

                            </a>

                          </div>
                        )}

                        {/* DOCUMENT FOOTER */}
                        <div className="flex items-center justify-between border-t border-orbit-border px-4 py-3">

                          <div className="flex min-w-0 items-center gap-2">

                            <FileText
                              size={15}
                              className="flex-shrink-0 text-slate-500"
                            />

                            <span className="truncate text-xs text-slate-400">
                              {documentName}
                            </span>

                          </div>

                          <a
                            href={documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 text-slate-400 hover:text-white"
                            title="Open document"
                          >
                            <Download size={16} />
                          </a>

                        </div>

                      </>
                    ) : (

                      <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">

                        <FileText
                          size={42}
                          className="mb-3 text-slate-600"
                        />

                        <p className="text-sm text-slate-400">
                          No supporting document uploaded
                        </p>

                      </div>

                    )}

                  </div>

                </div>

              </div>

            </div>

            {/* ================================================= */}
            {/* FOOTER */}
            {/* ================================================= */}

            <div className="flex items-center justify-between gap-3 border-t border-orbit-border px-6 py-4">

              <Button
                variant="secondary"
                onClick={onClose}
              >
                Close
              </Button>

              {status === "pending" && (
                <div className="flex gap-3">

                  <Button
                    variant="destructive"
                    loading={loading}
                    onClick={() => onReject(company)}
                  >
                    <XCircle
                      size={16}
                      className="mr-2"
                    />

                    Reject
                  </Button>

                  <Button
                    loading={loading}
                    onClick={() => onApprove(company)}
                  >
                    <CheckCircle2
                      size={16}
                      className="mr-2"
                    />

                    Approve
                  </Button>

                </div>
              )}

            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}