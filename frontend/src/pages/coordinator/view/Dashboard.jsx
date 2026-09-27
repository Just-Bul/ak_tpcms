import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Users,
  Briefcase,
  Bell,
  FileText,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Filter,
  Megaphone,
  ClipboardList,
} from "lucide-react";

import DashboardShell from "../../../components/DashboardShell";
import api from "../../../services/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    api
      .get("/dashboards")
      .then((res) => setMetrics(res?.data || null))
      .catch(() => setMetrics(null));
  }, []);

  const statsData = [
    {
      id: "dept-students",
      label: "Department Students",
      value: metrics?.studentCount ?? "—",
      change: 5.2,
      icon: Users,
      color: "violet",
      view: "students",
    },
    {
      id: "orgs",
      label: "Organizations",
      value: metrics?.organizationCount ?? "—",
      change: 8.3,
      icon: Briefcase,
      color: "cyan",
      view: "organizations",
    },
    {
      id: "applications",
      label: "Placement Applications",
      value: metrics?.placementApplicationCount ?? "—",
      change: 12.8,
      icon: UserCheck,
      color: "emerald",
      view: "placement-applications",
    },
    {
      id: "training",
      label: "Training Applications",
      value: metrics?.trainingApplicationCount ?? "—",
      change: 33.3,
      icon: Bell,
      color: "amber",
      view: "training-applications",
    },
  ];

  return (
    <DashboardShell
      title="Coordinator Dashboard"
      subtitle="Manage department training and placement activities."
    >
      {/* ==========================================================
          STATISTICS CARDS
      ========================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, i) => {
          const colors = {
            violet: {
              bg: "bg-violet-500/15",
              text: "text-violet-400",
            },
            cyan: {
              bg: "bg-cyan-500/15",
              text: "text-cyan-400",
            },
            emerald: {
              bg: "bg-emerald-500/15",
              text: "text-emerald-400",
            },
            amber: {
              bg: "bg-amber-500/15",
              text: "text-amber-400",
            },
          }[stat.color];

          const isPositive = stat.change >= 0;

          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: i * 0.07,
              }}
              onClick={() => {
                if (stat.view) {
                  navigate(
                    `/coordinator/dashboard?view=${stat.view}`
                  );
                }
              }}
              className={`rounded-xl border border-orbit-border bg-orbit-surface p-5 transition-colors hover:border-orbit-border2 ${
                stat.view ? "cursor-pointer" : ""
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className={`rounded-lg p-2 ${colors.bg}`}>
                  <stat.icon
                    className={`h-4 w-4 ${colors.text}`}
                  />
                </div>

                <div
                  className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                    isPositive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}

                  {Math.abs(stat.change)}%
                </div>
              </div>

              <p className="mb-1 text-xs font-medium text-slate-500">
                {stat.label}
              </p>

              <p className="text-2xl font-bold tracking-tight text-slate-100">
                {stat.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* ==========================================================
          QUICK ACTIONS
      ========================================================== */}

      <div className="rounded-xl border border-orbit-border bg-orbit-surface p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-200">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            {
              icon: Filter,
              label: "Filter Eligible",
              view: "eligible",
              color: "text-violet-400 bg-violet-500/10",
            },
            {
              icon: ClipboardList,
              label: "Applications",
              view: "applications",
              color: "text-cyan-400 bg-cyan-500/10",
            },
            {
              icon: Megaphone,
              label: "Post Notice",
              view: "notices",
              color: "text-emerald-400 bg-emerald-500/10",
            },
            {
              icon: FileText,
              label: "View Students",
              view: "students",
              color: "text-amber-400 bg-amber-500/10",
            },
          ].map((action) => (
            <a
              key={action.label}
              href={`/coordinator/dashboard?view=${action.view}`}
              className="flex items-center gap-3 rounded-lg border border-orbit-border p-3 transition-all hover:border-orbit-border2 hover:bg-white/3"
            >
              <div className={`rounded-lg p-2 ${action.color}`}>
                <action.icon className="h-4 w-4" />
              </div>

              <span className="text-sm font-medium text-slate-300">
                {action.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}