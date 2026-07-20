import { useSearchParams } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";

import DashboardView from "./view/DashboardView";
import PlacementsPage from "../shared/PlacementsPage";
import PlacementDetailPage from "../shared/PlacementDetailPage";
import TrainingsPage from "../shared/TrainingsPage";
import TrainingDetailPage from "../shared/TrainingDetailPage";
import ApplicationsPage from "../shared/ApplicationsPage";
import NoticesPage from "../shared/NoticesPage";
import NoticeBoardPage from "../shared/NoticeBoardPage";
import PlacedStudentsPage from "../shared/PlacedStudentsPage";
import ResumePage from "../shared/ResumePage";
import ChangePasswordPage from "../shared/ChangePasswordPage";
import NotificationsView from "./view/NotificationsView";
import ProfileView from "./view/ProfileView";
import SettingsPage from "../settings/SettingsPage";
import InterviewLettersView from "./view/InterviewLettersView";

// These pages wrap themselves in <DashboardShell> (matching the other 3 dashboards' pages);
// rendering them under an outer DashboardShell here would double-wrap (duplicate header/title).
const SELF_WRAPPED_VIEWS = {
  jobs: <PlacementsPage />,
  "placement-detail": <PlacementDetailPage />,
  training: <TrainingsPage />,
  "training-detail": <TrainingDetailPage />,
  applications: <ApplicationsPage />,
  "placement-applications": <ApplicationsPage filterType="Placement" />,
  "training-applications": <ApplicationsPage filterType="Training" />,
  shared_notes: <NoticesPage />,
  "notice-board": <NoticeBoardPage />,
  "placed-students": <PlacedStudentsPage />,
  resume: <ResumePage />,
  "change-password": <ChangePasswordPage />,
  settings: <SettingsPage />,
};

// These render bare content that already includes its own heading, so no outer title is
// passed (avoids the double "My Profile" / "Notifications" heading DashboardShell would add).
const BARE_VIEWS = {
  notifications: <NotificationsView />,
  profile: <ProfileView />,
  letters: <InterviewLettersView />,
};

export default function StudentDashboard() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view");

  if (SELF_WRAPPED_VIEWS[view]) {
    return SELF_WRAPPED_VIEWS[view];
  }

  if (BARE_VIEWS[view]) {
    return <DashboardShell>{BARE_VIEWS[view]}</DashboardShell>;
  }

  return (
    <DashboardShell title="Dashboard">
      <DashboardView />
    </DashboardShell>
  );
}
