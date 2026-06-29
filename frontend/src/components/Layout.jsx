import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSettings } from "../context/SettingsContext.jsx";
import {
  LayoutDashboard,
  Receipt,
  ClipboardList,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  UserCog,
  DatabaseBackup,
  LogOut,
  Search,
  Bell,
} from "lucide-react";

export default function Layout() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();

  const getLogoSrc = (logoUrl) => {
    if (!logoUrl) return null;
    if (logoUrl.startsWith("data:") || logoUrl.startsWith("http")) {
      return logoUrl;
    }
    return `http://localhost:5000${logoUrl}`;
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          {settings?.logoUrl ? (
            <img src={getLogoSrc(settings.logoUrl)} alt="logo" />
          ) : (
            <div
              style={{
                width: 38,
                height: 38,
                background: "var(--primary-light)",
                borderRadius: 8,
              }}
            />
          )}
          <div className="name">
            {settings?.hospitalName || "K.V.S. HOSPITAL"}
          </div>
        </div>

        <nav>
          <NavLink to="/" end>
            <LayoutDashboard /> Dashboard
          </NavLink>
          <NavLink to="/invoices">
            <Receipt /> Billing / Invoices
          </NavLink>
          <NavLink to="/bills">
            <ClipboardList style={{ color: "inherit" }} /> Hospital Bills
          </NavLink>
          <NavLink to="/discharge-summaries">
            <ClipboardList /> Discharge Summaries
          </NavLink>
          <NavLink to="/patients">
            <Users /> Patients
          </NavLink>
          <NavLink to="/reports">
            <BarChart3 /> Reports
          </NavLink>
          <NavLink to="/settings">
            <SettingsIcon /> Hospital Settings
          </NavLink>
          <NavLink to="/users">
            <UserCog /> Users
          </NavLink>
          <NavLink to="/backup">
            <DatabaseBackup /> Backup &amp; Restore
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-search">
            <Search size={16} />
            <input placeholder="Search patients, invoices, summaries..." />
          </div>
          <div className="topbar-icons">
            <div className="bell-wrap">
              <Bell size={20} />
              <span className="bell-dot" />
            </div>
            <div className="user-chip">
              <div className="user-avatar">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <span>{user?.name || "Hospital Admin"}</span>
            </div>
          </div>
        </header>
        <div className="page-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
}