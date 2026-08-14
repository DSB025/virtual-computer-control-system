"""
Flask Backend — Gesture + Voice Controller API
This wraps gesture_voice_controller_v3.py so the React
frontend can start/stop it and receive logs.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import threading
import time
import os
import sys

app = Flask(__name__)
CORS(app)  # allows the React app (port 3000) to talk to this (port 5000)

# ── Controller process tracking ──────────────────────────────
controller_process = None   # holds the running subprocess
controller_running = False

# ── In-memory log storage (replace with a database later) ────
gesture_logs = []
voice_logs   = []
log_id_counter = 1

# ─────────────────────────────────────────────────────────────
#  HEALTH CHECK
# ─────────────────────────────────────────────────────────────
@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "message": "Backend is running"})


# ─────────────────────────────────────────────────────────────
#  CONTROLLER — START / STOP / STATUS
# ─────────────────────────────────────────────────────────────
@app.route("/api/controller/start", methods=["POST"])
def start_controller():
    global controller_process, controller_running

    if controller_running:
        return jsonify({"running": True, "message": "Already running"})

    try:
        # Launch the controller script as a separate process
        controller_process = subprocess.Popen(
            [sys.executable, "gesture_voice_controller_v3.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        controller_running = True
        return jsonify({"running": True, "message": "Controller started"})
    except Exception as e:
        return jsonify({"running": False, "error": str(e)}), 500


@app.route("/api/controller/stop", methods=["POST"])
def stop_controller():
    global controller_process, controller_running

    if controller_process:
        controller_process.terminate()  # sends shutdown signal
        controller_process = None

    controller_running = False
    return jsonify({"running": False, "message": "Controller stopped"})


@app.route("/api/controller/status")
def controller_status():
    global controller_process, controller_running

    # Check if process is still actually running
    if controller_process and controller_process.poll() is not None:
        controller_running = False  # process ended on its own

    return jsonify({"running": controller_running})


# ─────────────────────────────────────────────────────────────
#  GESTURE LOGS
# ─────────────────────────────────────────────────────────────
@app.route("/api/gestures/logs")
def get_gesture_logs():
    page  = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))

    start = (page - 1) * limit
    end   = start + limit
    total_pages = max(1, -(-len(gesture_logs) // limit))  # ceiling division

    return jsonify({
        "logs":        list(reversed(gesture_logs))[start:end],  # newest first
        "total_pages": total_pages,
        "total":       len(gesture_logs)
    })


@app.route("/api/gestures/logs/<int:log_id>", methods=["DELETE"])
def delete_gesture_log(log_id):
    global gesture_logs
    gesture_logs = [l for l in gesture_logs if l["id"] != log_id]
    return jsonify({"deleted": True})


@app.route("/api/gestures/stats")
def gesture_stats():
    # Count how many times each gesture was used
    counts = {}
    for log in gesture_logs:
        name = log["gesture"]
        counts[name] = counts.get(name, 0) + 1

    stats = [{"name": k, "count": v}
             for k, v in sorted(counts.items(), key=lambda x: -x[1])]

    return jsonify({"stats": stats, "timeline": []})


@app.route("/api/gestures/log", methods=["POST"])
def add_gesture_log():
    """Called by the controller to record a gesture event"""
    global log_id_counter
    data = request.json
    data["id"] = log_id_counter
    log_id_counter += 1
    gesture_logs.append(data)
    return jsonify({"saved": True})


# ─────────────────────────────────────────────────────────────
#  VOICE LOGS
# ─────────────────────────────────────────────────────────────
@app.route("/api/voice/logs")
def get_voice_logs():
    page  = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))

    start = (page - 1) * limit
    end   = start + limit
    total_pages = max(1, -(-len(voice_logs) // limit))

    return jsonify({
        "logs":        list(reversed(voice_logs))[start:end],
        "total_pages": total_pages,
        "total":       len(voice_logs)
    })


@app.route("/api/voice/logs/<int:log_id>", methods=["DELETE"])
def delete_voice_log(log_id):
    global voice_logs
    voice_logs = [l for l in voice_logs if l["id"] != log_id]
    return jsonify({"deleted": True})


@app.route("/api/voice/stats")
def voice_stats():
    counts = {}
    for log in voice_logs:
        cmd = log["command"]
        counts[cmd] = counts.get(cmd, 0) + 1

    stats = [{"name": k, "count": v}
             for k, v in sorted(counts.items(), key=lambda x: -x[1])]

    return jsonify({"stats": stats})


# ─────────────────────────────────────────────────────────────
#  SETTINGS
# ─────────────────────────────────────────────────────────────
current_settings = {
    "camera_id":          0,
    "frame_width":        720,
    "frame_height":       540,
    "smoothing":          0.65,
    "click_pinch_thresh": 0.06,
    "pinch_frames_req":   3,
    "fist_frames_req":    4,
    "scroll_sensitivity": 300,
    "swipe_threshold":    0.22,
    "swipe_time":         0.4,
    "drag_threshold":     0.5,
    "web_gesture_hold":   1.0,
    "voice_enabled":      True,
    "tts_enabled":        True,
    "debug_mode":         False,
}

@app.route("/api/settings")
def get_settings():
    return jsonify(current_settings)

@app.route("/api/settings", methods=["PUT"])
def update_settings():
    global current_settings
    current_settings.update(request.json)
    return jsonify({"saved": True, "settings": current_settings})

@app.route("/api/settings/reset", methods=["POST"])
def reset_settings():
    # Settings would reset to defaults (simplified here)
    return jsonify({"reset": True})


# ─────────────────────────────────────────────────────────────
#  SYSTEM INFO
# ─────────────────────────────────────────────────────────────
@app.route("/api/system/info")
def system_info():
    import platform
    return jsonify({
        "platform":    platform.system() + " " + platform.release(),
        "python":      sys.version.split()[0],
        "camera":      "Available",
        "microphone":  "Available",
    })


# ─────────────────────────────────────────────────────────────
#  RUN
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("✅ Flask backend running at http://localhost:5000")
    print("   Frontend should be at  http://localhost:3000")
    app.run(debug=True, port=5000)