import api from "./api";

const STORAGE_PREFIX = "tpcms_notification_read_";
const EVENT_STORAGE_KEY = "tpcms_frontend_notification_events";
const DAY = 24 * 60 * 60 * 1000;
const EVENT_RETENTION = 30 * DAY;

const asRows = (response) => {
  const data = response?.data?.data ?? response?.data ?? [];
  return Array.isArray(data) ? data : [];
};

export const getAuthUser = () => {
  try {
    return JSON.parse(localStorage.getItem("auth_user") || "{}")?.user || {};
  } catch {
    return {};
  }
};

export const getRoleName = (user = getAuthUser()) => {
  const rawRole = user?.role_table?.role || user?.role?.role || user?.role_name;
  if (rawRole === "Organization") return "Company";
  if (rawRole === "SuperAdmin") return "Super Admin";
  if (rawRole) return rawRole;

  return ({ 1: "Super Admin", 2: "Student", 3: "Coordinator", 4: "Company" })[
    Number(user?.role_id)
  ] || "User";
};

const readIds = (userId) => {
  try {
    return new Set(JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}${userId}`) || "[]"));
  } catch {
    return new Set();
  }
};

const saveReadIds = (userId, ids) => {
  localStorage.setItem(
    `${STORAGE_PREFIX}${userId}`,
    JSON.stringify([...new Set(ids)].slice(-500))
  );
};

const readFrontendEvents = () => {
  try {
    const cutoff = Date.now() - EVENT_RETENTION;
    const events = JSON.parse(localStorage.getItem(EVENT_STORAGE_KEY) || "[]")
      .filter((event) => new Date(event.date).getTime() >= cutoff);
    localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(events));
    return events;
  } catch {
    return [];
  }
};

/**
 * Immediately records a browser-side notification after an existing API action
 * succeeds. This bridges the interval before the next API poll and covers the
 * current frontend session without requiring a backend notification table.
 */
export const publishFrontendNotification = ({
  id,
  title,
  detail,
  type,
  priority = "normal",
  audience = {},
  date = new Date().toISOString(),
}) => {
  const nextEvent = { id, title, detail, type, priority, audience, date };
  const events = readFrontendEvents();
  const nextEvents = [...events.filter((event) => event.id !== id), nextEvent].slice(-250);
  localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(nextEvents));
  window.dispatchEvent(new Event("tpcms-notifications-updated"));
};

export const markNotificationsRead = (userId, notificationIds) => {
  const ids = readIds(userId);
  notificationIds.forEach((id) => ids.add(id));
  saveReadIds(userId, [...ids]);
};

const destinationFor = (role, type) => {
  const base = {
    "Super Admin": "/super-admin/dashboard",
    Coordinator: "/coordinator/dashboard",
    Company: "/company/dashboard",
    Student: "/students/dashboard",
  }[role] || "/";

  const view = {
    company: role === "Super Admin" ? "view-companies" : "dashboard",
    student: role === "Super Admin" ? "view-students" : "students",
    placement: role === "Student"
      ? "jobs"
      : role === "Company"
        ? "manage-jobs"
        : role === "Super Admin"
          ? "placement-activity"
          : "view-placements",
    training: role === "Student"
      ? "training"
      : role === "Company"
        ? "manage-training"
        : role === "Super Admin"
          ? "training-activity"
          : "view-trainings",
    placementApplication: role === "Student" ? "placement-applications" : "placement-applications",
    trainingApplication: role === "Student" ? "training-applications" : "training-applications",
    note: role === "Super Admin" ? "share-notes" : "shared-notes",
  }[type] || "dashboard";

  return view === "dashboard" ? base : `${base}?view=${view}`;
};

const safeFetch = (path) => api.get(path).then(asRows).catch(() => []);

const dateValue = (row) =>
  row?.updated_on ||
  row?.created_on ||
  row?.date_of_submission ||
  row?.created_at ||
  row?.createdAt ||
  row?.last_date_of_submission ||
  null;

const isSoon = (value) => {
  const time = new Date(value).getTime();
  const now = Date.now();
  return Number.isFinite(time) && time >= now && time - now <= 7 * DAY;
};

const statusText = (status) => ({ 0: "pending", 1: "pending", 2: "shortlisted", 3: "rejected" })[Number(status)] || "updated";
const isPending = (status) => Number(status) === 0 || Number(status) === 1;

const recordId = (row, prefix) =>
  row?.[`${prefix}_id`] || row?.id || row?.user_id || row?.note_id || "unknown";

function makeNotification({ id, title, detail, date, type, role, priority = "normal" }) {
  return { id, title, detail, date, type, priority, path: destinationFor(role, type) };
}

function addPostNotifications(items, posts, kind, role) {
  posts.forEach((post) => {
    const id = recordId(post, kind);
    const label = post.title || `${kind === "placement" ? "Placement" : "Training"} post`;
    const type = kind;
    const noun = kind === "placement" ? "placement" : "training";

    items.push(makeNotification({
      id: `${kind}-post-${id}`,
      title: `New ${noun}: ${label}`,
      detail: role === "Student" ? "You are eligible to apply." : "A post was created or updated.",
      date: dateValue(post),
      type,
      role,
    }));

    if (isSoon(post.last_date_of_submission)) {
      items.push(makeNotification({
        id: `${kind}-deadline-${id}-${post.last_date_of_submission}`,
        title: `${label} closes soon`,
        detail: `Application deadline: ${new Date(post.last_date_of_submission).toLocaleDateString("en-IN")}.`,
        date: post.last_date_of_submission,
        type,
        role,
        priority: "urgent",
      }));
    }
  });
}

function addApplicationNotifications(items, applications, kind, role) {
  applications.forEach((application) => {
    const post = kind === "placement" ? application.placement_table : application.training_table;
    const postId = application[`${kind}_id`] || recordId(post || {}, kind);
    const studentName = application.student_table?.user_table?.name || application.student_table?.name || "A student";
    const title = post?.title || `${kind === "placement" ? "Placement" : "Training"} post`;
    const status = Number(application.status_id);
    const appDate = dateValue(application);

    if (role === "Student") {
      if (!isPending(status)) {
        items.push(makeNotification({
          id: `${kind}-application-status-${postId}-${status}`,
          title: `${title}: application ${statusText(status)}`,
          detail: `Your ${kind} application status has changed.`,
          date: appDate,
          type: `${kind}Application`,
          role,
          priority: status === 3 ? "urgent" : "normal",
        }));
      }
      return;
    }

    items.push(makeNotification({
      id: `${kind}-application-${postId}-${application.student_id}-${status}`,
      title: isPending(status) ? `New applicant for ${title}` : `${title}: applicant ${statusText(status)}`,
      detail: isPending(status)
        ? `${studentName} submitted a ${kind} application.`
        : `${studentName}'s ${kind} application is now ${statusText(status)}.`,
      date: appDate,
      type: `${kind}Application`,
      role,
    }));
  });
}

