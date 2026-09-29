import { useState } from 'react'
import {
  Building2,
  Eye,
  Mail,
  Phone,
  Calendar,
  FileText,
} from 'lucide-react'

import { Button, Badge } from '../../../components/ui'
import CompanyApplicationModal from '../../../components/modals/CompanyApplicationModal'

export default function CompanyCard({
  company,
  tab,
  loading = false,
  onApprove,
  onReject,
}) {
  const [showApplication, setShowApplication] = useState(false)

  if (!company) return null

  /*
   * The CompaniesPage already fetches the correct list:
   *
   * pending  -> /organizations?status=pending
   * approved -> /organizations?status=approved
   * rejected -> /organizations?status=rejected
   *
   * Therefore the tab is the reliable status for this card.
   *
   * If backend eventually returns a normalized `status`,
   * it will still be respected.
   */
  const status = String(
    company.status || tab || 'pending'
  ).toLowerCase()

  const isPending = status === 'pending'
  const isApproved = status === 'approved'
  const isRejected = status === 'rejected'

  const statusLabel = isApproved
    ? 'Approved'
    : isRejected
      ? 'Rejected'
      : 'Pending'

  const statusVariant = isApproved
    ? 'success'
    : isRejected
      ? 'danger'
      : 'warning'

  return (
    <>
      {/* =====================================================
          COMPANY CARD
      ===================================================== */}

      <div
        className="
          w-full
          min-w-0
          overflow-hidden
          rounded-2xl
          border border-orbit-border
          bg-orbit-surface
          shadow-sm
          transition-all
          duration-200
          hover:border-orbit-primary/30
          hover:shadow-lg
        "
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="flex items-start justify-between gap-4 p-5">

          <div className="flex min-w-0 items-center gap-3">

            {/* Icon */}
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-orbit-primary/20
                bg-orbit-primary/10
              "
            >
              <Building2
                size={22}
                className="text-orbit-primary-light"
              />
            </div>

            {/* Company */}
            <div className="min-w-0">

              <h3
                className="
                  truncate
                  text-base
                  font-semibold
                  text-orbit-text-primary
                "
              >
                {company.name || 'Unnamed Company'}
              </h3>

              <p className="mt-1 truncate text-xs text-slate-500">
                Company Registration
              </p>

            </div>

          </div>

          {/* Status */}
          <div className="shrink-0">
            <Badge variant={statusVariant}>
              {statusLabel}
            </Badge>
          </div>

        </div>


        {/* ===================================================
            COMPANY INFORMATION
        =================================================== */}

        <div className="space-y-3 px-5 pb-5">

          {/* Email */}
          <div className="flex min-w-0 items-center gap-3">

            <Mail
              size={16}
              className="shrink-0 text-slate-500"
            />

            <span className="truncate text-sm text-slate-300">
              {company.email || 'No email provided'}
            </span>

          </div>


          {/* Mobile */}
          <div className="flex min-w-0 items-center gap-3">

            <Phone
              size={16}
              className="shrink-0 text-slate-500"
            />

            <span className="truncate text-sm text-slate-300">
              {company.mobile_no || 'No mobile provided'}
            </span>

          </div>


          {/* Date */}
          <div className="flex min-w-0 items-center gap-3">

            <Calendar
              size={16}
              className="shrink-0 text-slate-500"
            />

            <span className="truncate text-sm text-slate-300">
              {company.created_on
                ? new Date(
                    company.created_on
                  ).toLocaleDateString()
                : 'Date unavailable'}
            </span>

          </div>

        </div>


        {/* ===================================================
            SUPPORTING DOCUMENT
        =================================================== */}

        <div className="border-t border-orbit-border px-5 py-4">

          <button
            type="button"
            onClick={() =>
              setShowApplication(true)
            }
            className="
              flex
              w-full
              min-w-0
              items-center
              justify-between
              rounded-xl
              border
              border-orbit-border
              bg-orbit-surface2
              px-4
              py-3
              text-left
              transition-colors
              hover:border-orbit-primary/40
              hover:bg-orbit-primary/5
            "
          >

            <div className="flex min-w-0 items-center gap-3">

              <FileText
                size={17}
                className="
                  shrink-0
                  text-orbit-primary-light
                "
              />

              <div className="min-w-0">

                <p className="text-sm font-medium text-slate-200">
                  Supporting Document
                </p>

                <p className="truncate text-xs text-slate-500">
                  Click to view application
                </p>

              </div>

            </div>

            <Eye
              size={17}
              className="shrink-0 text-slate-400"
            />

          </button>

        </div>


        {/* ===================================================
            ACTIONS
        =================================================== */}

        <div
          className="
            flex
            flex-col
            gap-3
            border-t
            border-orbit-border
            p-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          {/* View Application */}

          <Button
            variant="outline"
            onClick={() =>
              setShowApplication(true)
            }
            className="w-full sm:flex-1"
          >
            <Eye
              size={15}
              className="mr-2"
            />

            View Application
          </Button>


          {/* =================================================
              ONLY PENDING COMPANIES CAN BE APPROVED/REJECTED
          ================================================= */}

          {isPending && (

            <div className="flex w-full gap-2 sm:w-auto">

              <Button
                variant="destructive"
                loading={loading}
                onClick={() =>
                  onReject?.(company)
                }
                className="
                  flex-1
                  sm:flex-none
                "
              >
                Reject
              </Button>


              <Button
                loading={loading}
                onClick={() =>
                  onApprove?.(company)
                }
                className="
                  flex-1
                  sm:flex-none
                "
              >
                Approve
              </Button>

            </div>

          )}

        </div>

      </div>


      {/* =====================================================
          APPLICATION MODAL
      ===================================================== */}

      <CompanyApplicationModal
        company={{
          ...company,
          status,
        }}
        open={showApplication}
        loading={loading}
        onClose={() =>
          setShowApplication(false)
        }
        onApprove={onApprove}
        onReject={onReject}
      />

    </>
  )
}