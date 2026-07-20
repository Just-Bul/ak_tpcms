import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, Briefcase, Bell, FileText,
  TrendingUp, TrendingDown, UserCheck, Filter,
  Megaphone, ClipboardList,
} from 'lucide-react'
import DashboardShell  from './../../components/DashboardShell'
import Dashboard from "./view/Dashboard";
import StudentsPage from "../shared/StudentsPage";

import TrainingsPage from "../shared/TrainingsPage";
import TrainingDetailPage from "../shared/TrainingDetailPage";

import PlacementsPage from "../shared/PlacementsPage";
import PlacementDetailPage from "../shared/PlacementDetailPage";

import ApplicationsPage from "../shared/ApplicationsPage";
import NoticesPage from "../shared/NoticesPage";
import NoticeBoardPage from "../shared/NoticeBoardPage";
import PlacedStudentsPage from "../shared/PlacedStudentsPage";
import ScheduleInterviewsPage from "../shared/ScheduleInterviewsPage";

import ChangePasswordPage from "../shared/ChangePasswordPage";
import FilterEligible from "./view/FilterEligible";
import SettingsPage from "./../settings/SettingsPage";

import api from '../../services/api'

const TrainingApplicationsPage = () => <ApplicationsPage filterType="Training" />
const PlacementApplicationsPage = () => <ApplicationsPage filterType="Placement" />

const viewComponents = {
  dashboard: Dashboard,

  students: StudentsPage,
  "student-details": StudentsPage,

  eligible: FilterEligible,

  "view-trainings": TrainingsPage,
  "post-training": TrainingsPage,
  "training-detail": TrainingDetailPage,
  "training-details": TrainingDetailPage,
  "training-applications": TrainingApplicationsPage,

  "view-placements": PlacementsPage,
  "post-placement": PlacementsPage,
  "placement-detail": PlacementDetailPage,
  "placement-details": PlacementDetailPage,
  "placement-applications": PlacementApplicationsPage,
  "placed-students": PlacedStudentsPage,
  "interview": ScheduleInterviewsPage,

  "shared-notes": NoticesPage,
  "notice-board": NoticeBoardPage,

  "change-password": ChangePasswordPage,

  settings: SettingsPage,
};

function Overview() {
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    api.get('/dashboards')
      .then((res) => setMetrics(res?.data || null))
      .catch(() => setMetrics(null))
  }, [])

  const statsData = [
    { id: 'dept-students', label: 'Department Students', value: metrics?.studentCount ?? '—', change: 5.2, icon: Users, color: 'violet' },
    { id: 'orgs', label: 'Organizations', value: metrics?.organizationCount ?? '—', change: 8.3, icon: Briefcase, color: 'cyan' },
    { id: 'applications', label: 'Placement Applications', value: metrics?.placementApplicationCount ?? '—', change: 12.8, icon: UserCheck, color: 'emerald' },
    { id: 'training', label: 'Training Applications', value: metrics?.trainingApplicationCount ?? '—', change: 33.3, icon: Bell, color: 'amber' },
  ]

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, i) => {
          const colors = {
            violet: { bg: 'bg-violet-500/15', text: 'text-violet-400' },
            cyan: { bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
            emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
            amber: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
          }[stat.color]
          const isPositive = stat.change >= 0
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="rounded-xl border border-orbit-border bg-orbit-surface p-5 transition-colors hover:border-orbit-border2"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className={`rounded-lg p-2 ${colors.bg}`}>
                  <stat.icon className={`h-4 w-4 ${colors.text}`} />
                </div>
                <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <p className="mb-1 text-xs font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold tracking-tight text-slate-100">{stat.value}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="rounded-xl border border-orbit-border bg-orbit-surface p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-200">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { icon: Filter, label: 'Filter Eligible', view: 'eligible', color: 'text-violet-400 bg-violet-500/10' },
            { icon: ClipboardList, label: 'Applications', view: 'applications', color: 'text-cyan-400 bg-cyan-500/10' },
            { icon: Megaphone, label: 'Post Notice', view: 'notices', color: 'text-emerald-400 bg-emerald-500/10' },
            { icon: FileText, label: 'View Students', view: 'students', color: 'text-amber-400 bg-amber-500/10' },
          ].map((action) => (
            <a
              key={action.label}
              href={`?view=${action.view}`}
              className="flex items-center gap-3 rounded-lg border border-orbit-border p-3 transition-all hover:border-orbit-border2 hover:bg-white/3"
            >
              <div className={`rounded-lg p-2 ${action.color}`}>
                <action.icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-slate-300">{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}


/* ==========================================================
   Coordinator Dashboard
========================================================== */

export default function CoordinatorDashboard() {
  const [searchParams] = useSearchParams();

  const view = searchParams.get("view");

  const ViewComponent = (view && view !== "dashboard") ? viewComponents[view] : null;

  if (ViewComponent) {
    return <ViewComponent />;
  }

  return (
    <DashboardShell
      title="Coordinator Dashboard"
      subtitle="Manage department training and placement activities."
    >
      <Overview />
    </DashboardShell>
  );
}