/**
 * Builds notifications from the APIs already available to the signed-in role.
 * Read state is intentionally local because the current backend has no notification
 * read/unread endpoint.
 */
export async function loadNotifications() {
  const user = getAuthUser();
  const role = getRoleName(user);
  const userId = user?.user_id || "anonymous";

  const requests = [
    safeFetch("/placements"),
    safeFetch("/trainings"),
    safeFetch("/placement-applications"),
    safeFetch("/training-applications"),
    safeFetch("/notes"),
  ];

  if (role === "Super Admin") {
    requests.push(safeFetch("/organizations?status=pending"), safeFetch("/students"));
  } else if (role === "Coordinator") {
    requests.push(safeFetch("/students?department=current"));
  }

  const [placements, trainings, placementApplications, trainingApplications, notes, extraA = [], extraB = []] =
    await Promise.all(requests);
  const items = [];

  addPostNotifications(items, placements, "placement", role);
  addPostNotifications(items, trainings, "training", role);
  addApplicationNotifications(items, placementApplications, "placement", role);
  addApplicationNotifications(items, trainingApplications, "training", role);

  notes
    .filter((note) => note.creator_id !== user.user_id && note.user_id !== user.user_id)
    .forEach((note) => {
      const id = recordId(note, "note");
      items.push(makeNotification({
        id: `note-${id}`,
        title: `New shared note: ${note.title || "Study material"}`,
        detail: note.description || "New study material is available.",
        date: dateValue(note),
        type: "note",
        role,
      }));
    });

  if (role === "Super Admin") {
    extraA.forEach((company) => {
      const id = company.user_id || company.organization_id;
      items.push(makeNotification({
        id: `company-registration-${id}`,
        title: "New company registration",
        detail: `${company.user_table?.name || company.name || "A company"} is awaiting approval.`,
        date: dateValue(company),
        type: "company",
        role,
      }));
    });
    extraB.forEach((student) => {
      const id = student.user_id;
      items.push(makeNotification({
        id: `student-registration-${id}`,
        title: "New student registered",
        detail: `${student.user_table?.name || student.name || "A student"} joined the portal.`,
        date: dateValue(student),
        type: "student",
        role,
      }));
    });
  }

  if (role === "Coordinator") {
    extraA.forEach((student) => {
      const id = student.user_id;
      items.push(makeNotification({
        id: `department-student-${id}`,
        title: "New department student",
        detail: `${student.user_table?.name || student.name || "A student"} was added to your department.`,
        date: dateValue(student),
        type: "student",
        role,
      }));
    });
  }

  readFrontendEvents()
    .filter((event) => {
      const targetRoles = event.audience?.roles || [];
      const targetUsers = (event.audience?.userIds || []).map(String);
      return targetRoles.includes(role) || targetUsers.includes(String(user.user_id));
    })
    .forEach((event) => {
      items.push(makeNotification({
        id: event.id,
        title: event.title,
        detail: event.detail,
        date: event.date,
        type: event.type,
        role,
        priority: event.priority,
      }));
    });

  const unique = Array.from(new Map(items.map((item) => [item.id, item])).values())
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 100);
  const alreadyRead = readIds(userId);

  return unique.map((item) => ({ ...item, unread: !alreadyRead.has(item.id) }));
}

export function relativeTime(value) {
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return "Recently";
  const seconds = Math.max(0, Math.floor((Date.now() - time) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} day${seconds >= 172800 ? "s" : ""} ago`;
}
