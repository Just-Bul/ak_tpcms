import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardShell from "../../../components/DashboardShell";
import {
  Card,
  CardBody,
  Button,
  Input,
  Badge,
} from "../../../components/ui";
import {
  Search,
  Users,
  Eye,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { api } from "../../../services/api";

export default function ViewStudents() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      setLoading(true);

      setError("");

      const res = await api.get("/students");

      setStudents(res.data || []);

    } catch (err) {

      setError(
        err?.response?.data?.message ||
        err.message ||
        "Unable to fetch students."
      );

    } finally {

      setLoading(false);

    }
  }

  const filteredStudents = useMemo(() => {

    return students.filter((student) => {

      const keyword = search.toLowerCase();

      return (
        student.user_table?.name?.toLowerCase().includes(keyword) ||
        student.roll_no?.toLowerCase().includes(keyword) ||
        student.user_table?.email
          ?.toLowerCase()
          .includes(keyword)
      );

    });

  }, [students, search]);
    return (
    <DashboardShell
      title="Department Students"
      subtitle="View students of your department"
    >
      <div className="space-y-6">

        {/* Header */}

        <Card>
          <CardBody>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div className="relative w-full md:max-w-sm">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <Input
                  placeholder="Search student..."
                  className="pl-10"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </div>

              <Button
                variant="outline"
                icon={<RefreshCw size={16} />}
                onClick={loadStudents}
              >
                Refresh
              </Button>

            </div>

          </CardBody>
        </Card>

        {/* Error */}

        {error && (

          <Card>

            <CardBody>

              <p className="text-red-400 text-sm">

                {error}

              </p>

            </CardBody>

          </Card>

        )}

        {/* Loading */}

        {loading ? (

          <Card>

            <CardBody>

              <div className="flex items-center justify-center gap-3 py-20">

                <Loader2
                  size={20}
                  className="animate-spin"
                />

                Loading students...

              </div>

            </CardBody>

          </Card>

        ) : (

          <Card>

            <CardBody className="p-0">

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="border-b border-orbit-border bg-orbit-surface2">

                    <tr>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                        Student
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                        Roll No
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                        Email
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                        Department
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                        Semester
                      </th>

                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-slate-400">
                        Status
                      </th>

                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-slate-400">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredStudents.length === 0 ? (

                      <tr>

                        <td
                          colSpan={7}
                          className="py-16 text-center text-slate-500"
                        >

                          <Users
                            size={40}
                            className="mx-auto mb-3 opacity-30"
                          />

                          No students found.

                        </td>

                      </tr>

                    ) : (

                      filteredStudents.map((student) => (
                                                <tr
                          key={student.user_id}
                          className="border-b border-orbit-border hover:bg-white/[0.02] transition-colors"
                        >
                          {/* Student */}

                          <td className="px-5 py-4">

                            <div>

                              <p className="font-medium text-slate-200">

                                {student.user_table.name}

                              </p>

                              <p className="text-xs text-slate-500">

                                ID : {student.user_id}

                              </p>

                            </div>

                          </td>

                          {/* Roll Number */}

                          <td className="px-5 py-4 text-slate-300">

                            {student.roll_no}

                          </td>

                          {/* Email */}

                          <td className="px-5 py-4 text-slate-400">

                            {student.user_table?.email || "-"}

                          </td>

                          {/* Department */}

                          <td className="px-5 py-4 text-slate-300">

                            {student.department_table
                              ?.department_name ||
                              "-"}

                          </td>

                          {/* Semester */}

                          <td className="px-5 py-4 text-slate-300">

                            {student.semester_table
                              ?.semester_name ||
                              student.semester_id ||
                              "-"}

                          </td>

                          {/* Status */}

                          <td className="px-5 py-4 text-center">

                            <Badge
                              variant={
                                student.is_graduate
                                  ? "destructive"
                                  : "success"
                              }
                            >
                              {student.is_graduate
                                ? "Graduated"
                                : "Active"}
                            </Badge>

                          </td>

                          {/* Action */}

                          <td className="px-5 py-4">

                            <div className="flex justify-center">

                              <Button
                                size="sm"
                                icon={<Eye size={14} />}
                                onClick={() =>
                                  navigate(
                                    `/coordinator/dashboard?view=student-details&id=${student.user_id}`
                                  )
                                }
                              >
                                View
                              </Button>

                            </div>

                          </td>

                        </tr>

                      ))

                    )}

                  </tbody>

                </table>

              </div>

            </CardBody>

          </Card>

        )}
              </div>
    </DashboardShell>
  );
}