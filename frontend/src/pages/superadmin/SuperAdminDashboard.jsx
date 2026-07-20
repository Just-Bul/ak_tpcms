import { useSearchParams } from "react-router-dom";

import DashboardHome from './view/Dashboard';

import StudentsPage from "../shared/StudentsPage";

import CompaniesPage from "../shared/CompaniesPage";

import DepartmentsPage from "../shared/DepartmentsPage";

import ViewCoordinators from "./view/ViewCoordinators";
import AddCoordinator from "./view/AddCoordinator";
import EditCoordinator from "./view/EditCoordinator";

import PlacementsPage from "../shared/PlacementsPage";
import PlacementDetailPage from "../shared/PlacementDetailPage";
import TrainingsPage from "../shared/TrainingsPage";
import TrainingDetailPage from "../shared/TrainingDetailPage";
import ApplicationsPage from "../shared/ApplicationsPage";
import NoticesPage from "../shared/NoticesPage";
import NoticeBoardPage from "../shared/NoticeBoardPage";
import PlacedStudentsPage from "../shared/PlacedStudentsPage";
import ScheduleInterviewsPage from "../shared/ScheduleInterviewsPage";
import Reports from "./view/Reports";
import Partners from "./view/Partners";

import ChangePasswordPage from "../shared/ChangePasswordPage";
import SettingsPage from "../settings/SettingsPage";

export default function SuperAdminDashboard() {

const [searchParams] = useSearchParams();

const view = searchParams.get("view") || "dashboard";

switch (view) {
  case "view-students":
  case "add-students":
  case "edit-students":
  case "disable-students":
    return <StudentsPage />;

  case "view-companies":
  case "approved-companies":
  case "rejected-companies":
    return <CompaniesPage />;

  case "view-departments":
  case "add-department":
  case "edit-department":
    return <DepartmentsPage />;

  case "view-coordinators":
    return <ViewCoordinators />;

  case "add-coordinator":
    return <AddCoordinator />;

  case "edit-coordinator":
    return <EditCoordinator />;

  case "placement-activity":
  case "post-placement":
    return <PlacementsPage />;

  case "placement-detail":
  case "placement-details":
    return <PlacementDetailPage />;

  case "training-activity":
  case "post-training-admin":
    return <TrainingsPage />;

  case "training-detail":
  case "training-details":
    return <TrainingDetailPage />;

  case "training-applications":
    return <ApplicationsPage filterType="Training" />;

  case "placement-applications":
    return <ApplicationsPage filterType="Placement" />;

  case "share-notes":
    return <NoticesPage />;

  case "notice-board":
    return <NoticeBoardPage />;

  case "placed-students":
    return <PlacedStudentsPage />;

  case "interview":
    return <ScheduleInterviewsPage />;

  case "reports":
    return <Reports />;

  case "partners":
    return <Partners />;

  case "change-password":
    return <ChangePasswordPage />;

  case "settings":
    return <SettingsPage />;

  case "dashboard":
  default:
    return <DashboardHome />;
}

}
