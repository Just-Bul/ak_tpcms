import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  Briefcase,
  FileText,
  Settings,
  Bell,
  BookOpenCheck,
  UserRound,
  FileUp,
  Award,
  ChevronDown,
  LogOut,
  Calendar,
  Megaphone,
  KeyRound,
} from "lucide-react";
import { useSidebar } from "@/hooks/useSidebar";
import logout from "@/pages/auth/logout";

/* ──────────────────────────── role → dashboard path ──────────────────────────── */
const dashboardPaths = {
  "Super Admin": "/super-admin/dashboard",
  "Coordinator": "/coordinator/dashboard",
  "Company": "/company/dashboard",
  "Student": "/students/dashboard",
};

/* ──────────────────── role → label → query-param view value ──────────────────── */
const viewMap = {
  "Super Admin": {
    Dashboard: "dashboard",
    "Students": "view-students",
    "View Students": "view-students",
    "Add Students": "add-students",
    "Edit Students": "edit-students",
    "Disable Students": "disable-students",
    "View Company": "view-companies",
    "Approve Company": "approved-companies",
    "Reject Company": "rejected-companies",
    "View Departments": "view-departments",
    "Add Department": "add-department",
    "Department Posts": "department-posts",
    "View Coordinators": "view-coordinators",
    "Add Coordinator": "add-coordinator",
    "Edit Coordinator": "edit-coordinator",
    "T&P Coordinators": "view-coordinators",
    "Edit Department": "edit-department",
    // "Create T&P Coordinators": "add-coordinator",
    "View Placement Activity": "placement-activity",
    "Post Placement Notification": "post-placement",
    "Placement Applications": "placement-applications",
    "Placed Students": "placed-students",
    "View Training Activity": "training-activity",
    "Post Training": "post-training-admin",
    "Training Applications": "training-applications",
    "Note Share": "share-notes",
    "Notices": "notice-board",
    "Schedule Interviews": "interview",
    "Generate Reports": "reports",
    "Recruitment Partners": "partners",
    "Change Password": "change-password",
    "Settings": "settings",
  },
  Coordinator: {
  Dashboard: "dashboard",

  "Students": "students",
  "Student Details": "student-details",

  "Trainings": "view-trainings",
  "Training Details": "training-details",
  "Training Applications": "training-applications",
  "Post Training": "post-training",

  "Placements": "view-placements",
  "Placement Details": "placement-details",
  "Placement Applications": "placement-applications",
  "Post Placement": "post-placement",
  "Placed Students": "placed-students",

  "Note Share": "shared-notes",
  "Notices": "notice-board",
  "Schedule Interviews": "interview",

  "Change Password": "change-password",
  "Settings": "settings",
},
  Company: {
    Dashboard: "dashboard",
    "Company Profile": "profile",
    "Post Job": "post-job",
    "Manage Jobs": "manage-jobs",
    "Post Training": "post-training",
    "Manage Training": "manage-training",
    "Student Applications": "recruitment",
    "Shortlisted Candidates": "shortlisted",
    "Schedule Interviews": "interview",
    "Change Password": "change-password",
    Settings: "settings",
  },
  Student: {
    Dashboard: "dashboard",
    "Browse Placements": "jobs",
    "Browse Jobs": "jobs",
    "Training Programs": "training",
    "My Applications": "applications",
    "Placement Applications": "placement-applications",
    "Training Applications": "training-applications",
    "Placed Students": "placed-students",
    Notifications: "notifications",
    "Note Share": "shared_notes",
    "Notices": "notice-board",
    "My Profile": "profile",
    "Interview Letters": "letters",
    "Resume": "resume",
    "Change Password": "change-password",
    Settings: "settings",
  },
};

