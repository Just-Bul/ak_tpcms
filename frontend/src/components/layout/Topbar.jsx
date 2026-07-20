import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  ChevronDown,
  FileText,
  GraduationCap,
  Menu,
  Moon,
  Search,
  Sun,
  Users,
  BriefcaseBusiness,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../utils/cn";
import { useSidebar } from "../../hooks/useSidebar";
import { useTheme } from "../../hooks/useTheme";
import api from "../../services/api";
import { Breadcrumb } from "../common/Breadcrumb";
import { formatViewLabel } from "../../utils/formatViewLabel";
import {
  getAuthUser,
  getRoleName,
  loadNotifications,
  markNotificationsRead,
  relativeTime,
} from "../../services/notifications";

const dashboardPaths = {
  "Super Admin": "/super-admin/dashboard",
  Coordinator: "/coordinator/dashboard",
  Company: "/company/dashboard",
  Student: "/students/dashboard",
};

const roleLinks = {
  "Super Admin": [
    ["Dashboard", "/super-admin/dashboard"],
    ["Students", "/super-admin/dashboard?view=view-students"],
    ["Companies", "/super-admin/dashboard?view=view-companies"],
    ["Placement activity", "/super-admin/dashboard?view=placement-activity"],
    ["Training activity", "/super-admin/dashboard?view=training-activity"],
    ["Applications", "/super-admin/dashboard?view=placement-applications"],
    ["Shared notes", "/super-admin/dashboard?view=share-notes"],
    ["Settings", "/super-admin/dashboard?view=settings"],
  ],
  Coordinator: [
    ["Dashboard", "/coordinator/dashboard"],
    ["Department students", "/coordinator/dashboard?view=students"],
    ["Placements", "/coordinator/dashboard?view=view-placements"],
    ["Trainings", "/coordinator/dashboard?view=view-trainings"],
    ["Applications", "/coordinator/dashboard?view=placement-applications"],
    ["Shared notes", "/coordinator/dashboard?view=shared-notes"],
    ["Settings", "/coordinator/dashboard?view=settings"],
  ],
  Company: [
    ["Dashboard", "/company/dashboard"],
    ["Company profile", "/company/dashboard?view=profile"],
    ["Manage jobs", "/company/dashboard?view=manage-jobs"],
    ["Manage trainings", "/company/dashboard?view=manage-training"],
    ["Applications", "/company/dashboard?view=recruitment"],
  ],
  Student: [
    ["Dashboard", "/students/dashboard"],
    ["Browse placements", "/students/dashboard?view=jobs"],
    ["Training programs", "/students/dashboard?view=training"],
    ["My applications", "/students/dashboard?view=applications"],
    ["My profile", "/students/dashboard?view=profile"],
    ["Notifications", "/students/dashboard?view=notifications"],
  ],
};

const asRows = (response) => {
  const data = response?.data?.data ?? response?.data ?? [];
  return Array.isArray(data) ? data : [];
};

const searchDestination = (role, type) => {
  const base = {
    "Super Admin": "/super-admin/dashboard",
    Coordinator: "/coordinator/dashboard",
    Company: "/company/dashboard",
    Student: "/students/dashboard",
  }[role];
  const view = {
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
    student: role === "Super Admin" ? "view-students" : "students",
    company: "view-companies",
  }[type];
  return view ? `${base}?view=${view}` : base;
};

function resultIcon(type) {
  if (type === "student") return GraduationCap;
  if (type === "company") return Building2;
  if (type === "placement") return BriefcaseBusiness;
  return FileText;
}

