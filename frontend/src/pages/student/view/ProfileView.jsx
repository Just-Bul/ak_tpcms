import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import DatePicker from "react-datepicker";
import { AvatarUpload } from "@/components/common/AvatarUpload";
import { SkillsInput, Avatar } from "@/components/ui";
import { getAssetUrl } from "@/utils/getAssetUrl";
import MediaUpload from "../../../components/ui/MediaUpload";
import {
  AlertCircle,
  BookOpen,
  GraduationCap,
  Mail,
  Pencil,
  Phone,
  Save,
  User,
  X,
} from "lucide-react";

const empty = "N/A";

const toList = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const mapById = (items, idKey, labelKey) =>
  items.reduce((acc, item) => {
    acc[item[idKey]] = item[labelKey];
    return acc;
  }, {});

const findIdByLabel = (items, idKey, labelKey, label) => {
  if (!label) return "";
  const found = items.find(
    (item) =>
      String(item[labelKey] || "").toLowerCase() ===
      String(label).toLowerCase(),
  );
  return found?.[idKey] || "";
};

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return "";
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
};

export default function ProfileView() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [meta, setMeta] = useState({
    categories: [],
    departments: [],
    divisions: [],
    genders: [],
    semesters: [],
    skills: [],
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const lookups = useMemo(
    () => ({
      categories: mapById(meta.categories, "category_id", "category"),
      departments: mapById(
        meta.departments,
        "department_id",
        "department_name",
      ),
      divisions: mapById(meta.divisions, "division_id", "division"),
      genders: mapById(meta.genders, "gender_id", "gender"),
      semesters: mapById(meta.semesters, "semester_id", "semester"),
      skills: mapById(meta.skills, "skill_id", "skill"),
    }),
    [meta],
  );

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const [
        profileRes,
        categories,
        departments,
        divisions,
        genders,
        semesters,
        skills,
      ] = await Promise.all([
        api.get("/students/me"),
        api.get("/categories/").catch(() => ({ data: [] })),
        api.get("/departments/").catch(() => ({ data: [] })),
        api.get("/divisions/").catch(() => ({ data: [] })),
        api.get("/genders/").catch(() => ({ data: [] })),
        api.get("/semesters/").catch(() => ({ data: [] })),
        api.get("/skills/").catch(() => ({ data: [] })),
      ]);
      const nextProfile = profileRes?.data || null;
      setProfile(nextProfile);
      const categoryList = Array.isArray(categories?.data)
        ? categories.data
        : [];
      const divisionList = Array.isArray(divisions?.data) ? divisions.data : [];
      const genderList = Array.isArray(genders?.data) ? genders.data : [];
      setForm({
        email: nextProfile?.email || nextProfile?.user_table?.email || "",
        password: "",
        mobile_no:
          nextProfile?.mobile_no || nextProfile?.user_table?.mobile_no || "",
        gender_id:
          nextProfile?.gender_id ||
          findIdByLabel(genderList, "gender_id", "gender", nextProfile?.gender),
        cgpa: nextProfile?.cgpa || "",
        has_backlog: Boolean(nextProfile?.has_backlog),
        tenth_division_id:
          nextProfile?.tenth_division_id ||
          findIdByLabel(
            divisionList,
            "division_id",
            "division",
            nextProfile?.tenth_division,
          ),
        twelfth_division_id:
          nextProfile?.twelfth_division_id ||
          findIdByLabel(
            divisionList,
            "division_id",
            "division",
            nextProfile?.twelfth_division,
          ),
        category_id:
          nextProfile?.category_id ||
          findIdByLabel(
            categoryList,
            "category_id",
            "category",
            nextProfile?.category,
          ),
        resume_url: nextProfile?.resume_url || "",
        image_url: nextProfile?.image_url || "",
        skills: toList(nextProfile?.skill).map((skill) =>
          typeof skill === "object" ? skill.skill : skill,
        ),
      });
      setMeta({
        categories: Array.isArray(categories?.data) ? categories.data : [],
        departments: Array.isArray(departments?.data) ? departments.data : [],
        divisions: Array.isArray(divisions?.data) ? divisions.data : [],
        genders: Array.isArray(genders?.data) ? genders.data : [],
        semesters: Array.isArray(semesters?.data) ? semesters.data : [],
        skills: Array.isArray(skills?.data) ? skills.data : [],
      });
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage("");
  };

  const toggleSkill = (skillName) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills?.includes(skillName)
        ? prev.skills.filter((name) => name !== skillName)
        : [...(prev.skills || []), skillName],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        email: form.email?.trim() || undefined,
        mobile_no: form.mobile_no?.trim() || undefined,
        gender_id: form.gender_id ? Number(form.gender_id) : undefined,
        has_backlog: form.has_backlog,
        date_of_birth: form.date_of_birth || undefined,
        cgpa: form.cgpa === "" ? undefined : Number(form.cgpa),
        tenth_division_id: form.tenth_division_id
          ? Number(form.tenth_division_id)
          : undefined,
        twelfth_division_id: form.twelfth_division_id
          ? Number(form.twelfth_division_id)
          : undefined,
        category_id: form.category_id ? Number(form.category_id) : undefined,
        resume_url: form.resume_url || undefined,
        image_url: form.image_url || undefined,
        skills: (form.skills || [])
          .map((skill) => String(skill).trim())
          .filter(Boolean),
      };

      await api.put(
        "/students/me",
        Object.fromEntries(
          Object.entries(payload).filter(([, value]) => value !== undefined),
        ),
      );
      setMessage("Profile updated successfully");
      setEditing(false);
      await loadProfile();
    } catch (err) {
      setMessage(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="text-sm text-slate-500">Loading profile...</div>;
  if (error) return <div className="text-sm text-red-400">{error}</div>;
  if (!profile)
    return <div className="text-sm text-slate-500">Profile not found.</div>;

  const email = profile.email || profile.user_table?.email || empty;
  const mobile = profile.mobile_no || profile.user_table?.mobile_no || empty;
  const age = calculateAge(profile.date_of_birth);
  const skillLabels = Array.isArray(profile.skill)
    ? profile.skill.map((s) => (typeof s === "object" ? s.skill : s))
    : [];

  const personalDetails = [
    { label: "Name", value: profile.name, icon: User },
    { label: "Roll No", value: profile.roll_no, icon: GraduationCap },
    { label: "Email", value: email, icon: Mail },
    {
      label: "Mobile No",
      field: "mobile_no",
      value: mobile,
      icon: Phone,
      editable: true,
    },
    { label: "Age", value: age },
    {
      label: "Date of Birth",
      field: "date_of_birth",
      value: profile.date_of_birth
        ? new Date(profile.date_of_birth).toLocaleDateString()
        : empty,
      type: "date",
      editable: true,
    },
    {
      label: "Gender",
      field: "gender_id",
      value: profile.gender,
      type: "gender",
      editable: true,
    },
    {
      label: "Department",
      value: profile.department,
    },
    {
      label: "Semester",
      value: profile.semester,
    },
  ];

  const academicDetails = [
    { label: "CGPA", field: "cgpa", value: profile.cgpa, type: "number" },
    {
      label: "Backlog",
      field: "has_backlog",
      value: profile.has_backlog ? "Yes" : "No",
      type: "checkbox",
    },
    {
      label: "10th Division",
      field: "tenth_division_id",
      value: profile.tenth_division,
      type: "division",
    },
    {
      label: "12th Division",
      field: "twelfth_division_id",
      value: profile.twelfth_division,
      type: "division",
    },
    {
      label: "Category",
      field: "category_id",
      value: profile.category,
      type: "category",
    },
    { label: "Graduate", value: profile.is_graduate ? "Yes" : "No" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">My Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Your student, academic, and document details.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing((value) => !value)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-orbit-border bg-orbit-surface2 px-4 py-2 text-sm text-slate-200 hover:border-orbit-border2"
        >
          {editing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          {editing ? "Cancel" : "Edit / Update"}
        </button>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-lg border border-orbit-border bg-orbit-surface p-3 text-sm text-slate-300">
          <AlertCircle className="h-4 w-4 text-orbit-primary-light" />
          {message}
        </div>
      )}

      <section className="rounded-xl border border-orbit-border bg-orbit-surface p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Personal Details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {personalDetails.map((item) => {
            const Icon = item.icon || BookOpen;
            return (
              <div
                key={item.label}
                className="rounded-lg border border-orbit-border bg-orbit-bg/40 p-4"
              >
                <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </div>
                {editing && item.editable && item.type === "gender" ? (
                  <select
                    value={form.gender_id || ""}
                    onChange={(e) => updateField("gender_id", e.target.value)}
                    className="w-full rounded-lg border border-orbit-border bg-orbit-surface2 px-3 py-2 text-sm text-slate-200"
                  >
                    <option value="">Select gender</option>
                    {meta.genders.map((gender) => (
                      <option key={gender.gender_id} value={gender.gender_id}>
                        {gender.gender}
                      </option>
                    ))}
                  </select>
                ): editing && item.editable && item.type === "date" ?(
                    <DatePicker
    selected={
      form.date_of_birth ? new Date(form.date_of_birth) : null
    }
    onChange={(date) =>
      updateField(
        "date_of_birth",
        date ? date.toISOString().split("T")[0] : ""
      )
    }
    dateFormat="dd/MM/yyyy"
    showYearDropdown
    scrollableYearDropdown
    yearDropdownItemNumber={100}
    maxDate={new Date()}
    placeholderText="Select Date of Birth"
    className="w-full rounded-lg border border-orbit-border bg-orbit-surface2 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
    popperClassName="z-50"
  />
                ) : editing && item.editable ? (
                  <input
                    value={form[item.field] || ""}
                    onChange={(e) => updateField(item.field, e.target.value)}
                    className="w-full rounded-lg border border-orbit-border bg-orbit-surface2 px-3 py-2 text-sm text-slate-200"
                  />
                ) : (
                  <p className="break-words text-sm font-medium text-slate-100">
                    {item.value || empty}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-orbit-border bg-orbit-surface p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Academic Details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {academicDetails.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-orbit-border bg-orbit-bg/40 p-4"
            >
              <p className="mb-2 text-xs text-slate-500">{item.label}</p>
              {!editing || !item.field ? (
                <p className="text-sm font-medium text-slate-100">
                  {item.value ?? empty}
                </p>
              ) : item.type === "checkbox" ? (
                <label className="inline-flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={form.has_backlog}
                    onChange={(e) =>
                      updateField("has_backlog", e.target.checked)
                    }
                  />
                  Has backlog
                </label>
              ) : item.type === "division" ? (
                <select
                  value={form[item.field]}
                  onChange={(e) => updateField(item.field, e.target.value)}
                  className="w-full rounded-lg border border-orbit-border bg-orbit-surface2 px-3 py-2 text-sm text-slate-200"
                >
                  <option value="">Select division</option>
                  {meta.divisions.map((division) => (
                    <option
                      key={division.division_id}
                      value={division.division_id}
                    >
                      {division.division}
                    </option>
                  ))}
                </select>
              ) : item.type === "category" ? (
                <select
                  value={form.category_id}
                  onChange={(e) => updateField("category_id", e.target.value)}
                  className="w-full rounded-lg border border-orbit-border bg-orbit-surface2 px-3 py-2 text-sm text-slate-200"
                >
                  <option value="">Select category</option>
                  {meta.categories.map((category) => (
                    <option
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.category}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={item.type || "text"}
                  value={form[item.field] || ""}
                  onChange={(e) => updateField(item.field, e.target.value)}
                  className="w-full rounded-lg border border-orbit-border bg-orbit-surface2 px-3 py-2 text-sm text-slate-200"
                />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-orbit-border bg-orbit-surface p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Skills & Documents
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-orbit-border bg-orbit-bg/40 p-4 lg:col-span-3">
            <p className="mb-3 text-xs text-slate-500">Skills</p>

            {editing ? (
              <div className="space-y-3">
                <SkillsInput
                  value={form.skills || []}
                  onChange={(skills) => updateField("skills", skills)}
                  placeholder="Type a skill and press comma or Enter..."
                />
                {meta.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {meta.skills
                      .filter((skill) => !form.skills?.includes(skill.skill))
                      .map((skill) => (
                        <button
                          key={skill.skill_id}
                          type="button"
                          onClick={() => toggleSkill(skill.skill)}
                          className="rounded-full border border-orbit-border bg-orbit-surface2 px-3 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          + {skill.skill}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            ) : skillLabels.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skillLabels.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-orbit-primary/10 px-3 py-1 text-xs text-orbit-primary-light"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No skills added.</p>
            )}
          </div>

          <div className="rounded-lg border border-orbit-border bg-orbit-bg/40 p-4 flex flex-col items-center justify-center gap-3">
            <p className="text-xs text-slate-500 self-start">Profile Image</p>
            {editing ? (
              <AvatarUpload
                value={getAssetUrl(form.image_url)}
                onChange={(url) => updateField("image_url", url)}
                uploadPath="/uploads/profile"
                initials={(profile.name || "S").slice(0, 2)}
                size="2xl"
              />
            ) : (
              <Avatar
                src={getAssetUrl(profile.image_url)}
                initials={(profile.name || "S").slice(0, 2)}
                size="2xl"
              />
            )}
          </div>

          <div className="rounded-lg border border-orbit-border bg-orbit-bg/40 p-4">
            <p className="mb-2 text-xs text-slate-500">Resume</p>
            {editing ? (
              <MediaUpload
                label=""
                accept="image/*,application/pdf"
                value={getAssetUrl(form.resume_url) || ""}
                onChange={(url) => updateField("resume_url", url)}
                uploadPath="/uploads/resume"
                hint="Resume file, max 2 MB"
              />
            ) : profile.resume_url ? (
              <a
                href={getAssetUrl(profile.resume_url)}
                target="_blank"
                rel="noreferrer"
                className="break-all text-sm text-orbit-primary-light"
              >
                View Resume
              </a>
            ) : (
              <p className="text-sm text-slate-500">{empty}</p>
            )}
          </div>
        </div>
      </section>

      {editing && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-orbit-primary px-4 py-2 text-sm font-medium text-white hover:bg-orbit-primary-light disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <p className="text-xs text-slate-500">
            Name, roll no, department, and semester are display-only for this
            API.
          </p>
        </div>
      )}
    </div>
  );
}
