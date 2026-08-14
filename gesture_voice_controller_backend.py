"""
╔══════════════════════════════════════════════════════════════════╗
║     HAND GESTURE + VOICE COMMAND CONTROLLER v3.0                 ║
║     MediaPipe + OpenCV + PyAutoGUI + SpeechRecognition           ║
╚══════════════════════════════════════════════════════════════════╝

INSTALL EXTRA LIBRARIES (if not already installed):
    pip install SpeechRecognition pyaudio pyttsx3 keyboard

═══════════════════════ GESTURES LIST ═══════════════════════════

  ✋ Open Palm            → Move mouse cursor
  🤏 Pinch               → Left Click
  ✊ Fist                 → Right Click
  ☝️  Index+Middle Up    → Scroll (move hand up/down)
  👆 Index Only Up       → Drag Mode (hold left button)
  🤙 Pinky+Thumb Out     → Double Click
  🤞 Index+Middle Cross  → Screenshot
  👌 OK Gesture          → Press Enter

  [NEW WEB GESTURES — held for 1.0 sec to trigger]
  🌐 THREE Fingers Up    → Open Google (index+middle+ring up, others down)
  🎬 FOUR  Fingers Up    → Open YouTube (index+middle+ring+pinky up, thumb down)
  📖 Thumb + Index L-shape → Open Wikipedia (thumb+index spread wide, others folded)
  ❌ FIVE  Fingers + Shake → Close active tab (all 5 up + wrist horizontal shake)

  [SWIPE GESTURES]
  🖐️ Swipe Left  → Previous Slide / Left Arrow
  🖐️ Swipe Right → Next Slide / Right Arrow

  [MEDIA GESTURES]
  ✌️ Peace Sign   → Volume Up
  🤘 Rock Sign    → Volume Down
  🖖 Spock Hand   → Open App Launcher (Super/Win Key)

═══════════════════════ VOICE COMMANDS ═════════════════════════

  ── WEB SHORTCUTS (NEW) ──
  "open youtube"        → Opens youtube.com
  "close youtube"       → Closes active tab (if YouTube is open)
  "open google"         → Opens google.com
  "open wikipedia"      → Opens wikipedia.org
  "open gmail"          → Opens Gmail
  "search [query]"      → Google search for the spoken query
  "go to [site]"        → Navigate to a website by name

  ── BROWSER CONTROLS ──
  "open browser"        → Open Default Browser
  "close window"        → Alt+F4
  "close tab"           → Ctrl+W
  "new tab"             → Ctrl+T
  "next tab"            → Ctrl+Tab
  "previous tab"        → Ctrl+Shift+Tab
  "go back"             → Alt+Left
  "go forward"          → Alt+Right
  "refresh"             → F5
  "zoom in"             → Ctrl++
  "zoom out"            → Ctrl+-

  ── MOUSE / KEYBOARD ──
  "click"               → Left Click
  "right click"         → Right Click
  "double click"        → Double Click
  "scroll up"           → Scroll Up
  "scroll down"         → Scroll Down
  "screenshot"          → Take Screenshot
  "copy"                → Ctrl+C
  "paste"               → Ctrl+V
  "undo"                → Ctrl+Z
  "select all"          → Ctrl+A
  "press escape"        → Escape Key

  ── SYSTEM ──
  "maximize"            → Win+Up Arrow
  "minimize"            → Win+Down Arrow
  "volume up"           → System Volume Up
  "volume down"         → System Volume Down
  "mute"                → System Mute
  "next slide"          → Right Arrow
  "previous slide"      → Left Arrow
  "stop"                → Stop Voice Listener
"""

import cv2
import mediapipe as mp
import pyautogui
import math
import time
import threading
import queue
import os
import sys
import webbrowser

# ───────────── OPTIONAL IMPORTS (with graceful fallback) ─────────────
try:
    import speech_recognition as sr
    VOICE_AVAILABLE = True
except ImportError:
    VOICE_AVAILABLE = False
    print("⚠️  SpeechRecognition not found. Run: pip install SpeechRecognition pyaudio")

try:
    import pyttsx3
    tts_engine = pyttsx3.init()
    tts_engine.setProperty('rate', 170)
    TTS_AVAILABLE = True
except ImportError:
    TTS_AVAILABLE = False
    print("⚠️  pyttsx3 not found. Run: pip install pyttsx3")

