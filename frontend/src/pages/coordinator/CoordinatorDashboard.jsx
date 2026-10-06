import { useSearchParams } from "react-router-dom";

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
import OrganizationPage from "../shared/CompaniesPage";

/* ==========================================================
   Application Pages
========================================================== */

const TrainingApplicationsPage = () => (
  <ApplicationsPage filterType="Training" />
);

const PlacementApplicationsPage = () => (
  <ApplicationsPage filterType="Placement" />
);

/* ==========================================================
   Coordinator View Components
========================================================== */

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
  interview: ScheduleInterviewsPage,

  "shared-notes": NoticesPage,
  "notice-board": NoticeBoardPage,

  "change-password": ChangePasswordPage,

  organizations: OrganizationPage,

  settings: SettingsPage,
};

/* ==========================================================
   Coordinator Dashboard
========================================================== */

export default function CoordinatorDashboard() {
  const [searchParams] = useSearchParams();

  const view = searchParams.get("view") || "dashboard";

  const ViewComponent = viewComponents[view] || Dashboard;

  return <ViewComponent />;
}