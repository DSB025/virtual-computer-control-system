/**
 * Dashboard Page
 * Shows live stats, gesture/voice usage charts, recent logs,
 * and system information cards.
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  Hand, Mic, Activity, Cpu,
  RefreshCw, TrendingUp, Clock, Zap,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import {
  getGestureStats, getVoiceStats, getGestureLogs,
  getVoiceLogs, getSystemInfo,
} from "../services/api";
import { useApp } from "../context/AppContext";
import "./Dashboard.css";

// ─── Placeholder data (used when backend is offline) ──────────
const PLACEHOLDER_GESTURE_STATS = [
  { name: "Open Palm", count: 142 },
  { name: "Pinch",     count: 98  },
  { name: "Fist",      count: 54  },
  { name: "Peace",     count: 37  },
  { name: "Rock",      count: 29  },
  { name: "OK",        count: 21  },
];

const PLACEHOLDER_VOICE_STATS = [
  { name: "scroll up",   count: 77 },
  { name: "click",       count: 61 },
  { name: "open youtube",count: 45 },
  { name: "copy",        count: 32 },
  { name: "screenshot",  count: 18 },
];

const PLACEHOLDER_TIMELINE = Array.from({ length: 10 }, (_, i) => ({
  time: `${i + 8}:00`,
  gestures: Math.floor(Math.random() * 60 + 10),
  voice:    Math.floor(Math.random() * 30 + 5),
}));

const PIE_COLORS = [
  "var(--accent-cyan)", "var(--accent-green)", "var(--accent-orange)",
  "var(--accent-purple)", "var(--accent-yellow)", "#f472b6",
];

// ─── Custom tooltip for recharts ──────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────
export default function Dashboard() {
  const { controllerRunning, backendOnline, systemInfo } = useApp();

  const [loading, setLoading]               = useState(true);
  const [gestureStats, setGestureStats]     = useState([]);
  const [voiceStats, setVoiceStats]         = useState([]);
  const [recentGestures, setRecentGestures] = useState([]);
  const [recentVoice, setRecentVoice]       = useState([]);
  const [timeline, setTimeline]             = useState([]);
  const [lastRefresh, setLastRefresh]       = useState(null);

  // ─── Fetch all dashboard data ──────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [gStats, vStats, gLogs, vLogs] = await Promise.all([
        getGestureStats(),
        getVoiceStats(),
        getGestureLogs(1, 5),
        getVoiceLogs(1, 5),
      ]);
      setGestureStats(gStats.data?.stats ?? PLACEHOLDER_GESTURE_STATS);
      setVoiceStats(vStats.data?.stats ?? PLACEHOLDER_VOICE_STATS);
      setRecentGestures(gLogs.data?.logs ?? []);
      setRecentVoice(vLogs.data?.logs ?? []);
      setTimeline(gStats.data?.timeline ?? PLACEHOLDER_TIMELINE);
    } catch {
      // Backend offline — show placeholder data
      setGestureStats(PLACEHOLDER_GESTURE_STATS);
      setVoiceStats(PLACEHOLDER_VOICE_STATS);
      setTimeline(PLACEHOLDER_TIMELINE);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [fetchAll]);

  // ─── Derived totals ────────────────────────────────────────
  const totalGestures = gestureStats.reduce((s, g) => s + g.count, 0);
  const totalVoice    = voiceStats.reduce((s, v) => s + v.count, 0);
  const topGesture    = gestureStats[0]?.name ?? "—";

  return (
    <div className="dashboard-page">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex-between dash-header">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-sub">
            {lastRefresh
              ? `Last updated ${lastRefresh.toLocaleTimeString()}`
              : "Loading…"}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={fetchAll} disabled={loading}>
          <RefreshCw size={14} className={loading ? "spin-icon" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Stat Cards ────────────────────────────────────── */}
      <div className="grid-4">
        <div className="stat-card">
          <div className="stat-icon cyan"><Hand size={20} /></div>
          <div>
            <p className="stat-label">Total Gestures</p>
            <p className="stat-value">{totalGestures.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><Mic size={20} /></div>
          <div>
            <p className="stat-label">Voice Commands</p>
            <p className="stat-value">{totalVoice.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange"><TrendingUp size={20} /></div>
          <div>
            <p className="stat-label">Top Gesture</p>
            <p className="stat-value" style={{ fontSize: "1.1rem" }}>{topGesture}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Activity size={20} />
          </div>
          <div>
            <p className="stat-label">Status</p>
            <p className="stat-value" style={{ fontSize: "1.1rem" }}>
              {controllerRunning ? "🟢 Running" : "🔴 Stopped"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Timeline Chart ─────────────────────────────────── */}
      <div className="card">
        <p className="card-chart-title">
          <Zap size={15} style={{ color: "var(--accent-cyan)" }} />
          Activity Timeline (Today)
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={timeline} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="time" tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "Space Mono" }} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "Space Mono" }} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="gestures" stroke="var(--accent-cyan)"   strokeWidth={2} dot={false} name="Gestures" />
            <Line type="monotone" dataKey="voice"    stroke="var(--accent-green)"  strokeWidth={2} dot={false} name="Voice" />
          </LineChart>
        </ResponsiveContainer>
        <div className="chart-legend">
          <span style={{ color: "var(--accent-cyan)" }}>● Gestures</span>
          <span style={{ color: "var(--accent-green)" }}>● Voice Commands</span>
        </div>
      </div>

      {/* ── Gesture + Voice Bar Charts ─────────────────────── */}
      <div className="grid-2">
        {/* Gesture bar */}
        <div className="card">
          <p className="card-chart-title">
            <Hand size={15} style={{ color: "var(--accent-cyan)" }} />
            Top Gestures
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={gestureStats.slice(0, 6)} layout="vertical" margin={{ left: 60, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "Space Mono" }} />
              <YAxis dataKey="name" type="category" tick={{ fill: "var(--text-secondary)", fontSize: 11, fontFamily: "Space Mono" }} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="var(--accent-cyan)" radius={[0,4,4,0]} name="Uses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Voice pie chart */}
        <div className="card">
          <p className="card-chart-title">
            <Mic size={15} style={{ color: "var(--accent-green)" }} />
            Voice Command Distribution
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={voiceStats}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {voiceStats.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {voiceStats.slice(0, 4).map((v, i) => (
              <span key={v.name} className="pie-legend-item">
                <span style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} className="pie-dot" />
                {v.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Activity Tables ─────────────────────────── */}
      <div className="grid-2">
        {/* Recent gestures */}
        <div className="card">
          <p className="card-chart-title">
            <Clock size={14} style={{ color: "var(--accent-cyan)" }} />
            Recent Gestures
          </p>
          {recentGestures.length === 0 ? (
            <div className="empty-state">
              <Hand size={32} />
              <p>No gesture events yet</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Gesture</th>
                  <th>Action</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentGestures.map((g, i) => (
                  <tr key={g.id ?? i}>
                    <td>{g.gesture}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{g.action}</td>
                    <td style={{ color: "var(--text-muted)" }}>
                      {g.timestamp ? new Date(g.timestamp).toLocaleTimeString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent voice */}
        <div className="card">
          <p className="card-chart-title">
            <Clock size={14} style={{ color: "var(--accent-green)" }} />
            Recent Voice Commands
          </p>
          {recentVoice.length === 0 ? (
            <div className="empty-state">
              <Mic size={32} />
              <p>No voice commands yet</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Command</th>
                  <th>Action</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentVoice.map((v, i) => (
                  <tr key={v.id ?? i}>
                    <td style={{ color: "var(--accent-green)" }}>"{v.command}"</td>
                    <td style={{ color: "var(--text-secondary)" }}>{v.action}</td>
                    <td style={{ color: "var(--text-muted)" }}>
                      {v.timestamp ? new Date(v.timestamp).toLocaleTimeString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── System Info ────────────────────────────────────── */}
      {systemInfo && (
        <div className="card">
          <p className="card-chart-title">
            <Cpu size={14} style={{ color: "var(--accent-purple)" }} />
            System Information
          </p>
          <div className="sys-info-grid">
            {Object.entries(systemInfo).map(([key, val]) => (
              <div key={key} className="sys-info-item">
                <span className="sys-key">{key}</span>
                <span className="sys-val">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