try:
    import keyboard
    KEYBOARD_AVAILABLE = True
except ImportError:
    KEYBOARD_AVAILABLE = False

# ════════════════════════════ CONFIG ════════════════════════════
CAMERA_ID           = 0
FRAME_WIDTH         = 720
FRAME_HEIGHT        = 540

SMOOTHING           = 0.65
CLICK_PINCH_THRESH  = 0.06
PINCH_FRAMES_REQ    = 3
FIST_FRAMES_REQ     = 4
SCROLL_SENSITIVITY  = 300
SWIPE_THRESHOLD     = 0.22
SWIPE_TIME          = 0.4
DRAG_THRESHOLD      = 0.5     # seconds holding index-only to start drag
DOUBLE_CLICK_DIST   = 0.07
OK_DIST             = 0.055
WEB_GESTURE_HOLD    = 1.0     # seconds to hold new web gestures before triggering
L_SHAPE_ANGLE_THRESH = 55     # degrees min angle between thumb and index for L-shape
CLOSE_TAB_SHAKE_THRESH = 0.10 # wrist X movement threshold to detect shake
# ════════════════════════════════════════════════════════════════

# ─────── Screen ───────
pyautogui.FAILSAFE = False
screen_w, screen_h = pyautogui.size()

# ─────── MediaPipe ───────
mp_hands    = mp.solutions.hands
mp_drawing  = mp.solutions.drawing_utils
mp_styles   = mp.solutions.drawing_styles
hands_model = mp_hands.Hands(
    max_num_hands=1,
    min_detection_confidence=0.75,
    min_tracking_confidence=0.75
)

# ════════════════════ HELPER FUNCTIONS ════════════════════

def dist(a, b):
    return math.hypot(a[0]-b[0], a[1]-b[1])

def norm_to_screen(nx, ny):
    x = min(max(nx, 0.0), 1.0) * screen_w
    y = min(max(ny, 0.0), 1.0) * screen_h
    return int(x), int(y)

def speak(text):
    """Non-blocking TTS"""
    if TTS_AVAILABLE:
        def _speak():
            try:
                tts_engine.say(text)
                tts_engine.runAndWait()
            except:
                pass
        threading.Thread(target=_speak, daemon=True).start()

def open_url(url, label="page"):
    """Cross-platform URL opener"""
    try:
        webbrowser.open(url)
    except Exception:
        cmd = f"start {url}" if sys.platform == "win32" else f"xdg-open {url}"
        os.system(cmd)
    speak(f"Opening {label}")

def fingers_up(lm):
    """Returns list [thumb, index, middle, ring, pinky] 1=up 0=down"""
    tips  = [4, 8, 12, 16, 20]
    pips  = [3, 6, 10, 14, 18]
    up    = []
    # Thumb: compare x for horizontal
    up.append(1 if lm[4][0] < lm[3][0] else 0)
    for tip, pip in zip(tips[1:], pips[1:]):
        up.append(1 if lm[tip][1] < lm[pip][1] else 0)
    return up

def angle_between(a, b, c):
    """Angle at point b formed by segments b→a and b→c (in degrees)"""
    ax, ay = a[0] - b[0], a[1] - b[1]
    cx, cy = c[0] - b[0], c[1] - b[1]
    dot = ax * cx + ay * cy
    mag = (math.hypot(ax, ay) * math.hypot(cx, cy)) + 1e-9
    return math.degrees(math.acos(max(-1.0, min(1.0, dot / mag))))

# ══════════ GESTURE DETECTORS ══════════

def detect_ok(lm):
    """OK = thumb tip close to middle tip, other fingers extended"""
    up = fingers_up(lm)
    d  = dist((lm[4][0], lm[4][1]), (lm[12][0], lm[12][1]))
    return d < OK_DIST and up[3] == 1 and up[4] == 1

def detect_peace(lm):
    """✌️ = index + middle up, others down"""
    up = fingers_up(lm)
    return up[1]==1 and up[2]==1 and up[0]==0 and up[3]==0 and up[4]==0

def detect_rock(lm):
    """🤘 = index + pinky up, others down"""
    up = fingers_up(lm)
    return up[1]==1 and up[4]==1 and up[0]==0 and up[2]==0 and up[3]==0

def detect_index_only(lm):
    """☝️ = only index up"""
    up = fingers_up(lm)
    return up[1]==1 and up[2]==0 and up[3]==0 and up[4]==0

