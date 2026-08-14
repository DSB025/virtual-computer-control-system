/**
 * AppContext — global state for controller status, settings, and system info.
 * Consumed by any component via useApp() hook.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getControllerStatus, getSystemInfo, healthCheck } from "../services/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ─── Controller state ─────────────────────────────────────
  const [controllerRunning, setControllerRunning] = useState(false);
  const [controllerLoading, setControllerLoading] = useState(false);

  // ─── System info ──────────────────────────────────────────
  const [systemInfo, setSystemInfo] = useState(null);

  // ─── Backend connectivity ─────────────────────────────────
  const [backendOnline, setBackendOnline] = useState(false);

  // ─── Sidebar state ────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ─── Poll controller status every 3 seconds ───────────────
  const refreshStatus = useCallback(async () => {
    try {
      const res = await getControllerStatus();
      setControllerRunning(res.data?.running ?? false);
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    }
  }, []);

  // ─── Initial load ─────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        await healthCheck();
        setBackendOnline(true);
        const infoRes = await getSystemInfo();
        setSystemInfo(infoRes.data);
      } catch {
        setBackendOnline(false);
      }
    };
    init();

    // Poll status
    const interval = setInterval(refreshStatus, 3000);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  return (
    <AppContext.Provider
      value={{
        controllerRunning,
        setControllerRunning,
        controllerLoading,
        setControllerLoading,
        systemInfo,
        backendOnline,
        sidebarOpen,
        setSidebarOpen,
        refreshStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/** Custom hook for consuming AppContext */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
