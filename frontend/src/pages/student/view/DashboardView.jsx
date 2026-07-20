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
import { Card, CardBody } from "./../../../components/ui/card";
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
        if (!cancelled) setError(err.message || "Failed to load dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const latestPlacements = useMemo(
    () => dashboard.eligiblePlacement.slice(0, 3),
    [dashboard.eligiblePlacement]
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 size={16} className="animate-spin" />
        Loading dashboard...
      </div>
    );
  }

  if (error) return <div className="text-sm text-red-400">{error}</div>;

  const stats = [
    {
      id: "eligible-placements",
      label: "Eligible Placements",
      value: dashboard.eligiblePlacement.length,
      icon: Briefcase,
      color: "violet",
    },
    {
      id: "placement-applications",
      label: "Placement Applications",
      value: dashboard.appliedPlacement.length,
      icon: FileText,
      color: "cyan",
    },
    {
      id: "eligible-trainings",
      label: "Eligible Trainings",
      value: dashboard.eligibleTrainings.length,
      icon: BookOpenCheck,
      color: "amber",
    },
    {
      id: "training-applications",
      label: "Training Applications",
      value: dashboard.appliedTrainings.length,
      icon: FileText,
      color: "emerald",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500 mt-1">
          Your eligible openings and submitted applications.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const color =
            stat.color === "violet"
              ? "bg-violet-500/15 text-violet-400"
              : stat.color === "cyan"
                ? "bg-cyan-500/15 text-cyan-400"
                : stat.color === "emerald"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-amber-500/15 text-amber-400";
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              className="bg-orbit-surface rounded-xl border border-orbit-border hover:border-orbit-border2 transition-colors p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-slate-100 tracking-tight">
                {stat.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-orbit-surface rounded-xl border border-orbit-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-200">
            Latest Eligible Placements
          </h2>
          <button
            onClick={() => navigate("/students/dashboard?view=jobs")}
            className="text-xs text-orbit-primary-light hover:text-orbit-accent transition-colors flex items-center gap-1"
          >
            <Search className="w-3 h-3" />
            Browse All
          </button>
        </div>
        <div className="space-y-3">
          {latestPlacements.length === 0 ? (
            <p className="text-sm text-slate-500">
              No eligible placements available right now.
            </p>
          ) : (
            latestPlacements.map((job) => (
              <div
                key={job.placement_id}
                className="p-4 rounded-lg border border-orbit-border"
              >
                <h3 className="text-sm font-medium text-slate-200">
                  {job.title || "Untitled Placement"}
                </h3>
                <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <Building2 className="w-3 h-3" />
                  {job.organization_table?.name || "Placement"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      <Card
  className="cursor-pointer hover:shadow-lg"
  onClick={() => navigate("/student/resume")}
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
    </div>
  );
}