def detect_pinky_thumb(lm):
    """🤙 = pinky+thumb out, others folded"""
    up = fingers_up(lm)
    return up[0]==1 and up[4]==1 and up[1]==0 and up[2]==0 and up[3]==0

def detect_cross_fingers(lm):
    """🤞 = index+middle very close together = crossed"""
    up = fingers_up(lm)
    d = dist((lm[8][0], lm[8][1]), (lm[12][0], lm[12][1]))
    return up[1]==1 and up[2]==1 and d < 0.04 and up[3]==0 and up[4]==0

# ──── NEW WEB GESTURES ────

def detect_three_fingers(lm):
    """🌐 THREE fingers = index+middle+ring up, thumb+pinky down → Open Google"""
    up = fingers_up(lm)
    return up[1]==1 and up[2]==1 and up[3]==1 and up[0]==0 and up[4]==0

def detect_four_fingers(lm):
    """🎬 FOUR fingers = index+middle+ring+pinky up, thumb down → Open YouTube"""
    up = fingers_up(lm)
    return up[1]==1 and up[2]==1 and up[3]==1 and up[4]==1 and up[0]==0

def detect_l_shape(lm):
    """📖 L-shape = thumb+index spread wide, other 3 fingers folded → Open Wikipedia
    Detected by: only thumb and index up, AND large angle between them"""
    up = fingers_up(lm)
    if not (up[0]==1 and up[1]==1 and up[2]==0 and up[3]==0 and up[4]==0):
        return False
    # Angle at the base (wrist area landmark 2) between thumb tip and index tip
    ang = angle_between(
        (lm[4][0], lm[4][1]),   # thumb tip
        (lm[2][0], lm[2][1]),   # thumb base (MCP)
        (lm[8][0], lm[8][1])    # index tip
    )
    return ang > L_SHAPE_ANGLE_THRESH

def detect_close_tab_shake(lm, shake_history):
    """❌ ALL 5 fingers up + horizontal wrist shake → Close tab
    shake_history: list of recent wrist X positions (last ~0.5s)"""
    up = fingers_up(lm)
    all_up = all(f==1 for f in up)
    if not all_up:
        return False
    if len(shake_history) < 6:
        return False
    xs = [x for _, x in shake_history]
    spread = max(xs) - min(xs)
    # Must have gone both left and right (direction changes ≥ 2)
    changes = sum(1 for i in range(1, len(xs)-1)
                  if (xs[i]-xs[i-1]) * (xs[i+1]-xs[i]) < 0)
    return spread > CLOSE_TAB_SHAKE_THRESH and changes >= 2

# ════════════════════ VOICE COMMAND ENGINE ════════════════════

voice_queue   = queue.Queue()
voice_active  = threading.Event()
voice_active.set()

def _open(url, label):
    return lambda: open_url(url, label)

