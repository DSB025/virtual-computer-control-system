# ✋ GestureCtrl v3.0 — Frontend

Production-ready React dashboard for the **Hand Gesture + Voice Command Controller** final year project.

---

## 🚀 Quick Start

### 1. Install Node.js
Make sure you have **Node.js ≥ 18** installed: https://nodejs.org

### 2. Clone / copy this folder
```bash
cd gesture-controller-frontend
```

### 3. Install dependencies
```bash
npm install
```

### 4. Configure your backend URL
```bash
cp .env.example .env
# Edit .env and set REACT_APP_API_URL=http://localhost:8000
```

### 5. Start the development server
```bash
npm start
# Opens http://localhost:3000
```

### 6. Build for production
```bash
npm run build
# Output in /build folder — deploy anywhere (Nginx, Apache, Vercel, Netlify)
```

---

## 📁 Folder Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx       # Top navigation bar
│   ├── Navbar.css
│   ├── Sidebar.jsx      # Left navigation panel
│   ├── Sidebar.css
│   └── Footer.jsx       # Bottom footer bar
│
├── pages/               # Full page components (one per route)
│   ├── Home.jsx         # Landing page with gesture & voice reference
│   ├── Home.css
│   ├── Dashboard.jsx    # Stats, charts, live activity
│   ├── Dashboard.css
│   ├── GestureLogs.jsx  # Paginated gesture event table
│   ├── VoiceLogs.jsx    # Paginated voice command table
│   ├── LogsPage.css     # Shared styles for log pages
│   ├── Settings.jsx     # Controller configuration form
│   ├── Settings.css
│   ├── Guide.jsx        # Full gesture & voice reference guide
│   ├── Guide.css
│   └── About.jsx        # Project overview & how it works
│
├── services/
│   └── api.js           # ← ALL backend API calls go here
│
├── context/
│   └── AppContext.jsx   # Global state: controller status, system info
│
├── App.jsx              # Root component + routing
├── index.js             # React entry point
└── index.css            # Global design system (CSS variables, utilities)
```

---

## 🔌 Plugging In Your Backend APIs

All backend communication is in **`src/services/api.js`**.

### Step 1 — Set your base URL
In `.env`:
```
REACT_APP_API_URL=http://localhost:8000
```
Or edit directly in `api.js`:
```js
export const BASE_URL = "http://localhost:8000";
```

### Step 2 — Map your actual endpoints

Open `src/services/api.js` and replace the placeholder paths:

| Function              | Placeholder Path              | Replace With Your Route |
|-----------------------|-------------------------------|-------------------------|
| `startController()`   | `POST /api/controller/start`  | e.g. `POST /start`      |
| `stopController()`    | `POST /api/controller/stop`   | e.g. `POST /stop`       |
| `getControllerStatus()` | `GET /api/controller/status` | e.g. `GET /status`     |
| `getGestureLogs()`    | `GET /api/gestures/logs`      | your logs endpoint      |
| `getGestureStats()`   | `GET /api/gestures/stats`     | your stats endpoint     |
| `getVoiceLogs()`      | `GET /api/voice/logs`         | your voice logs         |
| `getVoiceStats()`     | `GET /api/voice/stats`        | your voice stats        |
| `getSettings()`       | `GET /api/settings`           | your settings           |
| `updateSettings()`    | `PUT /api/settings`           | your settings update    |
| `resetSettings()`     | `POST /api/settings/reset`    | your reset route        |
| `healthCheck()`       | `GET /api/health`             | your health route       |
| `getSystemInfo()`     | `GET /api/system/info`        | your system info route  |

### Expected response shapes

**`GET /api/controller/status`**
```json
{ "running": true }
```

**`GET /api/gestures/logs?page=1&limit=20`**
```json
{
  "logs": [
    { "id": 1, "gesture": "Pinch", "action": "Left Click", "confidence": 0.92, "timestamp": "2025-01-01T12:00:00Z" }
  ],
  "total_pages": 5
}
```

**`GET /api/gestures/stats`**
```json
{
  "stats": [
    { "name": "Pinch", "count": 142 }
  ],
  "timeline": [
    { "time": "09:00", "gestures": 23, "voice": 8 }
  ]
}
```

**`GET /api/settings`**
```json
{
  "smoothing": 0.65,
  "click_pinch_thresh": 0.06,
  "scroll_sensitivity": 300,
  "voice_enabled": true
}
```

**`GET /api/system/info`**
```json
{
  "platform": "Windows 11",
  "camera_available": true,
  "mic_available": true,
  "mediapipe_version": "0.10"
}
```

---

## 🐍 Recommended Python Backend Setup (Flask example)

```python
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow requests from React dev server

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/api/controller/start", methods=["POST"])
def start():
    # Launch your gesture_voice_controller_v3.py in a subprocess
    return jsonify({"running": True})

@app.route("/api/controller/status")
def status():
    return jsonify({"running": controller_is_running()})

# ... add your other routes
```

Install CORS support:
```bash
pip install flask flask-cors
```

---

## 🎨 Design System

The UI uses a custom dark futuristic theme defined entirely in CSS variables in `src/index.css`.
Key variables:

| Variable          | Value     | Use                        |
|-------------------|-----------|----------------------------|
| `--bg-base`       | `#080c14` | Page background            |
| `--accent-cyan`   | `#00e5ff` | Primary accent / links     |
| `--accent-green`  | `#00ff88` | Success / active states    |
| `--accent-orange` | `#ff6b35` | Danger / warning           |
| `--font-display`  | Syne      | Headings                   |
| `--font-mono`     | Space Mono| Labels, code, tables       |

---

## 📦 Dependencies

| Package          | Purpose                        |
|------------------|-------------------------------|
| react-router-dom | Client-side routing           |
| axios            | HTTP client for API calls     |
| recharts         | Charts (line, bar, pie)       |
| react-hot-toast  | Toast notifications           |
| lucide-react     | Icon set                      |

---

## 🔐 Authentication (Optional)

If your backend uses JWT tokens, the Axios interceptor in `api.js` already handles them:
```js
// In api.js — already wired up:
const token = localStorage.getItem("auth_token");
if (token) config.headers.Authorization = `Bearer ${token}`;
```

Store your token after login:
```js
localStorage.setItem("auth_token", "your-jwt-token");
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Layout                        |
|------------|-------------------------------|
| > 1024px   | Full sidebar + 4-col grids    |
| 768–1024px | Sidebar + 2-col grids         |
| < 768px    | Collapsible sidebar, 1-col    |

---

## 🛠 Scripts

```bash
npm start          # Development server (hot reload)
npm run build      # Production build
npm test           # Run tests
```