/* ───────────────────────── role → menu items definition ───────────────────────── */
const menuItems = {
  "Super Admin": [
    { title: "Dashboard", icon: LayoutDashboard },
    { title: "Students", icon: Users },
    { title: "View Company", icon: Building2 },
    { title: "View Departments", icon: GraduationCap },
    {
      title: "Training",
      icon: BookOpenCheck,
      submenu: [
        "View Training Activity",
        "Training Applications",
      ],
    },
    {
      title: "Placement",
      icon: Briefcase,
      submenu: [
        "View Placement Activity",
        "Placement Applications",
        "Placed Students",
        "Generate Reports",
        "Recruitment Partners",
      ],
    },
    { title: "Note Share", icon: FileText },
    { title: "Notices", icon: Megaphone },
    { title: "Schedule Interviews", icon: Calendar },
    { title: "Change Password", icon: KeyRound },
    { title: "Settings", icon: Settings },
  ],

  Coordinator: [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
  },

  { title: "Students", icon: Users },

  {
    title: "Training",
    icon: BookOpenCheck,
    submenu: [
      "Trainings",
      "Training Applications",
    ],
  },

  {
    title: "Placement",
    icon: Briefcase,
    submenu: [
      "Placements",
      "Placement Applications",
      "Placed Students",
    ],
  },

  {
    title: "Note Share",
    icon: FileText,
  },

  {
    title: "Notices",
    icon: Megaphone,
  },

  {
    title: "Schedule Interviews",
    icon: Calendar,
  },

  {
    title: "Change Password",
    icon: KeyRound,
  },
  {
    title: "Settings",
    icon: Settings,
  },
],

  Company: [
    { title: "Dashboard", icon: LayoutDashboard },
    { title: "Company Profile", icon: Building2 },
    { title: "Manage Jobs", icon: Briefcase },
    { title: "Manage Training", icon: BookOpenCheck },
    {
      title: "Recruitment",
      icon: Users,
      submenu: [
        "Student Applications",
        "Schedule Interviews",
      ],
    },
    { title: "Change Password", icon: KeyRound },
    { title: "Settings", icon: Settings },
  ],

  Student: [
    { title: "Dashboard", icon: LayoutDashboard },
    {
      title: "Placement",
      icon: Briefcase,
      submenu: ["Browse Placements", "Placement Applications", "Placed Students"],
    },
    {
      title: "Training",
      icon: BookOpenCheck,
      submenu: ["Training Programs", "Training Applications"],
    },
    { title: "My Applications", icon: FileText },
    { title: "Note Share", icon: FileText },
    { title: "Notices", icon: Megaphone },
    { title: "Notifications", icon: Bell },
    { title: "Change Password", icon: KeyRound },
    { title: "Settings", icon: Settings },
    {
      title: "Profile",
      icon: UserRound,
      submenu: [
        "My Profile",
        "Interview Letters",
      ],
    },
    {
      title: "Resume",
      icon: FileText,
    }
  ],
};

/* ─────────────────────────── role label colours ─────────────────────────────── */
const roleBadgeColors = {
  "Super Admin":
    "from-red-500/20 to-orange-500/20 text-orange-300 border-orange-500/30",
  "Coordinator": "from-blue-500/20 to-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "Company":
    "from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/30",
  "Student":
    "from-violet-500/20 to-purple-500/20 text-purple-300 border-purple-500/30",
};

