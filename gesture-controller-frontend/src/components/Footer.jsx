import React from "react";
import { useApp } from "../context/AppContext";

export default function Footer() {
  const { backendOnline } = useApp();
  return (
    <footer style={{
      borderTop: "1px solid var(--border-subtle)",
      padding: "1rem 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontFamily: "var(--font-mono)",
      fontSize: "0.72rem",
      color: "var(--text-muted)",
    }}>
      <span>Gesture + Voice Controller v3.0 · Final Year Project</span>
      <span>MediaPipe · OpenCV · PyAutoGUI · SpeechRecognition</span>
      <span style={{ color: backendOnline ? "var(--accent-green)" : "var(--accent-orange)" }}>
        ● {backendOnline ? "Connected" : "Disconnected"}
      </span>
    </footer>
  );
}
