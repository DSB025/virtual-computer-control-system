/**
 * Sidebar — left navigation panel
 * Links: Home, Dashboard, Gesture Logs, Voice Logs, Settings
 */

import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home, LayoutDashboard, Hand, Mic, Settings,
  BookOpen, Info, ChevronRight,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import "./Sidebar.css";

const NAV_ITEMS = [
  { label: "Home",          path: "/",           icon: Home,            exact: true },
  { label: "Dashboard",     path: "/dashboard",  icon: LayoutDashboard },
  { label: "Gesture Logs",  path: "/gestures",   icon: Hand },
  { label: "Voice Logs",    path: "/voice",      icon: Mic },
  { label: "Settings",      path: "/settings",   icon: Settings },
];

const BOTTOM_ITEMS = [
  { label: "Gesture Guide", path: "/guide",  icon: BookOpen },
  { label: "About",         path: "/about",  icon: Info },
];

export default function Sidebar() {
  const { sidebarOpen, controllerRunning } = useApp();

  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      {/* Controller status indicator */}
      <div className="sidebar-status">
        <span className={`pulse-dot ${controllerRunning ? "green" : "orange"}`} />
        <span className="sidebar-status-text">
          {controllerRunning ? "Controller Active" : "Controller Idle"}
        </span>
      </div>

      <div className="divider" style={{ margin: "0.75rem 1rem" }} />

      {/* Main nav */}
      <nav className="sidebar-nav">
        <p className="nav-group-label">Navigation</p>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <item.icon size={17} className="nav-icon" />
            <span className="nav-label">{item.label}</span>
            <ChevronRight size={13} className="nav-arrow" />
          </NavLink>
        ))}
      </nav>

      <div className="divider" style={{ margin: "0.75rem 1rem" }} />

      {/* Bottom nav */}
      <nav className="sidebar-nav">
        <p className="nav-group-label">Resources</p>
        {BOTTOM_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <item.icon size={17} className="nav-icon" />
            <span className="nav-label">{item.label}</span>
            <ChevronRight size={13} className="nav-arrow" />
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <span className="sidebar-footer-text">MediaPipe · OpenCV · PyAutoGUI</span>
      </div>
    </aside>
  );
}
