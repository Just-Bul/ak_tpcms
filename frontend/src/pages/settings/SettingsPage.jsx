import { useMemo, useState } from "react";
import DashboardShell from "../../components/DashboardShell";
import { Badge, Button, Card, CardBody, CardHeader, Input, Avatar } from "../../components/ui";
import { AvatarUpload } from "@/components/common/AvatarUpload";
import { AlertCircle, Mail, Phone, Save, UserRound } from "lucide-react";
import api from "../../services/api";
import { getRoleName } from "../../services/notifications";

const readAuth = () => {
  try {
    return JSON.parse(localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user") || "{}");
  } catch {
    return {};
  }
};

const profileStorageKey = (userId) => `tpcms_profile_${userId || "current"}`;

const profileFromAuth = (auth) => {
  const user = auth?.user || {};
  let savedProfile = {};
  try {
    savedProfile = JSON.parse(localStorage.getItem(profileStorageKey(user.user_id)) || "{}");
  } catch {
    savedProfile = {};
  }

  return {
    name: savedProfile.name ?? user.name ?? "",
    email: savedProfile.email ?? user.email ?? "",
    mobile_no: savedProfile.mobile_no ?? user.mobile_no ?? "",
    image_url: savedProfile.image_url ?? user.image_url ?? "",
  };
};

export default function SettingsPage() {
  const initialAuth = useMemo(readAuth, []);
  const [auth, setAuth] = useState(initialAuth);
  const [profile, setProfile] = useState(() => profileFromAuth(initialAuth));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const user = auth?.user || {};
  const role = getRoleName(user);

  const update = (field) => (event) => {
    setProfile((current) => ({ ...current, [field]: event.target.value }));
    setMessage("");
    setError("");
  };

  const saveLocalProfile = (nextProfile) => {
    const nextUser = {
      ...user,
      name: nextProfile.name,
      email: nextProfile.email,
      mobile_no: nextProfile.mobile_no,
      image_url: nextProfile.image_url,
    };
    const nextAuth = { ...auth, user: nextUser };

    localStorage.setItem(profileStorageKey(user.user_id), JSON.stringify(nextProfile));
    localStorage.setItem("auth_user", JSON.stringify(nextAuth));
    setAuth(nextAuth);
    window.dispatchEvent(new Event("tpcms-profile-updated"));
  };

  const handleSave = async () => {
    const nextProfile = {
      name: profile.name.trim(),
      email: profile.email.trim(),
      mobile_no: profile.mobile_no.trim(),
      image_url: profile.image_url || "",
    };

    if (!nextProfile.name || !nextProfile.email) {
      setError("Name and email are required.");
      return;
    }

    if (nextProfile.mobile_no && !/^\d{10}$/.test(nextProfile.mobile_no)) {
      setError("Mobile number must contain exactly 10 digits.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (role === "Student") {
        await api.put("/students/me", {
          email: nextProfile.email,
          mobile_no: nextProfile.mobile_no || undefined,
          image_url: nextProfile.image_url || undefined,
        });
      } else if (role === "Company") {
        await api.put(`/organizations/${user.user_id}`, {
          name: nextProfile.name,
          email: nextProfile.email,
          mobile_no: nextProfile.mobile_no || undefined,
        });
      }

      saveLocalProfile(nextProfile);
      setProfile(nextProfile);
      setMessage(
        role === "Student" || role === "Company"
          ? "Profile updated successfully."
          : "Profile saved for this account on this device."
      );
    } catch (saveError) {
      setError(saveError.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell title="Settings" subtitle="Manage your account details and profile image">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <Card>
          <CardHeader
            title="My Profile"
            subtitle="Update the information shown across the portal."
            actions={<Badge variant="primary">{role}</Badge>}
          />
          <CardBody>
            {error && (
              <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            {message && (
              <div className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {message}
              </div>
            )}

            <div className="flex flex-col gap-8 lg:flex-row">
              <div className="flex w-full flex-col items-center gap-4 lg:w-48">
                {/* Avatar editing lives here only for roles with no dedicated profile page
                    (Student -> My Profile, Company -> Company Profile already own it — item 16). */}
                {role === "Super Admin" || role === "Coordinator" ? (
                  <AvatarUpload
                    value={profile.image_url}
                    onChange={(url) => {
                      setProfile((current) => ({ ...current, image_url: url }));
                      setMessage("");
                    }}
                    uploadPath="/uploads/profile"
                    initials={(profile.name || "U").slice(0, 2)}
                    size="2xl"
                  />
                ) : (
                  <Avatar src={profile.image_url} initials={(profile.name || "U").slice(0, 2)} size="2xl" />
                )}
              </div>

              <div className="grid flex-1 gap-5 md:grid-cols-2">
                <Input
                  label="Full Name"
                  value={profile.name}
                  onChange={update("name")}
                  prefix={<UserRound size={16} />}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={profile.email}
                  onChange={update("email")}
                  prefix={<Mail size={16} />}
                  required
                />
                <Input
                  label="Mobile Number"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={profile.mobile_no}
                  onChange={update("mobile_no")}
                  prefix={<Phone size={16} />}
                  placeholder="10-digit mobile number"
                />
                <Input label="Role" value={role} disabled />

                <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-1">
                  <Button onClick={handleSave} loading={saving} icon={<Save size={16} />}>
                    Save Profile
                  </Button>
                  {(role === "Student" || role === "Company") && (
                    <span className="text-xs text-slate-500">
                      To change your avatar{role === "Company" ? "/logo" : ""}, use the {role === "Student" ? "My Profile" : "Company Profile"} page.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {(role === "Super Admin" || role === "Coordinator") && (
          <p className="rounded-lg border border-orbit-border bg-orbit-surface/50 px-4 py-3 text-xs leading-5 text-slate-500">
            Profile fields are kept in the frontend account session because the currently available API exposes no self-profile update endpoint for this role.
          </p>
        )}
      </div>
    </DashboardShell>
  );
}
