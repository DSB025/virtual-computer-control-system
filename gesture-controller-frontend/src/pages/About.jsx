import React from "react";

export default function About() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1 className="section-title">About This Project</h1>
      <p className="section-sub" style={{ marginBottom: "2rem" }}>
        Final Year Project — AI-Powered Human–Computer Interaction
      </p>

      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", marginBottom: "1rem", color: "var(--accent-cyan)" }}>
          Project Overview
        </h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "1rem" }}>
          This system enables touchless computer control using a standard webcam.
          It combines <strong style={{ color: "var(--text-primary)" }}>MediaPipe hand tracking</strong> for real-time
          gesture recognition and <strong style={{ color: "var(--text-primary)" }}>SpeechRecognition</strong> for voice commands,
          all without any specialised hardware.
        </p>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
          The controller supports 16 hand gestures (including hold-to-trigger web gestures, swipes,
          drag mode, and media controls) alongside 30+ voice commands covering
          browser control, mouse emulation, and system functions.
        </p>
      </div>

      <div className="grid-2" style={{ marginBottom: "1.25rem" }}>
        {[
          { label: "Core Libraries", items: ["MediaPipe", "OpenCV (cv2)", "PyAutoGUI", "SpeechRecognition", "pyttsx3", "keyboard"] },
          { label: "Capabilities",   items: ["16 hand gestures", "30+ voice commands", "Real-time tracking 30 FPS", "Cross-platform", "No special hardware", "Text-to-speech feedback"] },
        ].map((col) => (
          <div key={col.label} className="card">
            <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--accent-cyan)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.85rem" }}>
              {col.label}
            </h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {col.items.map((item) => (
                <li key={item} style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--text-secondary)", display: "flex", gap: "0.5rem" }}>
                  <span style={{ color: "var(--accent-green)" }}>→</span> {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--accent-cyan)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.85rem" }}>
          How It Works
        </h3>
        {[
          ["Camera Capture", "OpenCV captures webcam frames at up to 30 FPS and mirrors them for natural interaction."],
          ["Hand Tracking", "MediaPipe Hands detects 21 3D landmarks per frame with 0.75+ confidence threshold."],
          ["Gesture Recognition", "Custom detector functions analyse landmark positions and distances to classify gestures."],
          ["Action Execution", "PyAutoGUI translates recognised gestures into real mouse movements, clicks, and key presses."],
          ["Voice Pipeline", "SpeechRecognition runs in a background thread, continuously listening for commands."],
          ["TTS Feedback", "pyttsx3 speaks confirmation of triggered actions so users know they were heard."],
        ].map(([title, desc]) => (
          <div key={title} style={{ display: "flex", gap: "1rem", paddingBottom: "0.85rem", marginBottom: "0.85rem", borderBottom: "1px solid var(--border-subtle)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--accent-purple)", minWidth: 130, paddingTop: "0.15rem" }}>{title}</span>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6 }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
