import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardShell from "../../../components/DashboardShell";
import { Card, CardBody, Button, Input } from "../../../components/ui";
import { ArrowLeft, Save } from "lucide-react";

import {
  fetchCoordinator,
  updateCoordinator,
  fetchDepartments,
  fetchGenders,
} from "../../../services/coordinatorApi";

export default function EditCoordinator() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const coordinatorId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [departments, setDepartments] = useState([]);
  const [genders, setGenders] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile_no: "",
    age: "",
    department_id: "",
    gender_id: "",
    is_active: true,
  });

  useEffect(() => {
    if (coordinatorId) {
      loadCoordinator();
    }

    loadMasters();
  }, [coordinatorId]);

  async function loadMasters() {
    try {
      const [deptRes, genderRes] = await Promise.all([
        fetchDepartments(),
        fetchGenders(),
      ]);

      setDepartments(deptRes || []);
      setGenders(genderRes || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadCoordinator() {
    try {
      setLoading(true);

      const data = await fetchCoordinator(coordinatorId);

      setForm({
        name: data.name || "",
        email: data.email || "",
        mobile_no: data.mobile_no || "",
        age: data.age || "",
        department_id: data.department_id || "",
        gender_id: data.gender_id || "",
        is_active: data.is_active ?? true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const update = (field) => (e) => {
    const value =
      e.target.type === "checkbox"
        ? e.target.checked
        : e.target.value;

    setForm((prev) => ({
      ...prev,
      [field]: value,
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

    if (!form.department_id) {
      return "Department is required.";
    }

    if (!form.gender_id) {
      return "Gender is required.";
    }

    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validation = validate();

    if (validation) {
      setError(validation);
      return;
    }

    try {
      setSaving(true);

      await updateCoordinator(coordinatorId, {
        name: form.name.trim(),
        email: form.email.trim(),
        mobile_no: form.mobile_no.trim(),
        age: Number(form.age || 0),
        department_id: Number(form.department_id),
        gender_id: Number(form.gender_id),
        is_active: form.is_active,
      });

      setSuccess("Coordinator updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }
    if (!coordinatorId) {
    return (
      <DashboardShell
        title="Edit Coordinator"
        subtitle="No coordinator selected"
      >
        <Card>
          <CardBody>
            <p className="text-slate-400">
              Please select a coordinator from the View Coordinators page.
            </p>
          </CardBody>
        </Card>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Edit T&P Coordinator"
      subtitle="Update coordinator information"
    >
      <Card>
        <CardBody>

          {loading ? (
            <div className="py-16 text-center text-slate-400">
              Loading coordinator...
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
                  value={form.name}
                  onChange={update("name")}
                  placeholder="Coordinator Name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Email
                </label>

                <Input
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  placeholder="Email Address"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Mobile Number
                </label>

                <Input
                  value={form.mobile_no}
                  onChange={update("mobile_no")}
                  placeholder="Mobile Number"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Age
                </label>

                <Input
                  type="number"
                  value={form.age}
                  onChange={update("age")}
                  placeholder="Age"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Department
                </label>

                <select
                  value={form.department_id}
                  onChange={update("department_id")}
                  className="w-full rounded-xl border border-orbit-border bg-orbit-surface2 px-4 py-3 text-slate-200 outline-none focus:border-orbit-primary appearance-none"
                >
                  <option value="">
                    Select Department
                  </option>

                  {departments.map((dept) => (
                    <option
                      key={dept.department_id}
                      value={dept.department_id}
                    >
                      {dept.department_name}
                    </option>
                  ))}
                </select>
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
                  <option value="">
                    Select Gender
                  </option>

                  {genders.map((gender) => (
                    <option
                      key={gender.gender_id}
                      value={gender.gender_id}
                    >
                      {gender.gender}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={update("is_active")}
                    className="w-4 h-4 rounded border-orbit-border"
                  />

                  <span className="text-sm text-slate-300">
                    Active Coordinator
                  </span>
                </label>
              </div>

              <div className="md:col-span-2 flex justify-between pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  icon={<ArrowLeft size={16} />}
                >
                  Back
                </Button>

                <Button
                  type="submit"
                  loading={saving}
                  icon={<Save size={16} />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          )}

        </CardBody>
      </Card>
    </DashboardShell>
  );
}