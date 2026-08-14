/**
 * Guide Page — full reference for all gestures and voice commands
 */

import React, { useState } from "react";
import "./Guide.css";

const TABS = ["Gestures", "Voice Commands", "Keyboard Shortcuts"];

const GESTURE_SECTIONS = [
  {
    title: "Mouse Control",
    color: "cyan",
    items: [
      { emoji: "✋", name: "Open Palm",     desc: "Move the mouse cursor. Hand position maps to screen position." },
      { emoji: "🤏", name: "Pinch",         desc: "Left click. Bring index fingertip close to thumb tip." },
      { emoji: "✊", name: "Fist",           desc: "Right click. Close all fingers into a fist." },
      { emoji: "🤙", name: "Pinky + Thumb", desc: "Double click. Extend pinky and thumb, fold others." },
      { emoji: "👆", name: "Index Only Up", desc: "Drag mode. Hold for 0.5s to lock left mouse button down." },
    ],
  },
  {
    title: "Scroll & Navigation",
    color: "green",
    items: [
      { emoji: "☝️",  name: "Index + Middle Up", desc: "Scroll mode. Move hand up to scroll up, down to scroll down." },
      { emoji: "🖐️",  name: "Swipe Left",        desc: "Left arrow key. Swipe wrist quickly to the left." },
      { emoji: "🖐️",  name: "Swipe Right",       desc: "Right arrow key. Swipe wrist quickly to the right." },
    ],
  },
  {
    title: "Web Gestures (Hold 1s)",
    color: "orange",
    items: [
      { emoji: "🌐", name: "Three Fingers Up",    desc: "Open Google. Index + Middle + Ring up, hold 1 second." },
      { emoji: "🎬", name: "Four Fingers Up",     desc: "Open YouTube. All fingers except thumb up, hold 1 second." },
      { emoji: "📖", name: "L-Shape",             desc: "Open Wikipedia. Thumb + Index spread at wide angle, hold 1 second." },
      { emoji: "❌", name: "Five Fingers + Shake", desc: "Close active tab. All 5 fingers up + shake wrist horizontally." },
    ],
  },
  {
    title: "Media & System",
    color: "purple",
    items: [
      { emoji: "✌️",  name: "Peace Sign",  desc: "Volume Up (×3). Index + Middle up, others folded." },
      { emoji: "🤘", name: "Rock Sign",    desc: "Volume Down (×3). Index + Pinky up, others folded." },
      { emoji: "🖖", name: "Spock Hand",   desc: "Open App Launcher (Super key). Split fingers in Vulcan salute." },
    ],
  },
  {
    title: "Screenshot",
    color: "cyan",
    items: [
      { emoji: "🤞", name: "Index + Middle Cross", desc: "Take a screenshot. Cross index and middle fingers." },
      { emoji: "👌", name: "OK Gesture",            desc: "Press Enter. Touch thumb tip to middle fingertip." },
    ],
  },
];

const VOICE_SECTIONS = [
  {
    group: "Web Shortcuts",
    cmds: [
      { cmd: "open youtube",       action: "Opens youtube.com in browser" },
      { cmd: "close youtube",      action: "Closes active tab (if YouTube)" },
      { cmd: "open google",        action: "Opens google.com" },
      { cmd: "open wikipedia",     action: "Opens wikipedia.org" },
      { cmd: "open gmail",         action: "Opens Gmail" },
      { cmd: "search [query]",     action: "Google search for spoken query" },
      { cmd: "go to [site]",       action: "Navigate to website by name" },
    ],
  },
  {
    group: "Browser Controls",
    cmds: [
      { cmd: "open browser",   action: "Open default browser" },
      { cmd: "close window",   action: "Alt+F4" },
      { cmd: "close tab",      action: "Ctrl+W" },
      { cmd: "new tab",        action: "Ctrl+T" },
      { cmd: "next tab",       action: "Ctrl+Tab" },
      { cmd: "previous tab",   action: "Ctrl+Shift+Tab" },
      { cmd: "go back",        action: "Alt+Left" },
      { cmd: "go forward",     action: "Alt+Right" },
      { cmd: "refresh",        action: "F5" },
      { cmd: "zoom in",        action: "Ctrl++" },
      { cmd: "zoom out",       action: "Ctrl+-" },
    ],
  },
  {
    group: "Mouse / Keyboard",
    cmds: [
      { cmd: "click",         action: "Left click" },
      { cmd: "right click",   action: "Right click" },
      { cmd: "double click",  action: "Double click" },
      { cmd: "scroll up",     action: "Scroll up" },
      { cmd: "scroll down",   action: "Scroll down" },
      { cmd: "screenshot",    action: "Take screenshot" },
      { cmd: "copy",          action: "Ctrl+C" },
      { cmd: "paste",         action: "Ctrl+V" },
      { cmd: "undo",          action: "Ctrl+Z" },
      { cmd: "select all",    action: "Ctrl+A" },
      { cmd: "press escape",  action: "Escape key" },
    ],
  },
  {
    group: "System",
    cmds: [
      { cmd: "maximize",       action: "Win+Up Arrow" },
      { cmd: "minimize",       action: "Win+Down Arrow" },
      { cmd: "volume up",      action: "System volume up" },
      { cmd: "volume down",    action: "System volume down" },
      { cmd: "mute",           action: "System mute" },
      { cmd: "next slide",     action: "Right Arrow" },
      { cmd: "previous slide", action: "Left Arrow" },
      { cmd: "stop",           action: "Stop voice listener" },
    ],
  },
];

