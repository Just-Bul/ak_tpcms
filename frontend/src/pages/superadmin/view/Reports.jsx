import { useEffect, useMemo, useState } from "react";
import DashboardShell from "../../../components/DashboardShell";
import {
  Card,
  CardBody,
  Button,
} from "../../../components/ui";

import {
  Loader2,
  Download,
  Printer,
  Users,
  Building2,
  GraduationCap,
  BriefcaseBusiness,
  TrendingUp,
  UserCheck,
} from "lucide-react";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { api } from "../../../services/api";

const COLORS = [
  "#6366F1",
  "#06B6D4",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
];

export default function Reports() {

  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    students: 0,
    companies: 0,
    placements: 0,
    coordinators: 0,
    placementPct: 0,
    trainingPct: 0,
  });

  const [departmentData, setDepartmentData] = useState([]);

  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    loadReports();
  }, [year]);

  async function loadReports() {
    try {
      setLoading(true);

      const [
        studentsRes,
        companiesRes,
        coordinatorsRes,
        placementsRes,
        dashboardRes,
      ] = await Promise.all([
        api.get("/students"),
        api.get("/organizations?status=approved"),
        api.get("/users"),
        api.get("/placements"),
        api.get("/dashboards"),
      ]);

      const students =
        studentsRes.data?.data || [];

      const companies =
        companiesRes.data?.data || [];

      const placements =
        placementsRes.data?.data || [];

      const coordinators =
        (coordinatorsRes.data?.data || []).filter(
          (u) => u.role_id === 3
        );

      const dashboard = dashboardRes.data?.data || dashboardRes.data || {};

      setStats({
        students: dashboard.studentCount ?? students.length,
        companies: dashboard.organizationCount ?? companies.length,
        placements: dashboard.placementCount ?? placements.length,
        coordinators: coordinators.length,
        placementPct: dashboard.placementPercentage ?? 0,
        trainingPct: dashboard.trainingPercentage ?? 0,
      });

      //---------------------------------------
      // Department-wise placement count
      //---------------------------------------

      const deptMap = {};

      students.forEach((student) => {

        const dept =
          student.department_table?.dept_name ||
          student.department ||
          "Unknown";

        deptMap[dept] =
          (deptMap[dept] || 0) + 1;

      });

      setDepartmentData(
        Object.keys(deptMap).map((dept) => ({
          name: dept,
          value: deptMap[dept],
        }))
      );

      //---------------------------------------
      // Monthly placement graph
      //---------------------------------------

      const months = [
        "Jan","Feb","Mar","Apr",
        "May","Jun","Jul","Aug",
        "Sep","Oct","Nov","Dec",
      ];

      const monthMap = {};

      months.forEach((m) => {
        monthMap[m] = 0;
      });

      placements.forEach((placement) => {

        if (!placement.created_on) return;

        const date =
          new Date(placement.created_on);

        if (date.getFullYear() !== year)
          return;

        monthMap[
          months[date.getMonth()]
        ]++;

      });

      setMonthlyData(
        months.map((m) => ({
          month: m,
          placements: monthMap[m],
        }))
      );

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  //-------------------------------------------------
  // Export CSV
  //-------------------------------------------------

  function exportCSV() {

    const rows = [
      ["Metric","Count"],
      ["Students",stats.students],
      ["Companies",stats.companies],
      ["Coordinators",stats.coordinators],
      ["Placements",stats.placements],
    ];

    const csv =
      rows
        .map((r)=>r.join(","))
        .join("\n");

    const blob = new Blob(
      [csv],
      { type:"text/csv" }
    );

    const url =
      window.URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    a.download =
      `TPCMS_Report_${year}.csv`;

    a.click();

    window.URL.revokeObjectURL(url);

  }

  //-------------------------------------------------
  // Print
  //-------------------------------------------------

  function printReport() {
    window.print();
  }

  //-------------------------------------------------
  // Chart totals
  //-------------------------------------------------

  const totalDepartments = useMemo(
    ()=>departmentData.length,
    [departmentData]
  );
    return (
    <DashboardShell
      title="Reports & Analytics"
      subtitle="Training & Placement statistics and insights"
    >
      {loading ? (
        <Card>
          <CardBody>
            <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
              <Loader2 className="animate-spin" size={18} />
              Loading reports...
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">

          {/* Header */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div className="flex items-center gap-3">

              <label className="text-sm text-slate-400">
                Academic Year
              </label>

              <select
                value={year}
                onChange={(e)=>setYear(Number(e.target.value))}
                className="rounded-xl border border-orbit-border bg-orbit-surface2 px-4 py-2 text-slate-200 outline-none"
              >
                {Array.from({length:6}).map((_,i)=>{
                  const y=currentYear-i;
                  return(
                    <option key={y} value={y}>
                      {y}
                    </option>
                  )
                })}
              </select>

            </div>

            <div className="flex gap-2">

              <Button
                icon={<Download size={16}/>}
                onClick={exportCSV}
              >
                Export CSV
              </Button>

              <Button
                variant="secondary"
                icon={<Printer size={16}/>}
                onClick={printReport}
              >
                Print
              </Button>

            </div>

          </div>

          {/* Statistics */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            <Card>
              <CardBody className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Students</p>
                  <h2 className="text-3xl font-bold text-orbit-text-primary mt-2">{stats.students}</h2>
                </div>
                <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <GraduationCap className="text-blue-400"/>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Companies</p>
                  <h2 className="text-3xl font-bold text-orbit-text-primary mt-2">{stats.companies}</h2>
                </div>
                <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Building2 className="text-emerald-400"/>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Coordinators</p>
                  <h2 className="text-3xl font-bold text-orbit-text-primary mt-2">{stats.coordinators}</h2>
                </div>
                <div className="w-14 h-14 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Users className="text-violet-400"/>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Placement Drives</p>
                  <h2 className="text-3xl font-bold text-orbit-text-primary mt-2">{stats.placements}</h2>
                </div>
                <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <BriefcaseBusiness className="text-orange-400"/>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Training %</p>
                  <h2 className="text-3xl font-bold text-orbit-text-primary mt-2">{stats.trainingPct}%</h2>
                  <div className="mt-2 h-1.5 w-32 rounded-full bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all"
                      style={{ width: `${Math.min(stats.trainingPct, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <UserCheck className="text-teal-400"/>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Placement %</p>
                  <h2 className="text-3xl font-bold text-orbit-text-primary mt-2">{stats.placementPct}%</h2>
                  <div className="mt-2 h-1.5 w-32 rounded-full bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orbit-primary to-cyan-400 transition-all"
                      style={{ width: `${Math.min(stats.placementPct, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="w-14 h-14 rounded-xl bg-pink-500/10 flex items-center justify-center">
                  <TrendingUp className="text-pink-400"/>
                </div>
              </CardBody>
            </Card>

          </div>

          {/* Charts */}

          <div className="grid lg:grid-cols-2 gap-6">

            <Card>

              <CardBody>

                <h3 className="text-lg font-semibold text-orbit-text-primary mb-4">
                  Department-wise Students
                </h3>

                {totalDepartments===0 ? (

                  <div className="py-20 text-center text-slate-500">
                    No data available
                  </div>

                ) : (

                  <ResponsiveContainer width="100%" height={320}>

                    <PieChart>

                      <Pie
                        data={departmentData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={120}
                        label
                      >

                        {departmentData.map((_,index)=>(
                          <Cell
                            key={index}
                            fill={
                              COLORS[
                                index % COLORS.length
                              ]
                            }
                          />
                        ))}

                      </Pie>

                      <Tooltip/>

                      <Legend/>

                    </PieChart>

                  </ResponsiveContainer>

                )}

              </CardBody>

            </Card>

            <Card>

              <CardBody>

                <h3 className="text-lg font-semibold text-orbit-text-primary mb-4">
                  Monthly Placements
                </h3>

                <ResponsiveContainer
                  width="100%"
                  height={320}
                >

                  <BarChart
                    data={monthlyData}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="month"
                    />

                    <YAxis/>

                    <Tooltip/>

                    <Bar
                      dataKey="placements"
                      radius={[8,8,0,0]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </CardBody>

            </Card>

          </div>

          {/* Footer */}

          <Card>

            <CardBody>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

                <div>
                  <p className="text-slate-500 text-sm">
                    Total Departments
                  </p>

                  <h2 className="text-2xl font-bold text-orbit-text-primary mt-2">
                    {totalDepartments}
                  </h2>
                </div>

                <div>
                  <p className="text-slate-500 text-sm">
                    Active Companies
                  </p>

                  <h2 className="text-2xl font-bold text-orbit-text-primary mt-2">
                    {stats.companies}
                  </h2>
                </div>

                <div>
                  <p className="text-slate-500 text-sm">
                    Placement Drives
                  </p>

                  <h2 className="text-2xl font-bold text-orbit-text-primary mt-2">
                    {stats.placements}
                  </h2>
                </div>

                <div>
                  <p className="text-slate-500 text-sm">
                    Registered Students
                  </p>

                  <h2 className="text-2xl font-bold text-orbit-text-primary mt-2">
                    {stats.students}
                  </h2>
                </div>

              </div>

            </CardBody>

          </Card>

        </div>
      )}
    </DashboardShell>
  );
}