VOICE_COMMANDS = {
    # ── NEW: Web site shortcuts ──
    "open youtube":    _open("https://www.youtube.com", "YouTube"),
    "close youtube":   lambda: (speak("Closing tab"), pyautogui.hotkey('ctrl','w')),
    "open google":     _open("https://www.google.com", "Google"),
    "open wikipedia":  _open("https://www.wikipedia.org", "Wikipedia"),
    "open gmail":      _open("https://mail.google.com", "Gmail"),
    "open github":     _open("https://www.github.com", "GitHub"),
    "open maps":       _open("https://maps.google.com", "Google Maps"),
    "open netflix":    _open("https://www.netflix.com", "Netflix"),

    # ── Mouse / keyboard ──
    "click":           lambda: pyautogui.click(),
    "right click":     lambda: pyautogui.click(button='right'),
    "double click":    lambda: pyautogui.doubleClick(),
    "scroll up":       lambda: pyautogui.scroll(500),
    "scroll down":     lambda: pyautogui.scroll(-500),
    "screenshot":      lambda: pyautogui.screenshot(f"screenshot_{int(time.time())}.png"),

    # ── Browser ──
    "open browser":    lambda: open_url("https://www.google.com", "browser"),
    "close window":    lambda: pyautogui.hotkey('alt','f4'),
    "close tab":       lambda: pyautogui.hotkey('ctrl','w'),
    "maximize":        lambda: pyautogui.hotkey('win','up'),
    "minimize":        lambda: pyautogui.hotkey('win','down'),
    "next tab":        lambda: pyautogui.hotkey('ctrl','tab'),
    "previous tab":    lambda: pyautogui.hotkey('ctrl','shift','tab'),
    "new tab":         lambda: pyautogui.hotkey('ctrl','t'),
    "go back":         lambda: pyautogui.hotkey('alt','left'),
    "go forward":      lambda: pyautogui.hotkey('alt','right'),
    "refresh":         lambda: pyautogui.press('f5'),
    "zoom in":         lambda: pyautogui.hotkey('ctrl','='),
    "zoom out":        lambda: pyautogui.hotkey('ctrl','-'),

    # ── Clipboard / editing ──
    "copy":            lambda: pyautogui.hotkey('ctrl','c'),
    "paste":           lambda: pyautogui.hotkey('ctrl','v'),
    "undo":            lambda: pyautogui.hotkey('ctrl','z'),
    "select all":      lambda: pyautogui.hotkey('ctrl','a'),

    # ── Volume ──
    "volume up":       lambda: [pyautogui.press('volumeup') for _ in range(5)],
    "volume down":     lambda: [pyautogui.press('volumedown') for _ in range(5)],
    "mute":            lambda: pyautogui.press('volumemute'),

    # ── Misc ──
    "next slide":      lambda: pyautogui.press('right'),
    "previous slide":  lambda: pyautogui.press('left'),
    "press escape":    lambda: pyautogui.press('escape'),
    "stop":            lambda: voice_active.clear(),
}

def handle_dynamic_voice(cmd):
    """Handle parameterised commands like 'search ...' or 'go to ...'"""
    if cmd.startswith("search "):
        query = cmd[7:].strip().replace(" ", "+")
        open_url(f"https://www.google.com/search?q={query}", f"search for {cmd[7:]}")
        return True
    if cmd.startswith("go to "):
        site = cmd[6:].strip().replace(" ", "")
        open_url(f"https://www.{site}.com", site)
        return True
    return False

def voice_listener():
    if not VOICE_AVAILABLE:
        return
    recognizer = sr.Recognizer()
    recognizer.energy_threshold = 3000
    recognizer.dynamic_energy_threshold = True
    mic = sr.Microphone()
    print("🎙️  Voice command listener started!")
    speak("Voice control activated")
    with mic as source:
        recognizer.adjust_for_ambient_noise(source, duration=1)
    while True:
        if not voice_active.is_set():
            time.sleep(0.5)
            continue
        try:
            with mic as source:
                audio = recognizer.listen(source, timeout=5, phrase_time_limit=4)
            text = recognizer.recognize_google(audio).lower().strip()
            print(f"🗣️  Voice: '{text}'")
            voice_queue.put(text)
        except sr.WaitTimeoutError:
            pass
        except sr.UnknownValueError:
            pass
        except Exception:
            pass

def process_voice_commands():
    while not voice_queue.empty():
        cmd = voice_queue.get()
        matched = False
        for key, action in VOICE_COMMANDS.items():
            if key in cmd:
                print(f"⚡ Executing: {key}")
                try:
                    action()
                except Exception as e:
                    print(f"   ⚠️ Error: {e}")
                matched = True
                break
        if not matched:
            matched = handle_dynamic_voice(cmd)
        if not matched:
            print(f"   ❓ Unknown command: '{cmd}'")

# ════════════════════ HUD OVERLAY ════════════════════

