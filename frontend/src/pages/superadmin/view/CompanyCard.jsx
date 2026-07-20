import { motion } from "framer-motion";
import {
  Building2,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock3,
  FileText,
} from "lucide-react";

import { Card, CardBody, Badge, Button } from "../../../components/ui";

export default function CompanyCard({
  company,
  tab,
  loading = false,
  onApprove,
  onReject,
}) {
  const email = company.email || "No email available";
  const mobile = company.mobile_no || "No mobile number available";
  const registeredDate = company.created_on
    ? new Date(company.created_on).toLocaleDateString()
    : "N/A";
  const rejectionRemark = company.remarks || "No rejection remark provided.";

  const getStatus = () => {
    switch (tab) {
      case "approved":
        return {
          text: "Approved",
          variant: "success",
          icon: <CheckCircle2 size={14} />,
        };

      case "rejected":
        return {
          text: "Rejected",
          variant: "danger",
          icon: <XCircle size={14} />,
        };

      default:
        return {
          text: "Pending",
          variant: "warning",
          icon: <Clock3 size={14} />,
        };
    }
  };

  const status = getStatus();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="h-full hover:border-orbit-primary/40 transition-all">
        <CardBody>
          <div className="flex flex-col gap-4">

            {/* Logo */}

            <div className="w-12 h-12 rounded-xl bg-orbit-primary/10 border border-orbit-primary/20 flex items-center justify-center flex-shrink-0">
              <Building2
                size={22}
                className="text-orbit-primary-light"
              />
            </div>

            {/* Details */}

            <div className="flex-1">

              <div className="flex flex-col gap-2">

                <div>
                  <h3 className="text-base font-semibold text-slate-100 break-words">
                    {company.name}
                  </h3>

                  <Badge
                    variant={status.variant}
                    className="mt-1 inline-flex items-center gap-1"
                  >
                    {status.icon}
                    {status.text}
                  </Badge>
                </div>

              </div>

              {/* Company Information */}

              <div className="grid grid-cols-1 gap-y-3 mt-5">

                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Mail size={15} />
                  <span className="break-all">{email}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Phone size={15} />
                  <span>{mobile}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar size={15} />

                  <span>{registeredDate}</span>
                </div>

              </div>

              {/* Rejection Remark */}

              {tab === "rejected" && (
                <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4">

                  <div className="flex items-center gap-2 mb-2">
                    <FileText
                      size={16}
                      className="text-red-400"
                    />

                    <p className="font-medium text-red-300">
                      Rejection Remark
                    </p>
                  </div>

                  <p className="text-sm text-slate-300 leading-6">
                    {rejectionRemark}
                  </p>

                </div>
              )}

              {/* Actions */}

              {tab === "pending" && (
                <div className="mt-6 flex flex-wrap gap-3">

                  <Button
                    loading={loading}
                    onClick={() => onApprove(company)}
                    className="min-w-[120px]"
                  >
                    <CheckCircle2
                      size={16}
                      className="mr-2"
                    />
                    Approve
                  </Button>

                  <Button
                    variant="destructive"
                    loading={loading}
                    onClick={() => onReject(company)}
                    className="min-w-[120px]"
                  >
                    <XCircle
                      size={16}
                      className="mr-2"
                    />
                    Reject
                  </Button>

                </div>
              )}

            </div>

          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
