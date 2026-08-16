# Hand Gesture + Voice Command Controller

**Final Year Project** — AI-Powered Human–Computer Interaction

Control your entire computer using hand gestures detected via webcam
and natural voice commands — no mouse, no keyboard, no special hardware.

---

## Built With

- **MediaPipe** — Real-time hand landmark detection
- **OpenCV** — Camera capture and frame processing
- **PyAutoGUI** — Mouse and keyboard automation
- **SpeechRecognition** — Voice command processing
- **pyttsx3** — Text-to-speech feedback
- **Flask** — Python backend API
- **React** — Frontend dashboard

---

## Features

- 16 hand gestures (click, scroll, drag, swipe, screenshot, and more)
- 30+ voice commands (browser control, system, mouse, web shortcuts)
- Real-time camera feed with gesture overlay
- Web dashboard to monitor logs, stats, and settings
- No special hardware — works with any standard webcam

---

## Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+

### Python Backend
```bash
python -m venv venv
venv\Scripts\activate
pip install mediapipe opencv-python pyautogui SpeechRecognition pyttsx3 pyaudio keyboard flask flask-cors
python app.py
```

### React Frontend
```bash
cd gesture-controller-frontend
npm install
npm start
```

Open **http://localhost:3000** in your browser.

---

## Gesture Reference

| Gesture | Action |
|---|---|
| ✋ Open Palm | Move mouse cursor |
| 🤏 Pinch | Left click |
| ✊ Fist | Right click |
| ☝️ Index + Middle Up | Scroll |
| 🌐 Three Fingers (hold 1s) | Open Google |
| 🎬 Four Fingers (hold 1s) | Open YouTube |
| ✌️ Peace Sign | Volume up |
| 🤘 Rock Sign | Volume down |

---

## Project Structure

```
gesture-voice-controller/
├── gesture_voice_controller_v3.py  ← Main controller
├── app.py                          ← Flask API backend
├── gesture-controller-frontend/    ← React dashboard
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/api.js
│   │   └── context/AppContext.jsx
│   └── package.json
└── README.md
```