const KB_SHORTCUTS = [
  { key: "Q",   action: "Quit / stop controller window" },
  { key: "D",   action: "Toggle debug mode (show landmark indices)" },
  { key: "V",   action: "Toggle voice control on/off" },
  { key: "G",   action: "Toggle gesture guide overlay" },
];

const COLOR_MAP = {
  cyan:   { border: "rgba(0,229,255,0.2)",   bg: "rgba(0,229,255,0.05)",   text: "var(--accent-cyan)"   },
  green:  { border: "rgba(0,255,136,0.2)",   bg: "rgba(0,255,136,0.05)",   text: "var(--accent-green)"  },
  orange: { border: "rgba(255,107,53,0.2)",  bg: "rgba(255,107,53,0.05)",  text: "var(--accent-orange)" },
  purple: { border: "rgba(168,85,247,0.2)",  bg: "rgba(168,85,247,0.05)",  text: "var(--accent-purple)" },
};

export default function Guide() {
  const [tab, setTab] = useState(0);

  return (
    <div className="guide-page">
      <div>
        <h1 className="section-title">Gesture & Voice Guide</h1>
        <p className="section-sub">Complete reference for all supported interactions</p>
      </div>

      {/* Tabs */}
      <div className="guide-tabs">
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`guide-tab ${tab === i ? "active" : ""}`}
            onClick={() => setTab(i)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Gesture Tab */}
      {tab === 0 && (
        <div className="guide-content">
          {GESTURE_SECTIONS.map((sec) => {
            const c = COLOR_MAP[sec.color];
            return (
              <div key={sec.title} className="guide-section">
                <h2 className="guide-section-title" style={{ color: c.text }}>{sec.title}</h2>
                <div className="gesture-ref-list">
                  {sec.items.map((item) => (
                    <div key={item.name} className="gesture-ref-item" style={{ borderColor: c.border, background: c.bg }}>
                      <span className="ref-emoji">{item.emoji}</span>
                      <div>
                        <p className="ref-name" style={{ color: c.text }}>{item.name}</p>
                        <p className="ref-desc">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Voice Tab */}
      {tab === 1 && (
        <div className="guide-content">
          {VOICE_SECTIONS.map((sec) => (
            <div key={sec.group} className="guide-section">
              <h2 className="guide-section-title" style={{ color: "var(--accent-green)" }}>{sec.group}</h2>
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Voice Command</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {sec.cmds.map((c) => (
                      <tr key={c.cmd}>
                        <td><span className="voice-tag">"{c.cmd}"</span></td>
                        <td style={{ color: "var(--text-secondary)" }}>{c.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Keyboard Shortcuts Tab */}
      {tab === 2 && (
        <div className="guide-content">
          <div className="card">
            <table className="data-table">
              <thead>
                <tr><th>Key</th><th>Action</th></tr>
              </thead>
              <tbody>
                {KB_SHORTCUTS.map((s) => (
                  <tr key={s.key}>
                    <td><kbd className="kbd">{s.key}</kbd></td>
                    <td style={{ color: "var(--text-secondary)" }}>{s.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
