import { useMemo, useState } from "react";
import DashboardShell from "../../../components/DashboardShell";
import { Card, CardBody, Select } from "../../../components/ui";
import { DataTable } from "@/components/common/DataTable";
import { SearchBar } from "@/components/common/SearchBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useFetchList } from "@/hooks/useFetchList";
import { useDebounce } from "@/hooks/useDebounce";
import { useMasterData } from "@/hooks/useMasterData";
import api from "@/services/api";
import { Users, Award, GraduationCap } from "lucide-react";

/**
 * Fixed (item 30): this page previously fetched and filtered students correctly but never
 * rendered them — the table body was a literal placeholder comment and the summary cards
 * contained "..." instead of real content. It also unwrapped the API response one level too
 * deep (`res?.data?.data`, always empty — GET /students/ returns `{ data: [...] }` directly)
 * and filtered on wrong field paths (`student.department_name`/`student.semester` instead of
 * the actual nested `department_table.department_name` / `semester_table.semester` shape the
 * list endpoint returns).
 */
export default function FilterEligible() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [minCgpa, setMinCgpa] = useState("6");
  const [semesterId, setSemesterId] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const { data: students, loading } = useFetchList(async () => {
    const res = await api.get("/students/");
    return res?.data || [];
  });

  const { data: master } = useMasterData(["departments", "semesters"]);

  const filteredStudents = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return students.filter((student) => {
      const name = student.name || student.user_table?.name || "";
      const email = student.user_table?.email || student.email || "";
      const matchesSearch = !q || name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
      const matchesCgpa = Number(student.cgpa || 0) >= Number(minCgpa || 0);
      const matchesSemester = !semesterId || String(student.semester_id) === String(semesterId);
      const matchesDepartment = !departmentId || String(student.department_id) === String(departmentId);
      return matchesSearch && matchesCgpa && matchesSemester && matchesDepartment;
    });
  }, [students, debouncedSearch, minCgpa, semesterId, departmentId]);

  const columns = [
    {
      key: "name",
      header: "Student",
      render: (s) => (
        <div>
          <p className="font-medium text-orbit-text-primary">{s.name || s.user_table?.name}</p>
          <p className="text-xs text-slate-500">{s.roll_no}</p>
        </div>
      ),
    },
    { key: "department", header: "Department", render: (s) => s.department_table?.department_name || "—" },
    { key: "semester", header: "Semester", render: (s) => s.semester_table?.semester || "—" },
    {
      key: "cgpa",
      header: "CGPA",
      render: (s) => <StatusBadge status={{ label: s.cgpa ?? "N/A", variant: Number(s.cgpa) >= Number(minCgpa) ? "success" : "neutral" }} />,
    },
  ];

  return (
    <DashboardShell title="Filter Eligible Students" subtitle="Find students eligible for training and placement drives">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="rounded-xl bg-violet-500/10 p-3"><Users size={22} className="text-violet-400" /></div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Total Students</p>
                <h2 className="mt-1 text-2xl font-bold text-orbit-text-primary">{students.length}</h2>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="rounded-xl bg-emerald-500/10 p-3"><Award size={22} className="text-emerald-400" /></div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Eligible Students</p>
                <h2 className="mt-1 text-2xl font-bold text-orbit-text-primary">{filteredStudents.length}</h2>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="rounded-xl bg-blue-500/10 p-3"><GraduationCap size={22} className="text-blue-400" /></div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Minimum CGPA</p>
                <h2 className="mt-1 text-2xl font-bold text-orbit-text-primary">{minCgpa || 0}</h2>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardBody>
            <div className="grid gap-4 md:grid-cols-4">
              <SearchBar value={search} onChange={setSearch} placeholder="Search student..." />
              <input
                type="number"
                step="0.01"
                placeholder="Minimum CGPA"
                value={minCgpa}
                onChange={(e) => setMinCgpa(e.target.value)}
                className="h-9 rounded-lg border border-orbit-border bg-orbit-surface2 px-3 text-sm text-slate-200"
              />
              <Select value={semesterId} onChange={(e) => setSemesterId(e.target.value)}>
                <option value="">All Semesters</option>
                {(master.semesters || []).map((s) => (
                  <option key={s.semester_id} value={s.semester_id}>{s.semester}</option>
                ))}
              </Select>
              <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                <option value="">All Departments</option>
                {(master.departments || []).map((d) => (
                  <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                ))}
              </Select>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <DataTable columns={columns} data={filteredStudents} rowKey={(s) => s.user_id} loading={loading} emptyTitle="No eligible students found" />
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}
