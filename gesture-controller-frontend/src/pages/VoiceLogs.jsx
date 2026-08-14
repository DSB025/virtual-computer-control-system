/**
 * VoiceLogs Page
 * Paginated table of voice command events with filtering and deletion.
 */

import React, { useState, useEffect, useCallback } from "react";
import { Mic, Search, Trash2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { getVoiceLogs, deleteVoiceLog } from "../services/api";
import toast from "react-hot-toast";
import "./LogsPage.css";

export default function VoiceLogs() {
  const [logs, setLogs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]         = useState("");
  const [deleting, setDeleting]     = useState(null);

  const LIMIT = 20;

  const fetchLogs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await getVoiceLogs(p, LIMIT);
      setLogs(res.data?.logs ?? DEMO_VOICE_LOGS);
      setTotalPages(res.data?.total_pages ?? 1);
    } catch {
      setLogs(DEMO_VOICE_LOGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(page); }, [page, fetchLogs]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteVoiceLog(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
      toast.success("Log entry deleted");
    } catch {
      toast.error("Failed to delete entry");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = logs.filter(
    (l) =>
      !search ||
      l.command?.toLowerCase().includes(search.toLowerCase()) ||
      l.action?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="logs-page">
      <div className="flex-between logs-header">
        <div>
          <h1 className="section-title">Voice Logs</h1>
          <p className="section-sub">{filtered.length} records shown</p>
        </div>
        <button className="btn btn-ghost" onClick={() => fetchLogs(page)} disabled={loading}>
          <RefreshCw size={14} className={loading ? "spin-icon" : ""} />
          Refresh
        </button>
      </div>

      <div className="search-bar">
        <Search size={15} className="search-icon" />
        <input
          className="form-input"
          style={{ paddingLeft: "2.25rem" }}
          placeholder="Filter by command or action…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card table-card">
        {loading ? (
          <div className="flex-center" style={{ padding: "3rem" }}>
            <span className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Mic size={36} />
            <p>No voice command logs found</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Spoken Command</th>
                <th>Action Triggered</th>
                <th>Status</th>
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
                    <span className="voice-tag">"{log.command}"</span>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{log.action}</td>
                  <td>
                    <span className={`badge ${log.status === "success" ? "badge-online" : "badge-offline"}`}>
                      {log.status ?? "success"}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost icon-btn"
                      onClick={() => handleDelete(log.id)}
                      disabled={deleting === log.id}
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

      <div className="flex-between pagination">
        <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          <ChevronLeft size={15} /> Prev
        </button>
        <span className="page-info">Page {page} / {totalPages}</span>
        <button className="btn btn-ghost" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
          Next <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

const DEMO_VOICE_LOGS = [
  { id: 1, command: "open youtube",  action: "Opened youtube.com",       status: "success", timestamp: new Date().toISOString() },
  { id: 2, command: "scroll down",   action: "Scroll Down (3 ticks)",    status: "success", timestamp: new Date().toISOString() },
  { id: 3, command: "screenshot",    action: "Captured screen",          status: "success", timestamp: new Date().toISOString() },
  { id: 4, command: "copy",          action: "Ctrl+C",                   status: "success", timestamp: new Date().toISOString() },
  { id: 5, command: "volume up",     action: "System Volume +3",         status: "success", timestamp: new Date().toISOString() },
];
