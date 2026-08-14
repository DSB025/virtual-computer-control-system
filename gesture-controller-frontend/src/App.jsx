/**
 * App.jsx — Root component
 * Sets up routing, context providers, and the shell layout
 */

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AppProvider, useApp } from "./context/AppContext";
import Navbar   from "./components/Navbar";
import Sidebar  from "./components/Sidebar";
import Footer   from "./components/Footer";

// ─── Pages ───────────────────────────────────────────────────
import Home        from "./pages/Home";
import Dashboard   from "./pages/Dashboard";
import GestureLogs from "./pages/GestureLogs";
import VoiceLogs   from "./pages/VoiceLogs";
import Settings    from "./pages/Settings";
import Guide       from "./pages/Guide";
import About       from "./pages/About";

function AppShell() {
  const { sidebarOpen } = useApp();

  return (
    <div className="app-shell">
      <Sidebar />

      <div className={`main-content ${sidebarOpen ? "" : "sidebar-closed"}`}>
        <Navbar />

        <main className="page-body">
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/gestures"  element={<GestureLogs />} />
            <Route path="/voice"     element={<VoiceLogs />} />
            <Route path="/settings"  element={<Settings />} />
            <Route path="/guide"     element={<Guide />} />
            <Route path="/about"     element={<About />} />
            {/* 404 fallback */}
            <Route path="*" element={
              <div className="empty-state" style={{ height: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontSize: "4rem" }}>404</p>
                <p>Page not found</p>
              </div>
            } />
          </Routes>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell />

        {/* Toast notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--bg-elevated)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-subtle)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.82rem",
            },
            success: { iconTheme: { primary: "var(--accent-green)", secondary: "var(--bg-base)" } },
            error:   { iconTheme: { primary: "var(--accent-orange)", secondary: "var(--bg-base)" } },
          }}
        />
      </AppProvider>
    </BrowserRouter>
  );
}
