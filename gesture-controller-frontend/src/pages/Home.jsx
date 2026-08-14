/**
 * Home Page
 * Landing page with project overview, quick-start instructions,
 * gesture reference cards, and voice command reference.
 */

import React from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Github, ExternalLink } from "lucide-react";
import { useApp } from "../context/AppContext";
import "./Home.css";

// ─── Static data ──────────────────────────────────────────────
const GESTURES = [
  { emoji: "✋", name: "Open Palm",            action: "Move Mouse Cursor",         color: "cyan" },
  { emoji: "🤏", name: "Pinch",               action: "Left Click",                color: "green" },
  { emoji: "✊", name: "Fist",                action: "Right Click",               color: "orange" },
  { emoji: "☝️",  name: "Index + Middle Up",  action: "Scroll (up/down)",          color: "cyan" },
  { emoji: "👆", name: "Index Only Up",       action: "Drag Mode",                 color: "purple" },
  { emoji: "🤙", name: "Pinky + Thumb Out",   action: "Double Click",              color: "green" },
  { emoji: "🤞", name: "Index + Middle Cross", action: "Screenshot",              color: "orange" },
  { emoji: "👌", name: "OK Gesture",          action: "Press Enter",               color: "cyan" },
  { emoji: "🌐", name: "Three Fingers Up",    action: "Open Google (hold 1s)",     color: "green" },
  { emoji: "🎬", name: "Four Fingers Up",     action: "Open YouTube (hold 1s)",    color: "orange" },
  { emoji: "📖", name: "Thumb + Index L-shape", action: "Open Wikipedia (hold 1s)", color: "purple" },
  { emoji: "❌", name: "Five Fingers + Shake", action: "Close Active Tab",         color: "orange" },
  { emoji: "✌️",  name: "Peace Sign",         action: "Volume Up",                 color: "cyan" },
  { emoji: "🤘", name: "Rock Sign",           action: "Volume Down",               color: "green" },
  { emoji: "🖖", name: "Spock Hand",          action: "Open App Launcher",         color: "purple" },
  { emoji: "🖐️",  name: "Swipe Left/Right",  action: "Previous / Next Slide",     color: "cyan" },
];

const VOICE_COMMANDS = [
  { group: "Web",     cmds: ["open youtube", "open google", "open wikipedia", "open gmail", "search [query]", "go to [site]"] },
  { group: "Browser", cmds: ["open browser", "close window", "close tab", "new tab", "next tab", "go back", "refresh", "zoom in", "zoom out"] },
  { group: "Mouse",   cmds: ["click", "right click", "double click", "scroll up", "scroll down", "screenshot", "copy", "paste", "undo"] },
  { group: "System",  cmds: ["maximize", "minimize", "volume up", "volume down", "mute", "next slide", "previous slide", "stop"] },
];

const COLOR_MAP = {
  cyan:   { bg: "rgba(0,229,255,0.07)",  border: "rgba(0,229,255,0.18)",  text: "var(--accent-cyan)"   },
  green:  { bg: "rgba(0,255,136,0.07)",  border: "rgba(0,255,136,0.18)",  text: "var(--accent-green)"  },
  orange: { bg: "rgba(255,107,53,0.07)", border: "rgba(255,107,53,0.18)", text: "var(--accent-orange)" },
  purple: { bg: "rgba(168,85,247,0.07)", border: "rgba(168,85,247,0.18)", text: "var(--accent-purple)" },
};

