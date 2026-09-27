import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import {
  Briefcase,
  FileText,
  BookOpenCheck,
  Building2,
  Loader2,
  Search,
} from "lucide-react";
import { Card, CardBody } from "../../../components/ui/card";
import { motion } from "framer-motion";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export default function DashboardOverview() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState({
    appliedTrainings: [],
    eligibleTrainings: [],
    appliedPlacement: [],
    eligiblePlacement: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/dashboards");

        const data = res?.data?.data ?? res?.data ?? {};

        if (!cancelled) {
          setDashboard({
            appliedTrainings: asArray(data.appliedTrainings),
            eligibleTrainings: asArray(data.eligibleTrainings),
            appliedPlacement: asArray(data.appliedPlacement),
            eligiblePlacement: asArray(data.eligiblePlacement),
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load dashboard."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const latestPlacements = useMemo(() => {
    return dashboard.eligiblePlacement.slice(0, 3);
  }, [dashboard.eligiblePlacement]);

  /*
   * Loading State
   */
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 size={16} className="animate-spin" />
        Loading dashboard...
      </div>
    );
  }

  /*
   * Error State
   */
  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  /*
   * Dashboard Statistics
   */
  const stats = [
    {
      id: "eligible-placements",
      label: "Eligible Placements",
      value: dashboard.eligiblePlacement.length,
      icon: Briefcase,
      color: "violet",
      view: "jobs",
    },
    {
      id: "placement-applications",
      label: "Placement Applications",
      value: dashboard.appliedPlacement.length,
      icon: FileText,
      color: "cyan",
      view: "placement-applications",
    },
    {
      id: "eligible-trainings",
      label: "Eligible Trainings",
      value: dashboard.eligibleTrainings.length,
      icon: BookOpenCheck,
      color: "amber",
      view: "training",
    },
    {
      id: "training-applications",
      label: "Training Applications",
      value: dashboard.appliedTrainings.length,
      icon: FileText,
      color: "emerald",
      view: "training-applications",
    },
  ];

  /*
   * Icon Color Helper
   */
  const getIconStyle = (color) => {
    switch (color) {
      case "violet":
        return "bg-violet-500/15 text-violet-400";

      case "cyan":
        return "bg-cyan-500/15 text-cyan-400";

      case "amber":
        return "bg-amber-500/15 text-amber-400";

      case "emerald":
        return "bg-emerald-500/15 text-emerald-400";

      default:
        return "bg-slate-500/15 text-slate-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* =====================================================
          PAGE DESCRIPTION
      ====================================================== */}
      <div>
        <p className="text-sm text-slate-500 mt-1">
          Your eligible openings and submitted applications.
        </p>
      </div>

      {/* =====================================================
          STATISTICS CARDS
      ====================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.button
              key={stat.id}
              type="button"
              onClick={() =>
                navigate(`/students/dashboard?view=${stat.view}`)
              }
              className="
                w-full
                text-left
                bg-orbit-surface
                border
                border-orbit-border
                rounded-xl
                p-5
                cursor-pointer
                transition-all
                duration-200
                hover:-translate-y-1
                hover:border-orbit-primary-light/40
                hover:shadow-lg
                focus:outline-none
                focus:ring-2
                focus:ring-orbit-primary-light/40
                active:scale-[0.98]
              "
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.35,
                delay: index * 0.06,
              }}
              whileTap={{
                scale: 0.98,
              }}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                {/* Icon */}
                <div
                  className={`p-2.5 rounded-lg ${getIconStyle(
                    stat.color
                  )}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* View Indicator */}
                <span className="text-xs text-slate-500">
                  View →
                </span>
              </div>

              {/* Label */}
              <p className="text-xs text-slate-500 font-medium mb-1">
                {stat.label}
              </p>

              {/* Value */}
              <p className="text-2xl font-bold text-slate-100 tracking-tight">
                {stat.value}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* =====================================================
          LATEST ELIGIBLE PLACEMENTS
      ====================================================== */}
      <div className="bg-orbit-surface rounded-xl border border-orbit-border p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-200">
            Latest Eligible Placements
          </h2>

          <button
            type="button"
            onClick={() =>
              navigate("/students/dashboard?view=jobs")
            }
            className="
              text-xs
              text-orbit-primary-light
              hover:text-orbit-accent
              transition-colors
              flex
              items-center
              gap-1
            "
          >
            <Search className="w-3 h-3" />
            Browse All
          </button>
        </div>

        {/* Placements */}
        <div className="space-y-3">
          {latestPlacements.length === 0 ? (
            <p className="text-sm text-slate-500">
              No eligible placements available right now.
            </p>
          ) : (
            latestPlacements.map((job, index) => (
              <div
                key={`placement-${
                  job?.placement_id ?? index
                }`}
                className="
                  p-4
                  rounded-lg
                  border
                  border-orbit-border
                  hover:border-orbit-primary-light/30
                  transition-colors
                "
              >
                <h3 className="text-sm font-medium text-slate-200">
                  {job?.title || "Untitled Placement"}
                </h3>

                <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <Building2 className="w-3 h-3" />

                  {job?.organization_table?.name ||
                    "Placement"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* =====================================================
          RESUME BUILDER
      ====================================================== */}
      <motion.div
        initial={{
          opacity: 0,
          y: 16,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.35,
          delay: 0.25,
        }}
      >
        <Card
          className="
            cursor-pointer
            transition-all
            duration-200
            hover:-translate-y-1
            hover:shadow-lg
            hover:border-orbit-primary-light/40
          "
          onClick={() => navigate("/students/resume")}
        >
          <CardBody className="text-center">
            <FileText
              size={45}
              className="mx-auto text-blue-600"
            />

            <h3 className="mt-3 text-lg font-semibold">
              Resume Builder
            </h3>

            <p className="text-sm text-gray-500">
              Create professional resume
            </p>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}