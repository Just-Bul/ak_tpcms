import { useEffect, useState } from "react";
import DashboardShell from "../../../components/DashboardShell";
import { Card, CardBody, Button, Input } from "../../../components/ui";
import { UserPlus } from "lucide-react";
import {
  createCoordinator,
  fetchDepartments,
  fetchGenders,
} from "../../../services/coordinatorApi";

export default function AddCoordinator() {
  const [loading, setLoading] = useState(false);
  const [masterLoading, setMasterLoading] = useState(true);

  const [departments, setDepartments] = useState([]);
  const [genders, setGenders] = useState([]);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile_no: "",
    password: "",
    age: "",
    department_id: "",
    gender_id: "",
  });

  useEffect(() => {
    loadMasters();
  }, []);

  async function loadMasters() {
    try {
      setMasterLoading(true);

      const [deptRes, genderRes] = await Promise.all([
        fetchDepartments(),
        fetchGenders(),
      ]);

      setDepartments(deptRes || []);
      setGenders(genderRes || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setMasterLoading(false);
    }
  }

  const update = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  function validate() {
    if (!form.name.trim()) {
      return "Coordinator name is required.";
    }

    if (!form.email.trim()) {
      return "Email is required.";
    }

    if (!form.mobile_no.trim()) {
      return "Mobile number is required.";
    }

    if (!form.password.trim()) {
      return "Password is required.";
    }

    if (!form.department_id) {
      return "Please select a department.";
    }

    if (!form.gender_id) {
      return "Please select a gender.";
    }

    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSuccess("");
    setError("");

    const validation = validate();

    if (validation) {
      setError(validation);
      return;
    }

    try {
      setLoading(true);

      await createCoordinator({
        name: form.name.trim(),
        email: form.email.trim(),
        mobile_no: form.mobile_no.trim(),
        password: form.password,
        age: Number(form.age || 0),
        department_id: Number(form.department_id),
        gender_id: Number(form.gender_id),
      });

      setSuccess("Coordinator created successfully.");

      setForm({
        name: "",
        email: "",
        mobile_no: "",
        password: "",
        age: "",
        department_id: "",
        gender_id: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
    return (
    <DashboardShell
      title="Add T&P Coordinator"
      subtitle="Create a new Training & Placement Coordinator"
    >
      <Card>
        <CardBody>
          {masterLoading ? (
            <div className="py-12 text-center text-slate-400">
              Loading master data...
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {success && (
                <div className="md:col-span-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  {success}
                </div>
              )}

              {error && (
                <div className="md:col-span-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Full Name
                </label>
                <Input
                  placeholder="Enter coordinator name"
                  value={form.name}
                  onChange={update("name")}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="example@college.edu"
                  value={form.email}
                  onChange={update("email")}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Mobile Number
                </label>
                <Input
                  placeholder="9876543210"
                  value={form.mobile_no}
                  onChange={update("mobile_no")}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="********"
                  value={form.password}
                  onChange={update("password")}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Age
                </label>
                <Input
                  type="number"
                  placeholder="Age"
                  value={form.age}
                  onChange={update("age")}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Gender
                </label>

                <select
                  value={form.gender_id}
                  onChange={update("gender_id")}
                  className="w-full rounded-xl border border-orbit-border bg-orbit-surface2 px-4 py-3 text-slate-200 outline-none focus:border-orbit-primary appearance-none"
                >
                  <option value="">Select Gender</option>

                  {genders.map((g) => (
                    <option
                      key={g.gender_id}
                      value={g.gender_id}
                    >
                      {g.gender}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Department
                </label>

                <select
                  value={form.department_id}
                  onChange={update("department_id")}
                  className="w-full rounded-xl border border-orbit-border bg-orbit-surface2 px-4 py-3 text-slate-200 outline-none focus:border-orbit-primary appearance-none"
                >
                  <option value="">Select Department</option>

                  {departments.map((d) => (
                    <option
                      key={d.department_id}
                      value={d.department_id}
                    >
                      {d.dept_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex justify-end pt-4">
                <Button
                  type="submit"
                  loading={loading}
                  icon={<UserPlus size={16} />}
                >
                  Create Coordinator
                </Button>
              </div>
            </form>
          )}
        </CardBody>
      </Card>
    </DashboardShell>
  );
}