import { useSearchParams } from "react-router-dom";

import DashboardShell from "./../../components/DashboardShell";

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
  /* Dashboard */
  dashboard: Dashboard,

  /* Students */
  students: StudentsPage,
  "student-details": StudentsPage,

  /* Eligibility */
  eligible: FilterEligible,

  /* Training */
  "view-trainings": TrainingsPage,
  "post-training": TrainingsPage,
  "training-detail": TrainingDetailPage,
  "training-details": TrainingDetailPage,
  "training-applications": TrainingApplicationsPage,

  /* Placement */
  "view-placements": PlacementsPage,
  "post-placement": PlacementsPage,
  "placement-detail": PlacementDetailPage,
  "placement-details": PlacementDetailPage,
  "placement-applications": PlacementApplicationsPage,
  "placed-students": PlacedStudentsPage,
  interview: ScheduleInterviewsPage,

  /* Notices */
  "shared-notes": NoticesPage,
  "notice-board": NoticeBoardPage,

  /* Account */
  "change-password": ChangePasswordPage,
  /* Organizations */
  organizations: OrganizationPage,

  /* Settings */
  settings: SettingsPage,
};


/* ==========================================================
   Page Titles
========================================================== */

const pageTitles = {
  dashboard: "Coordinator Dashboard",

  students: "Students",
  "student-details": "Student Details",

  eligible: "Eligible Students",

  "view-trainings": "Training",
  "post-training": "Post Training",
  "training-detail": "Training Details",
  "training-details": "Training Details",
  "training-applications": "Training Applications",

  "view-placements": "Placement",
  "post-placement": "Post Placement",
  "placement-detail": "Placement Details",
  "placement-details": "Placement Details",
  "placement-applications": "Placement Applications",
  "placed-students": "Placed Students",
  interview: "Schedule Interviews",

  "shared-notes": "Shared Notes",
  "notice-board": "Notice Board",

  "change-password": "Change Password",

  settings: "Settings",
};


/* ==========================================================
   Page Subtitles
========================================================== */

const pageSubtitles = {
  dashboard:
    "Manage department training and placement activities.",

  students:
    "View students of your department.",

  "student-details":
    "Student academic information.",

  eligible:
    "View students eligible for training and placement opportunities.",

  "view-trainings":
    "View available training opportunities.",

  "post-training":
    "Create and manage training opportunities.",

  "training-detail":
    "View training information.",

  "training-details":
    "View training information.",

  "training-applications":
    "Approve or reject student training applications.",

  "view-placements":
    "View available placement opportunities.",

  "post-placement":
    "Create and manage placement opportunities.",

  "placement-detail":
    "View placement information.",

  "placement-details":
    "View placement information.",

  "placement-applications":
    "Approve or reject placement applications.",

  "placed-students":
    "View students who have been placed.",

  interview:
    "Schedule and manage student interviews.",

  "shared-notes":
    "Upload and share study materials.",

  "notice-board":
    "View department notices and announcements.",

  "change-password":
    "Update your account password.",

  settings:
    "Manage your account settings.",
};


/* ==========================================================
   Coordinator Dashboard
========================================================== */

export default function CoordinatorDashboard() {
  const [searchParams] = useSearchParams();

  /*
   * Default view is dashboard.
   *
   * /coordinator/dashboard
   *        ↓
   * view = "dashboard"
   */
  const view = searchParams.get("view") || "dashboard";

  /*
   * Select the page based on ?view=
   */
  const ViewComponent =
    viewComponents[view] || Dashboard;

  return (
    <DashboardShell
      title={
        pageTitles[view] ||
        "Coordinator Dashboard"
      }
      subtitle={
        pageSubtitles[view] ||
        "Manage department training and placement activities."
      }
    >
      <ViewComponent />
    </DashboardShell>
  );
}