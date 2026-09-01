import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Bell,
  ShieldAlert,
  Archive,
  LogOut,
} from "lucide-react";
import "./Sidebar.css";
import { NavLink } from "react-router-dom";

function Sidebar({ user, onLogout }) {
  const navItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      label: "Applications",
      icon: FileText,
      path: "/applications",
      roles: ["PROGRAM_OFFICER"],
    },
    {
      label: "My Reviews",
      icon: ClipboardCheck,
      path: "/reviews",
      roles: ["REVIEWER"],
    },
    {
      label: "Alerts",
      icon: Bell,
      path: "/alerts",
    },
    {
      label: "Conflicts",
      icon: ShieldAlert,
      path: "/conflicts",
      roles: ["REVIEWER"],
    },
    {
      label: "Archived",
      icon: Archive,
      path: "/archived",
      roles: ["PROGRAM_OFFICER"],
    },
  ];

  return (
    <aside className="sidebar">
      <div>
        {/* Brand */}
        <div className="brand">
          <div className="brand-icon">
            <ClipboardCheck size={26} />
          </div>

          <div>
            <h2>Grant Review</h2>
            <span>Application Management</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems
            .filter((item) => !item.roles || item.roles.includes(user?.role))
            .map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={20} />
                  <span>{item.label}</span>

                  {item.label === "Alerts" && (
                    <span className="alert-badge">!</span>
)}
                </NavLink>
              );
            })}
        </nav>
      </div>

      {/* User + Logout */}
      <div className="sidebar-bottom">
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="user-details">
            <strong>{user?.name || "User"}</strong>
            <span>
              {user?.role === "PROGRAM_OFFICER"
                ? "Program Officer"
                : "Reviewer"}
            </span>
          </div>
        </div>

        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