// ─── Component ────────────────────────────────────────────────
export default function Home() {
  const { controllerRunning, backendOnline } = useApp();

  return (
    <div className="home-page">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-badge badge badge-cyan">
          <span className="pulse-dot green" />
          Final Year Project — AI Human–Computer Interaction
        </div>

        <h1 className="hero-title">
          Hand Gesture<br />
          <span className="hero-accent">+ Voice Command</span><br />
          Controller
        </h1>

        <p className="hero-sub">
          Control your computer in real time using hand gestures detected via MediaPipe
          and natural voice commands via SpeechRecognition — no mouse, no keyboard.
        </p>

        <div className="hero-tech">
          {["MediaPipe", "OpenCV", "PyAutoGUI", "SpeechRecognition", "pyttsx3"].map((t) => (
            <span key={t} className="tech-pill">{t}</span>
          ))}
        </div>

        <div className="hero-actions">
          <Link to="/dashboard" className="btn btn-primary btn-lg">
            <LayoutDashboard size={16} />
            Go to Dashboard
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost btn-lg"
          >
            <Github size={16} />
            View Source
          </a>
        </div>

        {/* System status mini-row */}
        <div className="hero-status-row">
          <div className={`status-chip ${backendOnline ? "ok" : "err"}`}>
            Backend {backendOnline ? "Online" : "Offline"}
          </div>
          <div className={`status-chip ${controllerRunning ? "ok" : "idle"}`}>
            Controller {controllerRunning ? "Running" : "Stopped"}
          </div>
        </div>
      </section>

      {/* ── Gesture Reference ─────────────────────────────── */}
      <section className="ref-section">
        <div className="flex-between" style={{ marginBottom: "1.25rem" }}>
          <div>
            <h2 className="section-title">Gesture Reference</h2>
            <p className="section-sub">{GESTURES.length} gestures supported</p>
          </div>
          <Link to="/gestures" className="btn btn-ghost" style={{ fontSize: "0.78rem" }}>
            View Logs <ExternalLink size={13} />
          </Link>
        </div>

        <div className="gesture-grid">
          {GESTURES.map((g) => {
            const c = COLOR_MAP[g.color];
            return (
              <div
                key={g.name}
                className="gesture-card"
                style={{ background: c.bg, borderColor: c.border }}
              >
                <span className="gesture-emoji">{g.emoji}</span>
                <div className="gesture-info">
                  <p className="gesture-name" style={{ color: c.text }}>{g.name}</p>
                  <p className="gesture-action">{g.action}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Voice Commands ────────────────────────────────── */}
      <section className="ref-section">
        <div className="flex-between" style={{ marginBottom: "1.25rem" }}>
          <div>
            <h2 className="section-title">Voice Commands</h2>
            <p className="section-sub">Speak naturally — always on while running</p>
          </div>
          <Link to="/voice" className="btn btn-ghost" style={{ fontSize: "0.78rem" }}>
            View Logs <ExternalLink size={13} />
          </Link>
        </div>

        <div className="grid-2">
          {VOICE_COMMANDS.map((group) => (
            <div key={group.group} className="card">
              <p className="voice-group-label">{group.group}</p>
              <div className="voice-cmd-list">
                {group.cmds.map((cmd) => (
                  <span key={cmd} className="voice-cmd-chip">{cmd}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quick Start ───────────────────────────────────── */}
      <section className="ref-section">
        <h2 className="section-title" style={{ marginBottom: "1.25rem" }}>Quick Start</h2>
        <div className="steps-list card">
          {[
            { n: "01", title: "Install Dependencies", desc: "pip install mediapipe opencv-python pyautogui SpeechRecognition pyttsx3 pyaudio keyboard" },
            { n: "02", title: "Start the Python Backend", desc: "Run the Flask / FastAPI server that wraps gesture_voice_controller_v3.py" },
            { n: "03", title: "Start This Frontend", desc: "npm install && npm start — then open http://localhost:3000" },
            { n: "04", title: "Click Start Controller", desc: "Hit the green button in the navbar to launch the gesture + voice engine" },
            { n: "05", title: "Use Your Hands & Voice", desc: "Show gestures in front of the webcam or speak commands clearly" },
          ].map((step) => (
            <div key={step.n} className="step-row">
              <span className="step-num">{step.n}</span>
              <div>
                <p className="step-title">{step.title}</p>
                <p className="step-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
