/**
 * GestureLogs Page
 * Full paginated table of gesture events.
 * Supports filtering by gesture name and deletion.
 */

import React, { useState, useEffect, useCallback } from "react";
import { Hand, Search, Trash2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { getGestureLogs, deleteGestureLog } from "../services/api";
import toast from "react-hot-toast";
import "./LogsPage.css";

export default function GestureLogs() {
  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]       = useState("");
  const [deleting, setDeleting]   = useState(null);

  const LIMIT = 20;

  const fetchLogs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await getGestureLogs(p, LIMIT);
      setLogs(res.data?.logs ?? DEMO_LOGS);
      setTotalPages(res.data?.total_pages ?? 1);
    } catch {
      // Fallback demo data when backend is offline
      setLogs(DEMO_LOGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(page);
  }, [page, fetchLogs]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteGestureLog(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
      toast.success("Log entry deleted");
    } catch {
      toast.error("Failed to delete entry");
    } finally {
      setDeleting(null);
    }
  };

  // Client-side filter
  const filtered = logs.filter(
    (l) =>
      !search ||
      l.gesture?.toLowerCase().includes(search.toLowerCase()) ||
      l.action?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="logs-page">
      {/* Header */}
      <div className="flex-between logs-header">
        <div>
          <h1 className="section-title">Gesture Logs</h1>
          <p className="section-sub">{filtered.length} records shown</p>
        </div>
        <button className="btn btn-ghost" onClick={() => fetchLogs(page)} disabled={loading}>
          <RefreshCw size={14} className={loading ? "spin-icon" : ""} />
          Refresh
        </button>
      </div>

      {/* Search bar */}
      <div className="search-bar">
        <Search size={15} className="search-icon" />
        <input
          className="form-input"
          style={{ paddingLeft: "2.25rem" }}
          placeholder="Filter by gesture or action…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card table-card">
        {loading ? (
          <div className="flex-center" style={{ padding: "3rem" }}>
            <span className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Hand size={36} />
            <p>No gesture logs found</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Gesture</th>
                <th>Action Triggered</th>
                <th>Confidence</th>
                <th>Timestamp</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, i) => (
                <tr key={log.id ?? i}>
                  <td style={{ color: "var(--text-muted)" }}>
                    {(page - 1) * LIMIT + i + 1}
                  </td>
                  <td>
                    <span className="gesture-tag">{log.gesture}</span>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{log.action}</td>
                  <td>
                    {log.confidence != null ? (
                      <ConfidenceBar value={log.confidence} />
                    ) : "—"}
                  </td>
                  <td style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost icon-btn"
                      onClick={() => handleDelete(log.id)}
                      disabled={deleting === log.id}
                      title="Delete entry"
                    >
                      {deleting === log.id
                        ? <span className="spinner" style={{ width: 13, height: 13 }} />
                        : <Trash2 size={14} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex-between pagination">
        <button
          className="btn btn-ghost"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          <ChevronLeft size={15} /> Prev
        </button>
        <span className="page-info">Page {page} / {totalPages}</span>
        <button
          className="btn btn-ghost"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Confidence bar sub-component ────────────────────────────
function ConfidenceBar({ value }) {
  const pct = Math.round(value * 100);
  const color = pct > 80 ? "var(--accent-green)"
    : pct > 50 ? "var(--accent-yellow)"
    : "var(--accent-orange)";
  return (
    <div className="conf-bar-wrap">
      <div className="conf-bar-bg">
        <div className="conf-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="conf-label" style={{ color }}>{pct}%</span>
    </div>
  );
}

// ─── Demo data for offline/dev mode ──────────────────────────
const DEMO_LOGS = [
  { id: 1, gesture: "Open Palm",   action: "Move Cursor",    confidence: 0.96, timestamp: new Date().toISOString() },
  { id: 2, gesture: "Pinch",       action: "Left Click",     confidence: 0.91, timestamp: new Date().toISOString() },
  { id: 3, gesture: "Fist",        action: "Right Click",    confidence: 0.88, timestamp: new Date().toISOString() },
  { id: 4, gesture: "Peace Sign",  action: "Volume Up",      confidence: 0.79, timestamp: new Date().toISOString() },
  { id: 5, gesture: "Three Fingers",action:"Open Google",    confidence: 0.93, timestamp: new Date().toISOString() },
];
