/**
 * Settings Page
 * Configure all controller parameters:
 *   camera, smoothing, thresholds, voice, debug
 */

import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, RotateCcw, AlertTriangle } from "lucide-react";
import { getSettings, updateSettings, resetSettings } from "../services/api";
import toast from "react-hot-toast";
import "./Settings.css";

// ─── Default config (mirrors Python CONFIG) ───────────────────
const DEFAULT_SETTINGS = {
  camera_id:          0,
  frame_width:        720,
  frame_height:       540,
  smoothing:          0.65,
  click_pinch_thresh: 0.06,
  pinch_frames_req:   3,
  fist_frames_req:    4,
  scroll_sensitivity: 300,
  swipe_threshold:    0.22,
  swipe_time:         0.4,
  drag_threshold:     0.5,
  web_gesture_hold:   1.0,
  l_shape_angle:      55,
  voice_enabled:      true,
  tts_enabled:        true,
  debug_mode:         false,
};

export default function Settings() {
  const [config, setConfig]   = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);

  // Load settings from backend
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getSettings();
        setConfig({ ...DEFAULT_SETTINGS, ...res.data });
      } catch {
        // Use defaults if backend unavailable
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(config);
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset all settings to factory defaults?")) return;
    try {
      await resetSettings();
      setConfig(DEFAULT_SETTINGS);
      toast.success("Settings reset to defaults");
    } catch {
      setConfig(DEFAULT_SETTINGS);
      toast("Reset locally (backend offline)", { icon: "⚠️" });
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: "60vh" }}>
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="flex-between settings-header">
        <div>
          <h1 className="section-title">Settings</h1>
          <p className="section-sub">Configure controller parameters</p>
        </div>
        <div className="flex-gap">
          <button className="btn btn-ghost" onClick={handleReset}>
            <RotateCcw size={14} /> Reset
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Save size={14} />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="settings-grid">
        {/* ── Camera ──────────────────────────────────── */}
        <div className="card settings-card">
          <h2 className="settings-group-title">Camera</h2>
          <div className="settings-fields">
            <NumberField
              label="Camera ID"
              value={config.camera_id}
              min={0} max={5} step={1}
              hint="0 = default webcam"
              onChange={(v) => handleChange("camera_id", v)}
            />
            <NumberField
              label="Frame Width (px)"
              value={config.frame_width}
              min={320} max={1920} step={10}
              onChange={(v) => handleChange("frame_width", v)}
            />
            <NumberField
              label="Frame Height (px)"
              value={config.frame_height}
              min={240} max={1080} step={10}
              onChange={(v) => handleChange("frame_height", v)}
            />
          </div>
        </div>

        {/* ── Mouse / Gesture ──────────────────────── */}
        <div className="card settings-card">
          <h2 className="settings-group-title">Mouse & Gesture</h2>
          <div className="settings-fields">
            <SliderField
              label="Cursor Smoothing"
              value={config.smoothing}
              min={0.1} max={0.95} step={0.01}
              hint="Higher = smoother, slower response"
              onChange={(v) => handleChange("smoothing", v)}
            />
            <SliderField
              label="Click Pinch Threshold"
              value={config.click_pinch_thresh}
              min={0.02} max={0.15} step={0.005}
              hint="How close fingers must be for a pinch click"
              onChange={(v) => handleChange("click_pinch_thresh", v)}
            />
            <NumberField
              label="Pinch Frames Required"
              value={config.pinch_frames_req}
              min={1} max={10} step={1}
              hint="Frames held before click fires"
              onChange={(v) => handleChange("pinch_frames_req", v)}
            />
            <NumberField
              label="Fist Frames Required"
              value={config.fist_frames_req}
              min={1} max={10} step={1}
              onChange={(v) => handleChange("fist_frames_req", v)}
            />
            <NumberField
              label="Scroll Sensitivity"
              value={config.scroll_sensitivity}
              min={50} max={1000} step={10}
              onChange={(v) => handleChange("scroll_sensitivity", v)}
            />
          </div>
        </div>

        {/* ── Swipe / Drag ─────────────────────────── */}
        <div className="card settings-card">
          <h2 className="settings-group-title">Swipe & Drag</h2>
          <div className="settings-fields">
            <SliderField
              label="Swipe Threshold"
              value={config.swipe_threshold}
              min={0.05} max={0.5} step={0.01}
              hint="Minimum wrist movement to register swipe"
              onChange={(v) => handleChange("swipe_threshold", v)}
            />
            <SliderField
              label="Swipe Time Window (s)"
              value={config.swipe_time}
              min={0.1} max={1.5} step={0.05}
              onChange={(v) => handleChange("swipe_time", v)}
            />
            <SliderField
              label="Drag Hold Time (s)"
              value={config.drag_threshold}
              min={0.2} max={2.0} step={0.05}
              hint="Time to hold index-only before drag activates"
              onChange={(v) => handleChange("drag_threshold", v)}
            />
          </div>
        </div>

        {/* ── Web Gestures ─────────────────────────── */}
        <div className="card settings-card">
          <h2 className="settings-group-title">Web Gesture Hold</h2>
          <div className="settings-fields">
            <SliderField
              label="Web Gesture Hold (s)"
              value={config.web_gesture_hold}
              min={0.3} max={3.0} step={0.1}
              hint="Hold duration to trigger Google / YouTube / Wikipedia"
              onChange={(v) => handleChange("web_gesture_hold", v)}
            />
            <NumberField
              label="L-Shape Angle Threshold (°)"
              value={config.l_shape_angle}
              min={20} max={90} step={1}
              hint="Minimum angle for Thumb+Index L gesture"
              onChange={(v) => handleChange("l_shape_angle", v)}
            />
          </div>
        </div>

        {/* ── Voice & Debug ─────────────────────────── */}
        <div className="card settings-card">
          <h2 className="settings-group-title">Voice & Debug</h2>
          <div className="settings-fields">
            <ToggleField
              label="Voice Control Enabled"
              value={config.voice_enabled}
              hint="Enable SpeechRecognition listener"
              onChange={(v) => handleChange("voice_enabled", v)}
            />
            <ToggleField
              label="Text-to-Speech Feedback"
              value={config.tts_enabled}
              hint="Enable pyttsx3 spoken confirmations"
              onChange={(v) => handleChange("tts_enabled", v)}
            />
            <ToggleField
              label="Debug Mode"
              value={config.debug_mode}
              hint="Show landmark indices on camera feed"
              onChange={(v) => handleChange("debug_mode", v)}
            />
          </div>
        </div>
      </div>

      {/* Warning note */}
      <div className="settings-warning">
        <AlertTriangle size={15} />
        <p>Changes take effect on the next controller restart. Save and restart the controller to apply.</p>
      </div>
    </div>
  );
}

// ─── Field sub-components ─────────────────────────────────────

function SliderField({ label, value, min, max, step, hint, onChange }) {
  return (
    <div className="form-group settings-field">
      <div className="flex-between">
        <label className="form-label">{label}</label>
        <span className="field-val">{Number(value).toFixed(step < 0.1 ? 3 : step < 1 ? 2 : 0)}</span>
      </div>
      <input
        type="range"
        className="form-range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

function NumberField({ label, value, min, max, step, hint, onChange }) {
  return (
    <div className="form-group settings-field">
      <label className="form-label">{label}</label>
      <input
        type="number"
        className="form-input"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

function ToggleField({ label, value, hint, onChange }) {
  return (
    <div className="form-group settings-field">
      <div className="flex-between" style={{ alignItems: "center" }}>
        <div>
          <label className="form-label" style={{ marginBottom: 0 }}>{label}</label>
          {hint && <p className="field-hint" style={{ marginTop: "0.15rem" }}>{hint}</p>}
        </div>
        <button
          className={`toggle-btn ${value ? "on" : "off"}`}
          onClick={() => onChange(!value)}
          type="button"
        >
          <span className="toggle-thumb" />
        </button>
      </div>
    </div>
  );
}