export function Topbar() {
  const { toggle: toggleSidebar } = useSidebar();
  const { theme, toggle: toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [expandedNotifications, setExpandedNotifications] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchRecords, setSearchRecords] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [authVersion, setAuthVersion] = useState(0);

  const user = getAuthUser();
  const role = getRoleName(user);
  const currentView = new URLSearchParams(location.search).get("view");
  const breadcrumbItems = [
    { label: role, to: dashboardPaths[role] },
    { label: formatViewLabel(currentView) },
  ];
  const unreadCount = notifications.filter((notification) => notification.unread).length;

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const nextNotifications = await loadNotifications();
        if (active) setNotifications(nextNotifications);
      } catch {
        if (active) setNotifications([]);
      }
    };

    refresh();
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener("tpcms-notifications-updated", refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("tpcms-notifications-updated", refresh);
    };
  }, [role, authVersion]);

  useEffect(() => {
    const refreshUser = () => setAuthVersion((version) => version + 1);
    window.addEventListener("tpcms-profile-updated", refreshUser);
    window.addEventListener("storage", refreshUser);
    return () => {
      window.removeEventListener("tpcms-profile-updated", refreshUser);
      window.removeEventListener("storage", refreshUser);
    };
  }, []);

  useEffect(() => {
    if (!showSearch) return undefined;
    let active = true;
    setLoadingSearch(true);

    const requests = [
      api.get("/placements").then(asRows).catch(() => []),
      api.get("/trainings").then(asRows).catch(() => []),
    ];
    if (role === "Super Admin") {
      requests.push(
        api.get("/students").then(asRows).catch(() => []),
        api.get("/organizations?status=approved").then(asRows).catch(() => [])
      );
    } else if (role === "Coordinator") {
      requests.push(api.get("/students?department=current").then(asRows).catch(() => []));
    }

    Promise.all(requests)
      .then(([placements, trainings, students = [], companies = []]) => {
        if (!active) return;
        const records = [
          ...placements.map((item) => ({
            id: `placement-${item.placement_id}`,
            type: "placement",
            label: item.title || "Untitled placement",
            detail: item.user_table?.name || item.organization_table?.name || "Placement",
          })),
          ...trainings.map((item) => ({
            id: `training-${item.training_id}`,
            type: "training",
            label: item.title || "Untitled training",
            detail: item.user_table?.name || "Training program",
          })),
          ...students.map((item) => ({
            id: `student-${item.user_id}`,
            type: "student",
            label: item.user_table?.name || item.name || "Student",
            detail: item.roll_no || item.user_table?.email || "Student",
          })),
          ...companies.map((item) => ({
            id: `company-${item.user_id || item.organization_id}`,
            type: "company",
            label: item.user_table?.name || item.name || "Company",
            detail: item.user_table?.email || "Company",
          })),
        ];
        setSearchRecords(records);
      })
      .finally(() => active && setLoadingSearch(false));

    return () => {
      active = false;
    };
  }, [showSearch, role]);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const quickLinks = (roleLinks[role] || []).map(([label, path]) => ({
      id: `link-${path}`,
      label,
      detail: "Open page",
      path,
      type: "link",
    }));

    if (!query) return quickLinks.slice(0, 8);

    const matches = [...quickLinks, ...searchRecords.filter((item) =>
      `${item.label} ${item.detail}`.toLowerCase().includes(query)
    ).map((item) => ({ ...item, path: searchDestination(role, item.type) }))];

    return matches
      .filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query))
      .slice(0, 10);
  }, [role, searchQuery, searchRecords]);

  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery("");
  };

  const markRead = (ids) => {
    markNotificationsRead(user.user_id || "anonymous", ids);
    setNotifications((current) => current.map((item) =>
      ids.includes(item.id) ? { ...item, unread: false } : item
    ));
  };

  const openNotification = (notification) => {
    if (notification.unread) markRead([notification.id]);
    setShowNotifications(false);
    if (notification.path) navigate(notification.path);
  };

  const toggleExpanded = (id) => {
    setExpandedNotifications((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <header className="h-16 border-b border-orbit-border bg-orbit-surface/80 backdrop-blur-xl flex items-center px-6 gap-4 flex-shrink-0 relative z-30">
      <button
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <Breadcrumb items={breadcrumbItems} className="mb-0" />

      <div className="ml-auto flex items-center gap-1">
        <button
          onClick={() => setShowSearch(true)}
          aria-label="Search portal"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
        >
          <Search className="w-4.5 h-4.5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications((open) => !open)}
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors relative"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-2 h-2 px-0.5 bg-orbit-accent rounded-full ring-2 ring-orbit-surface text-[8px] leading-2 text-white" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-[min(24rem,calc(100vw-2rem))] bg-orbit-surface2 border border-orbit-border rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-orbit-border">
                    <div>
                      <p className="text-sm font-semibold text-slate-200">Notifications</p>
                      <p className="text-[11px] text-slate-500">Updates for your {role.toLowerCase()} account</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markRead(notifications.map((item) => item.id))}
                        className="text-xs text-orbit-primary-light hover:text-orbit-accent transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto divide-y divide-orbit-border">
                    {notifications.length ? notifications.map((notification) => {
                      const expanded = expandedNotifications.has(notification.id);
                      return (
                        <div
                          key={notification.id}
                          className={cn("px-4 py-3 transition-colors", notification.unread && "bg-orbit-primary/5")}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => openNotification(notification)}
                              className="flex min-w-0 flex-1 items-start gap-3 text-left"
                            >
                              <span className={cn(
                                "mt-1.5 h-2 w-2 rounded-full flex-shrink-0",
                                notification.unread ? "bg-orbit-accent" : "bg-orbit-border2"
                              )} />
                              <span className="min-w-0">
                                <span className="block text-sm text-slate-200">{notification.title}</span>
                                <span className="mt-0.5 block text-xs text-slate-500">{relativeTime(notification.date)}</span>
                              </span>
                            </button>
                            <button
                              onClick={() => toggleExpanded(notification.id)}
                              aria-label={expanded ? "Collapse notification" : "Expand notification"}
                              className="rounded p-1 text-slate-500 hover:bg-white/5 hover:text-slate-300"
                            >
                              <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
                            </button>
                          </div>
                          <AnimatePresence initial={false}>
                            {expanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden pl-5"
                              >
                                <p className="pt-2 text-xs leading-5 text-slate-400">{notification.detail}</p>
                                {notification.unread && (
                                  <button
                                    onClick={() => markRead([notification.id])}
                                    className="mt-2 text-xs text-orbit-primary-light hover:text-orbit-accent"
                                  >
                                    Mark as read
                                  </button>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    }) : (
                      <div className="px-4 py-8 text-center text-sm text-slate-500">No notifications right now.</div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Toggle colour theme"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
        >
          {theme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {user.image_url ? (
          <img src={user.image_url} alt="" className="ml-2 h-8 w-8 rounded-full border border-orbit-border object-cover" />
        ) : (
          <div className="ml-2 w-8 h-8 rounded-full bg-gradient-to-br from-orbit-primary to-orbit-accent flex items-center justify-center text-white text-xs font-bold">
            {(user.name || "U").charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4"
            onClick={closeSearch}
          >
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xl bg-orbit-surface2 border border-orbit-border rounded-2xl shadow-2xl overflow-hidden"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 py-4 border-b border-orbit-border">
                <Search className="w-5 h-5 text-slate-500 flex-shrink-0" />
                <input
                  autoFocus
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={`Search ${role === "Student" ? "eligible posts" : "pages, posts, and people"}...`}
                  className="flex-1 bg-transparent text-slate-200 placeholder-slate-500 outline-none text-sm"
                />
                <button onClick={closeSearch} aria-label="Close search" className="text-slate-500 hover:text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-[55vh] overflow-y-auto px-2 py-3">
                <p className="px-2 pb-2 text-xs text-slate-600 uppercase tracking-wider font-medium">
                  {searchQuery ? "Results" : "Quick links"}
                </p>
                {searchResults.length ? searchResults.map((item) => {
                  const Icon = resultIcon(item.type);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.path);
                        closeSearch();
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
                    >
                      <Icon className="h-4 w-4 flex-shrink-0 text-orbit-primary-light" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-slate-300">{item.label}</span>
                        <span className="block truncate text-xs text-slate-500">{item.detail}</span>
                      </span>
                    </button>
                  );
                }) : (
                  <p className="px-3 py-7 text-center text-sm text-slate-500">
                    {loadingSearch ? "Searching portal data..." : "No matching pages or records."}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
