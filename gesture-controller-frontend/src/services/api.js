/**
 * ============================================================
 *  API SERVICE — Gesture + Voice Controller
 *  All backend communication is centralised here.
 *  Swap BASE_URL for your actual Python server address.
 * ============================================================
 */

import axios from "axios";

// ─── BASE URL ────────────────────────────────────────────────
// Change this to match your Python backend (e.g. FastAPI / Flask)
export const BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000";

// ─── AXIOS INSTANCE ──────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── REQUEST INTERCEPTOR (attach auth token if present) ──────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR (global error handling) ────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ════════════════════════════════════════════════════════════
//  CONTROLLER ENDPOINTS
//  Replace placeholder paths with your actual Python routes
// ════════════════════════════════════════════════════════════

/** Start the gesture + voice controller process */
export const startController = () => api.post("/api/controller/start");

/** Stop the running controller */
export const stopController = () => api.post("/api/controller/stop");

/** Fetch current controller status */
export const getControllerStatus = () => api.get("/api/controller/status");

// ─── GESTURE LOGS ────────────────────────────────────────────

/** Get paginated gesture event log
 *  @param {number} page - page number (1-indexed)
 *  @param {number} limit - records per page
 */
export const getGestureLogs = (page = 1, limit = 20) =>
  api.get("/api/gestures/logs", { params: { page, limit } });

/** Get gesture usage statistics */
export const getGestureStats = () => api.get("/api/gestures/stats");

/** Delete a specific gesture log entry */
export const deleteGestureLog = (id) => api.delete(`/api/gestures/logs/${id}`);

// ─── VOICE COMMAND LOGS ──────────────────────────────────────

/** Get paginated voice command log */
export const getVoiceLogs = (page = 1, limit = 20) =>
  api.get("/api/voice/logs", { params: { page, limit } });

/** Get voice command usage statistics */
export const getVoiceStats = () => api.get("/api/voice/stats");

/** Delete a specific voice log entry */
export const deleteVoiceLog = (id) => api.delete(`/api/voice/logs/${id}`);

// ─── SETTINGS ────────────────────────────────────────────────

/** Fetch current controller settings/config */
export const getSettings = () => api.get("/api/settings");

/** Update controller settings
 *  @param {object} settings - key-value config pairs
 */
export const updateSettings = (settings) =>
  api.put("/api/settings", settings);

/** Reset settings to factory defaults */
export const resetSettings = () => api.post("/api/settings/reset");

// ─── SYSTEM / HEALTH ─────────────────────────────────────────

/** Ping the backend — used for health checks */
export const healthCheck = () => api.get("/api/health");

/** Get system info (camera, mic availability, platform) */
export const getSystemInfo = () => api.get("/api/system/info");

export default api;