def draw_hud(frame, gesture_text, voice_text, fps, drag_mode, voice_on):
    h, w = frame.shape[:2]

    # Semi-transparent top bar
    overlay = frame.copy()
    cv2.rectangle(overlay, (0,0), (w, 55), (10,10,30), -1)
    cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)

    # Title
    cv2.putText(frame, "GESTURE + VOICE CONTROLLER v3.0",
                (10, 22), cv2.FONT_HERSHEY_DUPLEX, 0.55, (0,220,255), 1)

    # FPS badge
    fps_col = (0,255,100) if fps > 25 else (0,180,255) if fps > 15 else (0,80,255)
    cv2.putText(frame, f"FPS:{int(fps)}", (w-90,22),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, fps_col, 2)

    # Gesture panel
    overlay2 = frame.copy()
    cv2.rectangle(overlay2, (0, h-90), (w, h), (10,10,30), -1)
    cv2.addWeighted(overlay2, 0.7, frame, 0.3, 0, frame)

    # Gesture indicator
    # Highlight web gestures in a different colour
    web_keywords = ["YouTube", "Google", "Wikipedia", "Close Tab"]
    g_color = (0,200,255) if any(k in gesture_text for k in web_keywords) \
              else (0,255,150) if gesture_text not in ["None","Move"] \
              else (180,180,180)
    cv2.putText(frame, f"GESTURE: {gesture_text}",
                (10, h-60), cv2.FONT_HERSHEY_DUPLEX, 0.65, g_color, 2)

    # Voice indicator
    v_color = (255,150,0) if voice_text else (120,120,120)
    v_label = f"VOICE: {voice_text if voice_text else '---'}"
    cv2.putText(frame, v_label, (10, h-30),
                cv2.FONT_HERSHEY_DUPLEX, 0.65, v_color, 2)

    # Drag mode badge
    if drag_mode:
        cv2.putText(frame, "[ DRAG MODE ]",
                    (w//2-80, h-60), cv2.FONT_HERSHEY_DUPLEX, 0.65, (0,100,255), 2)

    # Voice status dot
    dot_col = (0,255,80) if voice_on else (80,80,80)
    cv2.circle(frame, (w-20, h-30), 8, dot_col, -1)
    cv2.putText(frame, "MIC", (w-60, h-24),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, dot_col, 1)

    # Controls hint
    cv2.putText(frame, "Q=Quit | D=Debug | V=Voice Toggle | G=Gesture Guide",
                (10, h-8), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (150,150,150), 1)

def draw_gesture_guide(frame):
    """Overlay a quick gesture reference card (toggled with G key)"""
    h, w = frame.shape[:2]
    overlay = frame.copy()
    cv2.rectangle(overlay, (w-260, 60), (w-5, h-100), (15,15,40), -1)
    cv2.addWeighted(overlay, 0.82, frame, 0.18, 0, frame)
    lines = [
        "── GESTURE GUIDE ──",
        "Pinch      → Click",
        "Fist       → R.Click",
        "2-fingers  → Scroll",
        "Index only → Drag",
        "Pinky+Thumb→ DblClick",
        "Cross ✝    → Screenshot",
        "OK 👌      → Enter",
        "Peace ✌️   → Vol Up",
        "Rock 🤘    → Vol Down",
        "─── WEB (hold 1s) ───",
        "3 fingers  → Google",
        "4 fingers  → YouTube",
        "L-shape    → Wikipedia",
        "5+shake    → Close Tab",
    ]
    for i, line in enumerate(lines):
        col = (0,220,255) if "WEB" in line or "GUIDE" in line else (200,200,200)
        cv2.putText(frame, line, (w-250, 80+i*22),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.42, col, 1)

# ════════════════════ MAIN LOOP ════════════════════

def main():
    global VOICE_AVAILABLE

    print("""
╔══════════════════════════════════════════════════════╗
║  HAND GESTURE + VOICE CONTROLLER v3.0  Starting...  ║
║  NEW: Open Google / YouTube / Wikipedia gestures!    ║
╚══════════════════════════════════════════════════════╝
    """)

    # Start voice thread
    if VOICE_AVAILABLE:
        vt = threading.Thread(target=voice_listener, daemon=True)
        vt.start()
    else:
        print("📢 Voice control disabled (install SpeechRecognition + pyaudio)")

    cap = cv2.VideoCapture(CAMERA_ID)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, FRAME_WIDTH)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, FRAME_HEIGHT)
    cap.set(cv2.CAP_PROP_FPS, 30)

    # ── State ──
    smoothed_x, smoothed_y = pyautogui.position()
    pinch_count        = 0;  pinch_active       = False
    fist_count         = 0;  fist_active        = False
    ok_count           = 0;  ok_active          = False
    double_count       = 0;  double_active      = False
    rock_count         = 0;  rock_active        = False
    peace_count        = 0;  peace_active       = False
    spock_count        = 0;  spock_active       = False
    cross_count        = 0;  cross_active       = False
    index_only_count   = 0
    last_scroll_y      = None
    pos_history        = []
    last_swipe_time    = 0
    fps_prev_time      = time.time()
    drag_mode          = False
    drag_start_time    = None
    gesture_text       = "None"
    last_voice_cmd     = ""
    voice_cmd_timer    = 0
    debug_mode         = False
    show_guide         = False

    # ── NEW web gesture state ──
    google_start       = None;  google_active    = False
    youtube_start      = None;  youtube_active   = False
    wiki_start         = None;  wiki_active      = False
    close_shake_hist   = []     # list of (timestamp, wrist_x)
    close_active       = False
    last_close_time    = 0

    # ── Hold-progress bar helpers ──
    def hold_progress(start_t):
        if start_t is None:
            return 0.0
        return min(1.0, (time.time() - start_t) / WEB_GESTURE_HOLD)

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("❌ Camera not available.")
                break

            frame = cv2.flip(frame, 1)
            h, w, _ = frame.shape
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands_model.process(rgb)

            gesture_text = "None"

            if results.multi_hand_landmarks:
                hand = results.multi_hand_landmarks[0]

                mp_drawing.draw_landmarks(
                    frame, hand,
                    mp_hands.HAND_CONNECTIONS,
                    mp_styles.get_default_hand_landmarks_style(),
                    mp_styles.get_default_hand_connections_style()
                )

                lm = [(p.x, p.y, p.z) for p in hand.landmark]
                index_tip  = lm[8]
                thumb_tip  = lm[4]
                wrist      = lm[0]
                up_flags   = fingers_up(lm)

                # ── 1. CURSOR MOVEMENT ──
                nx, ny = index_tip[0], index_tip[1]
                sx, sy = norm_to_screen(nx, ny)
                smoothed_x = int(smoothed_x * SMOOTHING + sx * (1-SMOOTHING))
                smoothed_y = int(smoothed_y * SMOOTHING + sy * (1-SMOOTHING))
                if not drag_mode:
                    pyautogui.moveTo(smoothed_x, smoothed_y, duration=0)
                else:
                    pyautogui.dragTo(smoothed_x, smoothed_y, duration=0, button='left')
                gesture_text = "Move"

                # ── 2. PINCH LEFT CLICK ──
                d_pinch = dist((thumb_tip[0],thumb_tip[1]),(index_tip[0],index_tip[1]))
                if d_pinch < CLICK_PINCH_THRESH:
                    pinch_count += 1
                    if pinch_count >= PINCH_FRAMES_REQ and not pinch_active:
                        if drag_mode:
                            pyautogui.mouseUp()
                            drag_mode = False
                            gesture_text = "Drag Released"
                        else:
                            pyautogui.click()
                            gesture_text = "Left Click ✅"
                        pinch_active = True
                else:
                    pinch_count = 0
                    pinch_active = False

                # ── 3. FIST RIGHT CLICK ──
                folded = sum(1 for tip,pip in [(8,6),(12,10),(16,14),(20,18)]
                             if lm[tip][1] > lm[pip][1])
                if folded >= 4:
                    fist_count += 1
                    if fist_count >= FIST_FRAMES_REQ and not fist_active:
                        pyautogui.click(button='right')
                        gesture_text = "Right Click ✅"
                        fist_active = True
                else:
                    fist_count = 0
                    fist_active = False

                # ── 4. SCROLL (index+middle up) ──
                if up_flags[1]==1 and up_flags[2]==1 and up_flags[3]==0 and up_flags[4]==0:
                    cur_avg_y = (lm[8][1]+lm[12][1])/2
                    if last_scroll_y is not None:
                        dy = last_scroll_y - cur_avg_y
                        pyautogui.scroll(int(dy * SCROLL_SENSITIVITY))
                        gesture_text = f"Scroll {'↑' if dy>0 else '↓'}"
                    last_scroll_y = cur_avg_y
                else:
                    last_scroll_y = None

                # ── 5. DRAG MODE (index only, held) ──
                if detect_index_only(lm):
                    index_only_count += 1
                    if drag_start_time is None:
                        drag_start_time = time.time()
                    elif (time.time()-drag_start_time) > DRAG_THRESHOLD and not drag_mode:
                        pyautogui.mouseDown()
                        drag_mode = True
                        gesture_text = "Drag Mode 🔒"
                else:
                    if drag_mode and index_only_count == 0:
                        pyautogui.mouseUp()
                        drag_mode = False
                    index_only_count = 0
                    drag_start_time = None

                if drag_mode:
                    gesture_text = "Dragging 🔒"

                # ── 6. DOUBLE CLICK (pinky+thumb) ──
                if detect_pinky_thumb(lm):
                    double_count += 1
                    if double_count >= PINCH_FRAMES_REQ and not double_active:
                        pyautogui.doubleClick()
                        gesture_text = "Double Click ✅✅"
                        double_active = True
                else:
                    double_count = 0
                    double_active = False

                # ── 7. SCREENSHOT (crossed fingers) ──
                if detect_cross_fingers(lm):
                    cross_count += 1
                    if cross_count >= PINCH_FRAMES_REQ+2 and not cross_active:
                        fname = f"screenshot_{int(time.time())}.png"
                        pyautogui.screenshot(fname)
                        gesture_text = "📸 Screenshot!"
                        speak("Screenshot taken")
                        cross_active = True
                else:
                    cross_count = 0
                    cross_active = False

                # ── 8. ENTER / OK (thumb+middle) ──
                if detect_ok(lm):
                    ok_count += 1
                    if ok_count >= PINCH_FRAMES_REQ and not ok_active:
                        pyautogui.press('enter')
                        gesture_text = "Enter / OK ✅"
                        ok_active = True
                else:
                    ok_count = 0
                    ok_active = False

                # ── 9. VOLUME UP (peace ✌️) ──
                if detect_peace(lm):
                    peace_count += 1
                    if peace_count >= PINCH_FRAMES_REQ and not peace_active:
                        for _ in range(3): pyautogui.press('volumeup')
                        gesture_text = "Volume Up 🔊"
                        peace_active = True
                else:
                    peace_count = 0
                    peace_active = False

                # ── 10. VOLUME DOWN (rock 🤘) ──
                if detect_rock(lm):
                    rock_count += 1
                    if rock_count >= PINCH_FRAMES_REQ and not rock_active:
                        for _ in range(3): pyautogui.press('volumedown')
                        gesture_text = "Volume Down 🔉"
                        rock_active = True
                else:
                    rock_count = 0
                    rock_active = False

            

                # ── 12. SWIPE LEFT / RIGHT ──
                now = time.time()
                pos_history.append((now, wrist[0]))
                pos_history = [p for p in pos_history if now-p[0] <= SWIPE_TIME]
                if len(pos_history) >= 2:
                    dx = pos_history[-1][1] - pos_history[0][1]
                    if abs(dx) > SWIPE_THRESHOLD and (now-last_swipe_time) > 0.8:
                        if dx < 0:
                            pyautogui.press('left')
                            gesture_text = "Swipe Left ◀"
                        else:
                            pyautogui.press('right')
                            gesture_text = "Swipe Right ▶"
                        last_swipe_time = now

                # ════ 13. NEW: OPEN GOOGLE — 3 fingers (hold 1s) ════
                if detect_three_fingers(lm):
                    if google_start is None:
                        google_start = time.time()
                    prog = hold_progress(google_start)
                    gesture_text = f"Google 🌐 {'▓'*int(prog*10)+'░'*(10-int(prog*10))} {int(prog*100)}%"
                    # Draw hold-progress arc
                    cx, cy = int(lm[9][0]*w), int(lm[9][1]*h)
                    cv2.ellipse(frame, (cx, cy-30), (22,22), -90,
                                0, int(360*prog), (0,220,80), 3)
                    if prog >= 1.0 and not google_active:
                        open_url("https://www.google.com", "Google")
                        gesture_text = "🌐 Opened Google!"
                        google_active = True
                else:
                    google_start = None
                    google_active = False

                # ════ 14. NEW: OPEN YOUTUBE — 4 fingers (hold 1s) ════
                if detect_four_fingers(lm):
                    if youtube_start is None:
                        youtube_start = time.time()
                    prog = hold_progress(youtube_start)
                    gesture_text = f"YouTube 🎬 {'▓'*int(prog*10)+'░'*(10-int(prog*10))} {int(prog*100)}%"
                    cx, cy = int(lm[9][0]*w), int(lm[9][1]*h)
                    cv2.ellipse(frame, (cx, cy-30), (22,22), -90,
                                0, int(360*prog), (0,80,255), 3)
                    if prog >= 1.0 and not youtube_active:
                        open_url("https://www.youtube.com", "YouTube")
                        gesture_text = "🎬 Opened YouTube!"
                        youtube_active = True
                else:
                    youtube_start = None
                    youtube_active = False

                # ════ 15. NEW: OPEN WIKIPEDIA — L-shape (hold 1s) ════
                if detect_l_shape(lm):
                    if wiki_start is None:
                        wiki_start = time.time()
                    prog = hold_progress(wiki_start)
                    gesture_text = f"Wikipedia 📖 {'▓'*int(prog*10)+'░'*(10-int(prog*10))} {int(prog*100)}%"
                    cx, cy = int(lm[2][0]*w), int(lm[2][1]*h)
                    cv2.ellipse(frame, (cx, cy-30), (22,22), -90,
                                0, int(360*prog), (255,180,0), 3)
                    if prog >= 1.0 and not wiki_active:
                        open_url("https://www.wikipedia.org", "Wikipedia")
                        gesture_text = "📖 Opened Wikipedia!"
                        wiki_active = True
                else:
                    wiki_start = None
                    wiki_active = False

                # ════ 16. NEW: CLOSE TAB — 5 fingers + wrist shake ════
                close_shake_hist.append((time.time(), wrist[0]))
                close_shake_hist = [(t, x) for t, x in close_shake_hist
                                    if time.time() - t <= 0.5]
                if detect_close_tab_shake(lm, close_shake_hist):
                    if not close_active and (time.time() - last_close_time) > 1.5:
                        pyautogui.hotkey('ctrl', 'w')
                        gesture_text = "❌ Close Tab!"
                        speak("Tab closed")
                        close_active = True
                        last_close_time = time.time()
                else:
                    close_active = False

                # ── Debug fingertips ──
                if debug_mode:
                    for i, (x,y,z) in enumerate(lm):
                        px, py = int(x*w), int(y*h)
                        cv2.circle(frame, (px,py), 3, (255,255,0), -1)
                        cv2.putText(frame, str(i), (px,py),
                                    cv2.FONT_HERSHEY_PLAIN, 0.6, (255,255,0), 1)

                # Draw bounding box
                xs = [int(p[0]*w) for p in lm]
                ys = [int(p[1]*h) for p in lm]
                cv2.rectangle(frame,
                              (max(0,min(xs)-15), max(0,min(ys)-15)),
                              (min(w,max(xs)+15), min(h,max(ys)+15)),
                              (0,200,255), 2)

            else:
                # Reset all counts when hand leaves frame
                pinch_count=fist_count=ok_count=double_count=0
                rock_count=peace_count=spock_count=cross_count=index_only_count=0
                last_scroll_y = None
                pos_history.clear()
                google_start = google_active = None
                youtube_start = youtube_active = None
                wiki_start = wiki_active = None
                close_shake_hist.clear()
                if drag_mode:
                    pyautogui.mouseUp()
                    drag_mode = False

            # ── Process voice commands ──
            process_voice_commands()

            # Keep last voice command on screen 3 sec
            try:
                recent_cmd = voice_queue.queue[-1] if voice_queue.queue else None
            except:
                recent_cmd = None
            if recent_cmd:
                last_voice_cmd = recent_cmd
                voice_cmd_timer = time.time()
            if time.time()-voice_cmd_timer > 3:
                last_voice_cmd = ""

            # FPS
            cur_time = time.time()
            fps = 1.0/(cur_time-fps_prev_time+1e-9)
            fps_prev_time = cur_time

            # Draw HUD
            draw_hud(frame, gesture_text, last_voice_cmd, fps, drag_mode, voice_active.is_set())
            if show_guide:
                draw_gesture_guide(frame)

            cv2.imshow("🤖 Gesture + Voice Controller v3.0  |  Press Q to quit", frame)

            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('d'):
                debug_mode = not debug_mode
                print(f"Debug mode: {'ON' if debug_mode else 'OFF'}")
            elif key == ord('v'):
                if voice_active.is_set():
                    voice_active.clear()
                    print("🔇 Voice control paused")
                else:
                    voice_active.set()
                    print("🎙️  Voice control resumed")
            elif key == ord('g'):
                show_guide = not show_guide

    except KeyboardInterrupt:
        pass
    finally:
        if drag_mode:
            pyautogui.mouseUp()
        cap.release()
        cv2.destroyAllWindows()
        hands_model.close()
        speak("Controller shutting down")
        print("\n✅ Hand Gesture + Voice Controller v3.0 exited cleanly.")

# ═══════════════════════════════════════
if __name__ == "__main__":
    main()