/* ═══════════════════════════════════════════════════════════════════════════════ */
/*  Logo                                                                         */
/* ═══════════════════════════════════════════════════════════════════════════════ */
function TPCMSLogo({ collapsed }) {
  return (
    <div className="flex items-center gap-3 px-4 py-5 border-b border-orbit-border">
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-orbit-primary flex items-center justify-center glow-primary">
          <span className="text-white text-xs font-bold">T</span>
        </div>
      </div>
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <span className="text-slate-100 font-semibold text-lg tracking-tight whitespace-nowrap">
              TPCMS
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════ */
/*  Single menu item (with optional submenu)                                     */
/* ═══════════════════════════════════════════════════════════════════════════════ */
function MenuItem({
  item,
  collapsed,
  role,
  activeView,
  openMenu,
  toggleMenu,
  navigateTo,
  navigate,
  onNavClick,
}) {
  const Icon = item.icon;
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const isOpen = openMenu === item.title;

  // Check if this item or any submenu child is currently active
  const isActive = !hasSubmenu && activeView === viewMap[role]?.[item.title];
  const hasActiveChild =
    hasSubmenu &&
    item.submenu.some((sub) => activeView === viewMap[role]?.[sub]);

 const handleClick = () => {

  if (hasSubmenu) {

    toggleMenu(item.title);

    return;

  }

  navigateTo(item.title, item.path);

  onNavClick();

};

  return (
    <div>
      {/* Parent item */}
      <button
        onClick={handleClick}
        className={
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative " +
          (isActive || hasActiveChild
            ? "text-slate-100 bg-orbit-primary/15 shadow-sm"
            : "text-slate-400 hover:text-slate-200 hover:bg-white/5")
        }
      >
        {/* Active indicator bar */}
        {(isActive || hasActiveChild) && (
          <motion.div
            layoutId="nav-indicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-orbit-primary rounded-r-full"
          />
        )}

        <Icon size={20} className="flex-shrink-0" />

        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="truncate flex-1 text-left"
            >
              {item.title}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Chevron for expandable items */}
        {!collapsed && hasSubmenu && (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronDown size={14} className="text-slate-500" />
          </motion.div>
        )}
      </button>

      {/* Submenu */}
      <AnimatePresence>
        {!collapsed && hasSubmenu && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ml-5 mt-0.5 pl-3 border-l border-orbit-border/50 space-y-0.5">
              {item.submenu.map((sub) => {
                const subActive = activeView === viewMap[role]?.[sub];
                return (
                  <button
                    key={sub}
                    onClick={() => {
                      navigateTo(sub);
                      onNavClick();
                    }}
                    className={
                      "w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-[13px] transition-all duration-150 " +
                      (subActive
                        ? "text-slate-100 bg-orbit-primary/10 font-medium"
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5")
                    }
                  >
                    <div
                      className={
                        "w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-150 " +
                        (subActive
                          ? "bg-orbit-primary"
                          : "bg-slate-600 group-hover:bg-slate-500")
                      }
                    />
                    {sub}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════ */
/*  Sidebar                                                                      */
/* ═══════════════════════════════════════════════════════════════════════════════ */
export default function Sidebar({ role = "Super Admin" }) {
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, isMobile, mobileOpen, closeMobile } = useSidebar();

  // Get auth user from sessionStorage
  const auth = JSON.parse(localStorage.getItem("auth_user") || "{}");
  const user = auth?.user || {};

  // Derive the current ?view= value from URL
  const searchParams = new URLSearchParams(location.search);
  const activeView = searchParams.get("view");

  const effectiveCollapsed = collapsed && !isMobile;

  const navigateTo = (label, path = null) => {

  if (path) {
    navigate(path);
    return;
  }

  const view = viewMap[role]?.[label];

  if (view) {
    navigate(`${dashboardPaths[role]}?view=${view}`);
  }

};
  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const onNavClick = () => {
    if (isMobile) closeMobile();
  };

  const items = menuItems[role] || [];

  return (
    <motion.aside
      animate={{
        width: isMobile ? 256 : effectiveCollapsed ? 72 : 256,
        x: isMobile && !mobileOpen ? "-100%" : 0,
      }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-orbit-surface border-r border-orbit-border flex flex-col z-40 overflow-hidden"
    >
      <TPCMSLogo collapsed={effectiveCollapsed} />

      {/* Role badge */}
      <AnimatePresence>
        {!effectiveCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pt-3 pb-1"
          >
            <div
              className={
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-gradient-to-r " +
                (roleBadgeColors[role] || "text-slate-400 border-slate-600")
              }
            >
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {role}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 space-y-0.5 scrollbar-thin">
        {items.map((item) => (
          <MenuItem
            key={item.title}
            item={item}
            collapsed={effectiveCollapsed}
            role={role}
            activeView={activeView}
            openMenu={openMenu}
            toggleMenu={toggleMenu}
            navigateTo={navigateTo}
            onNavClick={onNavClick}
          />
        ))}
      </nav>

      {/* Bottom user section */}
      <div className="border-t border-orbit-border p-3">
        <div
          className={
            "flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors " +
            (effectiveCollapsed ? "justify-center" : "")
          }
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orbit-primary to-orbit-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {(user?.name || role).charAt(0).toUpperCase()}
          </div>
          <AnimatePresence>
            {!effectiveCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-slate-200 truncate">
                  {user?.name?.toUpperCase() || user?.role || "User"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.email || ""}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!effectiveCollapsed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => logout(navigate)}
                className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                title="Logout"
              >
                <LogOut size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
