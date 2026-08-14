/**
 * Navbar — top navigation bar
 * Shows backend status, controller toggle, and sidebar toggle
 */

import React from "react";
import { Menu, X, Radio, Wifi, WifiOff, Activity } from "lucide-react";
import { useApp } from "../context/AppContext";
import { startController, stopController } from "../services/api";
import toast from "react-hot-toast";
import "./Navbar.css";

export default function Navbar() {
  const {
    controllerRunning,
    setControllerRunning,
    controllerLoading,
    setControllerLoading,
    backendOnline,
    sidebarOpen,
    setSidebarOpen,
  } = useApp();

  const handleToggleController = async () => {
    setControllerLoading(true);
    try {
      if (controllerRunning) {
        await stopController();
        setControllerRunning(false);
        toast.success("Controller stopped");
      } else {
        await startController();
        setControllerRunning(true);
        toast.success("Controller started");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to toggle controller");
    } finally {
      setControllerLoading(false);
    }
  };

  return (
    <nav className="navbar">
      {/* Left: sidebar toggle + brand */}
      <div className="navbar-left">
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="navbar-brand">
          <span className="brand-icon">✋</span>
          <span className="brand-name">GestureCtrl</span>
          <span className="brand-version">v3.0</span>
        </div>
      </div>

      {/* Right: status + controller button */}
      <div className="navbar-right">
        {/* Backend status pill */}
        <div className={`status-pill ${backendOnline ? "online" : "offline"}`}>
          {backendOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          {backendOnline ? "Backend Online" : "Backend Offline"}
        </div>

        {/* Controller toggle */}
        <button
          className={`btn ${controllerRunning ? "btn-danger" : "btn-success"}`}
          onClick={handleToggleController}
          disabled={controllerLoading || !backendOnline}
        >
          {controllerLoading ? (
            <span className="spinner" style={{ width: 14, height: 14 }} />
          ) : controllerRunning ? (
            <X size={15} />
          ) : (
            <Radio size={15} />
          )}
          {controllerRunning ? "Stop Controller" : "Start Controller"}
        </button>

        {/* Live indicator */}
        {controllerRunning && (
          <div className="live-badge">
            <Activity size={13} />
            LIVE
          </div>
        )}
      </div>
    </nav>
  );
}
