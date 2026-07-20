import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardShell from "../../../components/DashboardShell";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
} from "../../../components/ui";

import {
  Users,
  Building2,
  GraduationCap,
  BriefcaseBusiness,
  ClipboardList,
  Plus,
  Eye,
  Loader2,
} from "lucide-react";

import { api } from "../../../services/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* ==============================
      Dashboard Counts
  ============================== */

  const [metrics, setMetrics] = useState({
    studentCount: 0,
    departmentCount: 0,
    organizationCount: 0,
    trainingCount: 0,
    placementCount: 0,
    trainingPercentage: 0,
    placementPercentage: 0,
  });

  /* ==============================
      Lists
  ============================== */

  const [pendingApprovals, setPendingApprovals] = useState([]);

  const [organizations, setOrganizations] = useState([]);

  const [departments, setDepartments] = useState([]);

  const [trainings, setTrainings] = useState([]);

  const [placements, setPlacements] = useState([]);

  /* ==============================
      Load Dashboard
  ============================== */

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      /* Dashboard Counts */

      const dashboard = await api.get("/dashboards");

      setMetrics(dashboard.data);

      /* Pending Organizations */

      const pending = await api.get("/organizations?status=pending");

      setPendingApprovals(pending.data.data || []);

      /* Organizations */

      const organizationRes = await api.get("/organizations");

      setOrganizations(organizationRes.data.data || []);

      /* Departments */

      const departmentRes = await api.get("/departments");

      setDepartments(departmentRes.data.data || []);

      /* Trainings */

      const trainingRes = await api.get("/trainings");

      setTrainings(trainingRes.data.data || []);

      /* Placements */

      const placementRes = await api.get("/placements");

      setPlacements(placementRes.data.data || []);
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      title: "Students",
      value: metrics.studentCount,
      icon: Users,
      color: "text-violet-400",
    },

    {
      title: "Departments",
      value: metrics.departmentCount,
      icon: GraduationCap,
      color: "text-amber-400",
    },

    {
      title: "Organizations",
      value: metrics.organizationCount,
      icon: Building2,
      color: "text-cyan-400",
    },

    {
      title: "Trainings",
      value: metrics.trainingCount,
      icon: ClipboardList,
      color: "text-emerald-400",
    },

    {
      title: "Placements",
      value: metrics.placementCount,
      icon: BriefcaseBusiness,
      color: "text-pink-400",
    },
  ];

  if (loading) {
    return (
      <DashboardShell title="Super Admin Dashboard" subtitle="Loading...">
        <Card>
          <CardBody>
            <div className="flex items-center justify-center gap-3 py-20">
              <Loader2 className="animate-spin" size={22} />
              Loading Dashboard...
            </div>
          </CardBody>
        </Card>
      </DashboardShell>
    );
  }
  return (
    <DashboardShell
      title="Super Admin Dashboard"
      subtitle="Training & Placement Management System"
    >
      <div className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* ===========================================
                    Statistics Cards
        =========================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <Card key={card.title}>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{card.title}</p>

                      <h2 className="mt-2 text-4xl font-bold">
                        {card.value}
                      </h2>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orbit-surface2">
                      <Icon size={24} className={card.color} />
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* ===========================================
                    Training & Placement Overview
        =========================================== */}

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>Training Overview</CardHeader>

            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400">Total Trainings</p>

                  <h2 className="mt-2 text-4xl font-bold">
                    {metrics.trainingCount}
                  </h2>
                </div>

                <Badge variant="success">{metrics.trainingPercentage}%</Badge>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-orbit-surface2">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${metrics.trainingPercentage}%`,
                  }}
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>Placement Overview</CardHeader>

            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400">Total Placements</p>

                  <h2 className="mt-2 text-4xl font-bold">
                    {metrics.placementCount}
                  </h2>
                </div>

                <Badge variant="success">{metrics.placementPercentage}%</Badge>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-orbit-surface2">
                <div
                  className="h-full rounded-full bg-violet-500"
                  style={{
                    width: `${metrics.placementPercentage}%`,
                  }}
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* ===========================================
                Pending Organizations
        =========================================== */}

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <span>Pending Organizations</span>

                <Badge variant="warning">{pendingApprovals.length}</Badge>
              </div>
            </CardHeader>

            <CardBody>
              {pendingApprovals.length === 0 ? (
                <div className="py-10 text-center text-slate-500">
                  No pending organizations.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map((company) => (
                    <div
                      key={company.user_id}
                      className="flex items-center justify-between border-b border-orbit-border pb-3 last:border-none"
                    >
                      <div>
                        <h4 className="font-medium text-orbit-text-primary">
                          {company.user_table?.name}
                        </h4>

                        <p className="text-xs text-slate-500">
                          {company.user_table?.email}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate("/super-admin/dashboard?view=view-companies")
                        }
                      >
                        <Eye size={15} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* ===========================================
                  Recent Organizations
          =========================================== */}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <span>Recent Organizations</span>

                <Badge>{organizations.length}</Badge>
              </div>
            </CardHeader>

            <CardBody>
              {organizations.length === 0 ? (
                <div className="py-10 text-center text-slate-500">
                  No organizations found.
                </div>
              ) : (
                <div className="space-y-4">
                  {organizations.slice(0, 5).map((org) => (
                    <div
                      key={org.user_id}
                      className="flex items-center justify-between border-b border-orbit-border pb-3 last:border-none"
                    >
                      <div>
                        <h4 className="font-medium text-orbit-text-primary">
                          {org.user_table?.name}
                        </h4>

                        <p className="text-xs text-slate-500">
                          {org.user_table?.email}
                        </p>
                      </div>

                      <Badge
                        variant={
                          org.approval_id === 2
                            ? "success"
                            : org.approval_id === 3
                              ? "destructive"
                              : "warning"
                        }
                      >
                        {org.approval_id === 1
                          ? "Pending"
                          : org.approval_id === 2
                            ? "Approved"
                            : "Rejected"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
        {/* ===========================================
                Recent Trainings
        =========================================== */}

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <span>Recent Trainings</span>

                <Badge>{trainings.length}</Badge>
              </div>
            </CardHeader>

            <CardBody>
              {trainings.length === 0 ? (
                <div className="py-10 text-center text-slate-500">
                  No trainings available.
                </div>
              ) : (
                <div className="space-y-4">
                  {trainings.slice(0, 5).map((training) => (
                    <div
                      key={training.training_id}
                      className="border-b border-orbit-border pb-3 last:border-none"
                    >
                      <h4 className="font-medium text-orbit-text-primary">
                        {training.title}
                      </h4>

                      <p className="mt-1 text-xs text-slate-500">
                        Minimum CGPA : {training.min_cgpa}
                      </p>

                      <p className="text-xs text-slate-500">
                        Last Date :{" "}
                        {new Date(
                          training.last_date_of_submission,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* ===========================================
                  Departments
          =========================================== */}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <span>Departments</span>

                <Badge>{departments.length}</Badge>
              </div>
            </CardHeader>

            <CardBody>
              {departments.length === 0 ? (
                <div className="py-10 text-center text-slate-500">
                  No departments found.
                </div>
              ) : (
                <div className="space-y-4">
                  {departments.slice(0, 5).map((department) => (
                    <div
                      key={department.department_id}
                      className="flex items-center justify-between border-b border-orbit-border pb-3 last:border-none"
                    >
                      <div>
                        <h4 className="font-medium text-orbit-text-primary">
                          {department.department_name}
                        </h4>

                        <p className="text-xs text-slate-500">
                          {department.user_table?.name ||
                            "Coordinator Not Assigned"}
                        </p>
                      </div>

                      <Badge
                        variant={
                          department.is_active ? "success" : "destructive"
                        }
                      >
                        {department.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* ===========================================
                Placements & Quick Actions
        =========================================== */}

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <span>Placements</span>

                <Badge>{placements.length}</Badge>
              </div>
            </CardHeader>

            <CardBody>
              {placements.length === 0 ? (
                <div className="py-10 text-center text-slate-500">
                  No placement records found.
                </div>
              ) : (
                <div className="space-y-4">
                  {placements.slice(0, 5).map((placement) => (
                    <div
                      key={placement.placement_id}
                      className="border-b border-orbit-border pb-3 last:border-none"
                    >
                      <h4 className="font-medium text-orbit-text-primary">
                        {placement.title || "Placement"}
                      </h4>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>Quick Actions</CardHeader>

            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  icon={<Plus size={16} />}
                  onClick={() =>
                    navigate("/super-admin/dashboard?view=add-students")
                  }
                >
                  Add Student
                </Button>

                <Button
                  icon={<Plus size={16} />}
                  onClick={() =>
                    navigate("/super-admin/dashboard?view=add-department")
                  }
                >
                  Add Department
                </Button>

                <Button
                  icon={<Plus size={16} />}
                  onClick={() =>
                    navigate("/super-admin/dashboard?view=post-training")
                  }
                >
                  Add Training
                </Button>

                <Button
                  icon={<Plus size={16} />}
                  onClick={() =>
                    navigate("/super-admin/dashboard?view=post-placement")
                  }
                >
                  Add Placement
                </Button>

                <Button
                  icon={<Eye size={16} />}
                  onClick={() =>
                    navigate("/super-admin/dashboard?view=view-companies")
                  }
                >
                  Companies
                </Button>

                <Button
                  icon={<Eye size={16} />}
                  onClick={() =>
                    navigate("/super-admin/dashboard?view=settings")
                  }
                >
                  Settings
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
        {/* ===========================================
                System Status
        =========================================== */}

        <Card>
          <CardHeader>System Status</CardHeader>

          <CardBody>
            <div className="grid md:grid-cols-4 gap-5">
              <div className="rounded-xl bg-orbit-surface2 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Server</span>

                  <Badge variant="success">Online</Badge>
                </div>
              </div>

              <div className="rounded-xl bg-orbit-surface2 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Database</span>

                  <Badge variant="success">Connected</Badge>
                </div>
              </div>

              <div className="rounded-xl bg-orbit-surface2 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">API</span>

                  <Badge variant="success">Running</Badge>
                </div>
              </div>

              <div className="rounded-xl bg-orbit-surface2 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Pending Companies</span>

                  <Badge variant="warning">{pendingApprovals.length}</Badge>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* ===========================================
                Summary
        =========================================== */}

        <Card>
          <CardHeader>Dashboard Summary</CardHeader>

          <CardBody>
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
              <div className="rounded-xl border border-orbit-border p-5">
                <p className="text-slate-500">Students</p>

                <h2 className="mt-2 text-3xl font-bold text-violet-400">
                  {metrics.studentCount}
                </h2>
              </div>

              <div className="rounded-xl border border-orbit-border p-5">
                <p className="text-slate-500">Organizations</p>

                <h2 className="mt-2 text-3xl font-bold text-cyan-400">
                  {metrics.organizationCount}
                </h2>
              </div>

              <div className="rounded-xl border border-orbit-border p-5">
                <p className="text-slate-500">Training Success</p>

                <h2 className="mt-2 text-3xl font-bold text-emerald-400">
                  {metrics.trainingPercentage}%
                </h2>
              </div>

              <div className="rounded-xl border border-orbit-border p-5">
                <p className="text-slate-500">Placement Success</p>

                <h2 className="mt-2 text-3xl font-bold text-pink-400">
                  {metrics.placementPercentage}%
                </h2>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}
