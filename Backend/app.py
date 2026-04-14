import io
import base64
import uuid
import os
import sys

# Core Engineering: Force offline mode for semantic models to avoid 503 errors
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["HF_HUB_OFFLINE"] = "1"

import time
import threading
import re
from datetime import datetime, timezone
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import json
import requests
from urllib.parse import quote
from gtts import gTTS
from dotenv import load_dotenv

load_dotenv()
# Environment Check
GEMINI_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_KEY:
    print(f"🔑 Gemini API Key: Detected (ends in ...{GEMINI_KEY[-4:]})")
else:
    print("❌ Gemini API Key: NOT DETECTED! Feedback will be limited.")

GEMINI_MODEL = "gemini-3.1-flash-lite-preview"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_KEY}" if GEMINI_KEY else None
from scene_engine.dialogue_manager import handle_message
from scene_engine.state_manager import get_state, init_state, undo_state
from scene_engine.scene_loader import load_scene
from scene_engine.intent_detection import detect_intent_with_score
from scene_engine.entity_extractor import prewarm_sbert
from scene_engine.vision_detector import detect_objects_in_image
# Unused imports removed for speed and clean terminal
# from scene_engine.feedback_engine import generate_turn_feedback

from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

# Buffer to hold audio feedback until the next chat request
AUDIO_FEEDBACK_BUFFER = {} # key: user_id or "global", value: feedback_dict

# =================================
# DATABASE CONFIGURATION
# =================================
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///lingofy.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    level = db.Column(db.String(50), default='Beginner') # Store user level (Beginner, Intermediate, Advanced)
    study_time = db.Column(db.Integer, default=0) # Total study seconds
    streak = db.Column(db.Integer, default=1) # User day streak
    daily_goal = db.Column(db.Integer, default=10) # Lesson goal per day

class Progress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    module_name = db.Column(db.String(100), nullable=False)
    score = db.Column(db.Integer, default=0)
    status = db.Column(db.String(50), default='in_progress')
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class Vocabulary(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String(100), unique=True, nullable=False)
    translation = db.Column(db.String(100), nullable=False)
    example = db.Column(db.Text, nullable=True)
    gender = db.Column(db.String(20), nullable=True)
    plural = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

with app.app_context():
    db.create_all()
    # Simple migration: Add columns if missing
    try:
        from sqlalchemy import text
        db.session.execute(text("ALTER TABLE progress ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"))
        db.session.commit()
    except Exception:
        db.session.rollback()

    try:
        from sqlalchemy import text
        db.session.execute(text("ALTER TABLE user ADD COLUMN level VARCHAR(50) DEFAULT 'Beginner'"))
        db.session.commit()
    except Exception:
        db.session.rollback()

    try:
        from sqlalchemy import text
        db.session.execute(text("ALTER TABLE vocabulary ADD COLUMN gender VARCHAR(20)"))
        db.session.execute(text("ALTER TABLE vocabulary ADD COLUMN plural VARCHAR(100)"))
        db.session.commit()
    except Exception:
        db.session.rollback()

# =================================
# CLOUD STT CONFIG
# Fully cloud-based STT using HF Space (no local ML processing)
# =================================
STT_URLS = [
    url.strip()
    for url in os.environ.get(
        "LINGOFY_STT_URLS",
        "https://vai2719-lingofy-speech.hf.space/stt",
    ).split(",")
    if url.strip()
]

from werkzeug.security import generate_password_hash, check_password_hash

# =================================
# DATABASE AUTH & PROGRESS ROUTES
# =================================
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.json
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"error": "Email already exists"}), 400
    
    hashed_pw = generate_password_hash(data.get('password'))
    new_user = User(
        name=data.get('name', 'Student'),
        email=data.get('email'),
        password=hashed_pw
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Success", "user": {"id": new_user.id, "name": new_user.name, "email": new_user.email, "level": new_user.level}})

@app.route("/api/login", methods=["POST"])
def login_route():
    data = request.json
    user = User.query.filter_by(email=data.get('email')).first()
    
    if user:
        # Check both hash OR plaintext (to support dev accounts created before hashing)
        if check_password_hash(user.password, data.get('password')) or user.password == data.get('password'):
            return jsonify({"message": "Success", "user": {"id": user.id, "name": user.name, "email": user.email, "level": user.level}})
            
    return jsonify({"error": "Invalid email or password"}), 401

@app.route("/api/update-level", methods=["POST"])
def update_level():
    data = request.json
    email = data.get('email')
    new_level = data.get('level')
    
    user = User.query.filter_by(email=email).first()
    if user:
        user.level = new_level
        db.session.commit()
        return jsonify({"message": "Level updated", "level": user.level})
    return jsonify({"error": "User not found"}), 404

@app.route("/api/user-data", methods=["POST", "GET"])
def manage_user_sync():
    email = request.args.get('email')
    if request.method == "POST":
        data = request.json
        email = data.get('email')
        user = User.query.filter_by(email=email).first()
        if user:
            # Only update if the incoming value is greater (prevents race condition overwrites)
            if data.get('study_time'):
                user.study_time = max(user.study_time, data.get('study_time'))
            if data.get('streak'):
                user.streak = max(user.streak, data.get('streak'))
            if data.get('level'):
                user.level = data.get('level')
            if data.get('daily_goal'):
                user.daily_goal = data.get('daily_goal')
            db.session.commit()
            return jsonify({"message": "Synced", "level": user.level, "study_time": user.study_time, "streak": user.streak, "daily_goal": user.daily_goal})
        return jsonify({"error": "User not found"}), 404
        
    user = User.query.filter_by(email=email).first()
    if user:
        # Calculate consistency/accuracy from actual progress history
        records = Progress.query.filter_by(user_id=user.id).all()
        avg_acc = 0
        if records:
            avg_acc = round(sum([r.score or 0 for r in records]) / len(records))
            
        return jsonify({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "level": user.level,
            "study_time": user.study_time,
            "streak": user.streak,
            "daily_goal": user.daily_goal,
            "avg_accuracy": avg_acc,
            "total_xp": user.level_xp if hasattr(user, 'level_xp') else 0
        })
    return jsonify({"error": "User not found"}), 404

@app.route("/api/progress", methods=["POST", "GET"])
def manage_progress():
    if request.method == "POST":
        data = request.json
        user_id = data.get('user_id')
        module_name = data.get('module_name')
        progress = Progress.query.filter_by(user_id=user_id, module_name=module_name).first()
        if not progress:
            progress = Progress(user_id=user_id, module_name=module_name)
            db.session.add(progress)
        progress.score = data.get('score', progress.score)
        progress.status = data.get('status', progress.status)
        db.session.commit()
        return jsonify({"message": "Progress saved"})
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify([])
    records = Progress.query.filter_by(user_id=user_id).all()
    return jsonify([{"module": r.module_name, "score": r.score, "status": r.status, "date": r.created_at.isoformat() if r.created_at else None} for r in records])

# =================================
# Logic-based Placement Quiz (Student Built System)
# =================================
# A simple local database of questions with assigned difficulty weights
QUESTION_BANK = [
    {"id": 1, "difficulty": 10, "q": "How do you say 'Hello' in Hindi?", "options": ["नमस्ते", "शुक्रिया", "अलविदा", "सुप्रभात"], "correct": 0},
    {"id": 2, "difficulty": 20, "q": "Translate 'Water' into Hindi.", "options": ["आग", "पानी", "हवा", "ज़मीन"], "correct": 1},
    {"id": 3, "difficulty": 30, "q": "Translate: 'The water is cold'.", "options": ["पानी गरम है", "पानी ठंडा है", "पानी मीठा है", "पानी नीला है"], "correct": 1},
    {"id": 4, "difficulty": 40, "q": "Which of these means 'Food'?", "options": ["खाना", "पीना", "सोना", "रोना"], "correct": 0},
    {"id": 5, "difficulty": 50, "q": "Translate: 'I am going to the market'.", "options": ["मैं घर जा रहा हूँ", "मैं बाज़ार जा रहा हूँ", "मैं सो रहा हूँ", "मैं खा रहा हूँ"], "correct": 1},
    {"id": 6, "difficulty": 60, "q": "Which word means 'Office' or 'Workplace'?", "options": ["दफ्तर", "घर", "दुकान", "सड़क"], "correct": 0},
    {"id": 7, "difficulty": 70, "q": "Translate 'Environment' to Hindi.", "options": ["संविधान", "शासन", "पर्यावरण", "प्रौद्योगिकी"], "correct": 2},
    {"id": 8, "difficulty": 80, "q": "Which word means 'Negotiation'?", "options": ["मूल्यांकन", "संगठन", "मोलभाव", "आरक्षण"], "correct": 2},
    {"id": 9, "difficulty": 90, "q": "Select the proper word for 'Constitution'.", "options": ["कानून", "प्रशासन", "न्याय", "संविधान"], "correct": 3},
    {"id": 10, "difficulty": 100, "q": "What does 'पांडुलिपि' (Pandulipi) refer to?", "options": ["A published book", "A handwritten manuscript", "A poem", "A philosophy textbook"], "correct": 1},
]

@app.route("/api/placement-quiz/next", methods=["GET"])
def next_adaptive_question():
    """
    Weighted Point System / State logic:
    Finds a question matching the user's current accumulated points.
    """
    try:
        current_points = int(request.args.get('points', 30))  # Start at medium 30 points
        asked_ids = request.args.get('asked', '')
        asked_ids_list = [int(x) for x in asked_ids.split(',')] if asked_ids else []

        # Filter out questions already asked
        available_questions = [q for q in QUESTION_BANK if q['id'] not in asked_ids_list]
        
        if not available_questions:
            return jsonify({"error": "No more questions"}), 404

        # Simple algorithm: Find the question closest to the user's points
        best_question = min(available_questions, key=lambda q: abs(q['difficulty'] - current_points))
        
        return jsonify(best_question)
    except Exception as e:
        print(f"[Quiz Algorithm Error] {e}")
        return jsonify(QUESTION_BANK[0])


# =================================
# TTS — Pure in-memory stream, no disk, no lag
# =================================
@app.route("/tts", methods=["POST"])
def tts():
    data = request.get_json()
    text = data.get("text", "").strip()
    if not text:
        return jsonify({"error": "No text provided"}), 400
    try:
        tts_obj = gTTS(text=text, lang='hi')
        fp = io.BytesIO()
        tts_obj.write_to_fp(fp)
        fp.seek(0)
        return send_file(fp, mimetype="audio/mpeg", download_name="speech.mp3")
    except Exception as e:
        print(f"TTS Error: {e}")
        return jsonify({"error": str(e)}), 500


from deep_translator import GoogleTranslator

@app.route("/translate", methods=["POST"])
def translate_text():
    """
    Lightweight translation endpoint using Google Translate via deep-translator.
    Automatically detects source language if not provided.
    """
    data = request.get_json() or {}
    text = (data.get("text") or "").strip()
    source = (data.get("source") or "auto").strip() # Changed default to 'auto' to fix the English issue
    target = (data.get("target") or "en").strip()

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        translated = GoogleTranslator(source=source, target=target).translate(text)
        if translated:
            return jsonify({"translation": translated})
    except Exception as e:
        print(f"[Translate Error] {e}")

    # Fallback keeps UI responsive even when translation service fails.
    return jsonify({"translation": "Translation unavailable right now."})

# =================================
# STT — Cloud failover + instant response
# Audio feedback runs in background (non-blocking)
# =================================
@app.route('/api/save-progress', methods=['POST'])
def save_progress():
    data = request.json
    email = data.get('email')
    module = data.get('module')
    score = data.get('score')
    completed = data.get('completed', True)

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    from datetime import datetime
    # ALWAYS add a new record to support history, cumulative XP, and moving accuracy average
    progress = Progress(
        user_id=user.id, 
        module_name=module, 
        score=score if score is not None else 0, 
        status='completed' if completed else 'in_progress',
        created_at=datetime.now(timezone.utc)
    )
    db.session.add(progress)
    db.session.commit()
    return jsonify({"message": "Progress saved"}), 200

@app.route('/api/get-progress', methods=['GET'])
def get_progress():
    email = request.args.get('email')
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    progress_list = Progress.query.filter_by(user_id=user.id).all()
    results = [
        {"module": p.module_name, "score": p.score, "status": p.status, "date": p.created_at.isoformat() if p.created_at else None}
        for p in progress_list
    ]
    return jsonify(results), 200

def _call_cloud_stt(audio_bytes, filename="recording.webm", content_type="audio/webm"):
    """Call cloud STT service. Return text on success."""
    for url in STT_URLS:
        for attempt in range(3):
            try:
                print(f"📡 STT → {url} (format: {content_type}, attempt {attempt + 1}/3)")
                resp = requests.post(
                    url,
                    files={'file': (filename, audio_bytes, content_type)},
                    headers={'ngrok-skip-browser-warning': 'true'},
                    timeout=25
                )
                if resp.status_code == 200:
                    text = resp.json().get("text", "").strip()
                    print(f"✅ STT got: {text!r}")
                    return text
                print(f"⚠️  STT non-200 from {url}: {resp.status_code}")
            except Exception as e:
                print(f"⚠️  STT failed ({url}): {e}")
            # small exponential backoff before retrying this endpoint
            time.sleep(0.4 * (2 ** attempt))
    return ""


def _check_stt_endpoint(url: str) -> bool:
    """Basic endpoint reachability check for STT."""
    try:
        resp = requests.options(url, timeout=5)
        return resp.status_code < 500
    except Exception:
        return False


@app.route("/stt-health", methods=["GET"])
def stt_health():
    statuses = []
    any_ok = False
    for url in STT_URLS:
        ok = _check_stt_endpoint(url)
        statuses.append({"url": url, "ok": ok})
        any_ok = any_ok or ok
    return jsonify({"ok": any_ok, "endpoints": statuses}), (200 if any_ok else 503)


def _warmup_services_bg():
    """Warmup external services and semantic model in background."""
    try:
        for url in STT_URLS:
            ok = _check_stt_endpoint(url)
            print(f"🔎 STT warmup {url}: {'OK' if ok else 'NOT_REACHABLE'}")
    except Exception as e:
        print(f"[Warmup] STT warmup failed: {e}")
    try:
        sbert_ok = prewarm_sbert()
        print(f"🧠 SBERT warmup: {'READY' if sbert_ok else 'FALLBACK_MODE'}")
    except Exception as e:
        print(f"[Warmup] SBERT warmup failed: {e}")

def _run_audio_feedback_bg(audio_bytes, scene_name, transcribed_text, user_id, expected_text=""):
    """Fire hybrid pronunciation and grammar feedback in parallel."""
    try:
        from scene_engine.audio_feedback_engine import generate_audio_feedback
        from scene_engine.feedback_engine import generate_turn_feedback
        from scene_engine.scene_loader import load_scene
        from scene_engine.state_manager import get_state
        import concurrent.futures

        # Skip if no transcribed text
        if not transcribed_text.strip():
            AUDIO_FEEDBACK_BUFFER.pop(user_id, None)
            return

        # Write bytes to a temp file
        tmp = f"fb_{uuid.uuid4()}.webm"
        with open(tmp, "wb") as f:
            f.write(audio_bytes)
        
        scene = load_scene(scene_name)
        if not scene:
            scene = {
                "scene": scene_name,
                "ui": {"title": scene_name.replace("_", " ").capitalize()},
                "slots": [],
                "goal_labels": {}
            }
        state = get_state(user_id, scene) or {"slots": {}}

        # Run both in parallel
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            f_audio = executor.submit(generate_audio_feedback, tmp, scene_name, expected_text)
            f_text = executor.submit(generate_turn_feedback, transcribed_text, scene, state, expected_text=expected_text)
            
            # Wait for results (timeout at 15s)
            audio_fb = f_audio.result(timeout=15)
            text_fb = f_text.result(timeout=15)

        try: os.remove(tmp)
        except: pass

        # 3. MERGE RESULTS
        # Use simple averages for scores
        p_score = audio_fb.get("score") if isinstance(audio_fb, dict) else 0
        g_score = text_fb.get("grammar_score") if isinstance(text_fb, dict) else 0
        s_score = text_fb.get("spelling_score") if isinstance(text_fb, dict) else 0
        
        combined_score = 0
        divisor = 0
        if p_score is not None: combined_score += p_score; divisor += 1
        if g_score is not None: combined_score += g_score; divisor += 1
        if s_score is not None: combined_score += s_score; divisor += 1
        
        final_score = combined_score // divisor if divisor > 0 else 75

        # Combined tip
        a_tip = (audio_fb or {}).get('tip', '')
        t_tip = (text_fb or {}).get('tip', '')
        tip = f"{a_tip} {t_tip}".strip() or "Keep practicing!"
        
        # Combined suggestion (prefer grammar suggestion as it's correctly spelled Devanagari)
        suggestion = (text_fb or {}).get("suggestion") or (audio_fb or {}).get("suggestion") or transcribed_text

        merged_result = {
            "score": final_score,
            "pronunciation_score": p_score,
            "grammar_score": g_score,
            "spelling_score": s_score,
            "tip": tip,
            "suggestion": suggestion,
            "accuracy_details": (audio_fb or {}).get("accuracy_details") if isinstance(audio_fb, dict) else None,
            "grammar_points": (text_fb or {}).get("grammar_points") if isinstance(text_fb, dict) else []
        }

        AUDIO_FEEDBACK_BUFFER[user_id] = merged_result
        print(f"📦 Hybrid feedback cached for {user_id}: {merged_result}")

    except Exception as e:
        print(f"[Feedback BG] Error: {e}")
        AUDIO_FEEDBACK_BUFFER.pop(user_id, None)

@app.route("/stt", methods=["POST"])
def stt():
    if "file" not in request.files:
        return jsonify({"error": "No audio file"}), 400

    # Read entire audio into memory once — avoids race conditions from multiple readers
    audio_file = request.files["file"]
    audio_bytes = audio_file.read()
    filename = audio_file.filename or "recording.webm"
    content_type = "audio/mp4" if filename.endswith(".mp4") else "audio/webm"
    scene_name = request.form.get("scene", "cafe")
    user_id    = request.form.get("user_id", "default")
    expected_text = request.form.get("expected_text", "")

    print(f"🎙️ Received audio: {filename} ({len(audio_bytes)} bytes) type={content_type}")

    # ── STT: call cloud, get text ──
    transcribed_text = _call_cloud_stt(audio_bytes, filename, content_type)

    # ── Audio feedback: fire and forget in background ──
    AUDIO_FEEDBACK_BUFFER[user_id] = "pending"
    threading.Thread(
        target=_run_audio_feedback_bg,
        args=(audio_bytes, scene_name, transcribed_text, user_id, expected_text),
        daemon=True
    ).start()

    if not transcribed_text.strip():
        return jsonify({"text": transcribed_text, "error": "No speech detected"})

    # Wait a short moment for background feedback if it's a simple lesson (no /chat call follows)
    # This specifically helps the 'SpeakingPractice' component
    feedback_result = None
    is_lesson = scene_name.startswith("lesson_") or scene_name == "basic_greetings"
    if is_lesson:
        waits = 0
        # Increased to 10 seconds for more thorough AI analysis
        while AUDIO_FEEDBACK_BUFFER.get(user_id) == "pending" and waits < 100:
            time.sleep(0.1)
            waits += 1
            
        feedback_result = AUDIO_FEEDBACK_BUFFER.get(user_id)
        if feedback_result == "pending":
            print(f"⚠️ [Feedback] Timeout for {user_id} ({waits} waits)")
            feedback_result = None
        else:
            feedback_result = AUDIO_FEEDBACK_BUFFER.pop(user_id, None)

    # ── Return ──
    return jsonify({
        "text": transcribed_text,
        "feedback": feedback_result
    })

# =================================
# VISION — YOLO + Gemini Hybrid
# =================================
@app.route("/api/vision/detect", methods=["POST"])
def vision_detect():
    """Detect objects in a base64 image using local YOLO."""
    data = request.json
    if not data or 'image' not in data:
        return jsonify({"error": "No image provided"}), 400

    try:
        # Decode base64
        img_data = data['image'].split(',')[-1]
        img_bytes = base64.b64decode(img_data)
        
        # Save temp image for YOLO (it expects a path)
        temp_path = f"vision_{uuid.uuid4()}.jpg"
        from PIL import Image
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        
        # Optimize for speed
        if max(img.size) > 640:
            img.thumbnail((640, 640), Image.LANCZOS)
        
        img.save(temp_path)
        
        # Local YOLO Detection
        detections = detect_objects_in_image(temp_path)
        
        # Get image dimensions to normalize coordinates
        width, height = img.size
        
        objects = []
        seen = set()
        for i, d in enumerate(detections):
            if d["confidence"] < 0.30 or d["label"] in seen:
                continue
            seen.add(d["label"])
            
            # Normalize coordinates to 0-100%
            x1, y1, x2, y2 = d["bbox"]
            px1 = (x1 / width) * 100
            py1 = (y1 / height) * 100
            px2 = (x2 / width) * 100
            py2 = (y2 / height) * 100
            
            objects.append({
                "id": i,
                "name": d["label"],
                "confidence": round(d["confidence"], 2),
                "center": {
                    "x": (px1 + px2) / 2,
                    "y": (py1 + py2) / 2
                },
                "box": { "x1": px1, "y1": py1, "x2": px2, "y2": py2 }
            })
            
        # ── HYBRID FALLBACK: If YOLO finds nothing or very few objects, use Gemini Vision ──
        if len(objects) < 2 and GEMINI_KEY:
            try:
                print("🧠 YOLO missed or was unsure. Calling Gemini Vision for deeper analysis...")
                prompt = """Analyze this image. List up to 6 distinct objects visible. 
                For each object, provide its name (English) and its approximate center coordinates as percentages (0-100).
                Format your response ONLY as a JSON list like this:
                [{"name": "cupboard", "x": 45, "y": 60}, {"name": "spectacles", "x": 20, "y": 30}]
                """
                
                vision_payload = {
                    "contents": [{
                        "parts": [
                            {"text": prompt},
                            {"inline_data": {"mime_type": "image/jpeg", "data": img_data}}
                        ]
                    }]
                }
                
                v_res = requests.post(GEMINI_URL, json=vision_payload, timeout=12)
                v_data = v_res.json()
                v_text = v_data['candidates'][0]['content']['parts'][0]['text']
                
                # Extract JSON from potential markdown
                import re
                match = re.search(r'\[.*\]', v_text, re.DOTALL)
                if match:
                    gemini_objects = json.loads(match.group())
                    for idx, go in enumerate(gemini_objects):
                        g_name = go.get('name', '').lower()
                        if g_name and g_name not in seen:
                            seen.add(g_name)
                            objects.append({
                                "id": f"g_{idx}",
                                "name": g_name,
                                "confidence": 0.95, # Gemini is highly confident
                                "center": { "x": go.get('x', 50), "y": go.get('y', 50) },
                                "is_ai": True
                            })
            except Exception as ve:
                print(f"⚠️ Gemini Vision fallback failed: {ve}")

        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        return jsonify({"objects": objects[:10]})
    except Exception as e:
        print(f"[Vision Detect] Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/vision/word/<name>", methods=["GET"])
def get_vision_word(name):
    """Fetch Hindi translation and example from Cache or Gemini."""
    # 1. Check Cache
    cached = Vocabulary.query.filter_by(word=name).first()
    if cached:
        return jsonify({
            "word": cached.word,
            "translation": cached.translation,
            "example": cached.example,
            "gender": cached.gender,
            "plural": cached.plural
        })

    # 2. Fetch from Gemini
    if not GEMINI_KEY:
        return jsonify({
            "word": name,
            "translation": name,
            "example": "Hindi translation preview unavailable without API Key.",
            "gender": "Unknown",
            "plural": "Unknown"
        })

    prompt = f"""Provide the Hindi translation (Devanagari text), grammatial gender (Note: In Hindi, every noun has a strict Grammatical Gender, e.g. Masculine/Feminine, regardless of biological sex), plural form in Hindi (Devanagari), and a simple 1-line Hindi example sentence (in Devanagari) for the object: '{name}'.
    Return ONLY JSON:
    {{
      "translation": "Hindi translation here",
      "gender": "Masculine / Feminine",
      "plural": "Plural in Hindi here",
      "example": "MANDATORY: A simple Hindi sentence using the word in DEVANAGARI SCRIPT ONLY. DO NOT USE ANY ENGLISH CHARACTERS."
    }}"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 100}
    }

    try:
        resp = requests.post(GEMINI_URL, json=payload, timeout=8)
        resp.raise_for_status()
        raw_text = resp.json()['candidates'][0]['content']['parts'][0]['text']
        match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if match:
            res_json = json.loads(match.group())
            new_entry = Vocabulary(
                word=name,
                translation=res_json.get("translation", name),
                example=res_json.get("example", ""),
                gender=res_json.get("gender", ""),
                plural=res_json.get("plural", "")
            )
            db.session.add(new_entry)
            db.session.commit()
            return jsonify({
                "word": name,
                "translation": new_entry.translation,
                "example": new_entry.example,
                "gender": new_entry.gender,
                "plural": new_entry.plural
            })
    except Exception as e:
        print(f"[Vision Word] Error: {e}")

    return jsonify({"word": name, "translation": name, "example": "No example found.", "gender": "Unknown", "plural": "Unknown"})

# =================================
# CHAT (text input path)
# =================================
@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_id    = data.get("user_id", "default")
    scene_name = data.get("scene", "cafe")
    message    = data["message"]

    scene = load_scene(scene_name)
    result = handle_message(user_id, message, scene)
    state  = get_state(user_id, scene)

    # Check for pending audio feedback (pronunciation) from the STT call
    waits = 0
    while AUDIO_FEEDBACK_BUFFER.get(user_id) == "pending" and waits < 50:
        time.sleep(0.1)
        waits += 1

    audio_feedback = AUDIO_FEEDBACK_BUFFER.pop(user_id, None)
    if isinstance(audio_feedback, dict) and result.get("feedback"):
        # Merge audio feedback into text feedback
        result["feedback"]["pronunciation_score"] = audio_feedback.get("score")
        result["feedback"]["pronunciation_tip"] = audio_feedback.get("tip")
        result["feedback"]["suggestion"] = audio_feedback.get("suggestion") or result["feedback"].get("suggestion")

    return jsonify({
        "reply":    result["reply"],
        "feedback": result["feedback"],
        "slots":    state["slots"],
        "status":   state["status"]
    })

from scene_engine.state_manager import get_state, init_state, undo_state
# ...
@app.route("/undo", methods=["POST"])
def undo():
    data = request.json
    user_id    = data.get("user_id", "default")
    scene_name = data.get("scene", "cafe")
    scene = load_scene(scene_name)
    success = undo_state(user_id, scene)
    
    # We also return the current slots/status so the frontend can sync
    state = get_state(user_id, scene)
    return jsonify({
        "success": success,
        "slots":   state["slots"],
        "status":  state["status"]
    })

@app.route("/reset-session", methods=["POST"])
def reset_session():
    data = request.json
    user_id    = data.get("user_id", "default")
    scene_name = data.get("scene", "cafe")
    scene = load_scene(scene_name)
    init_state(user_id, scene)
    return jsonify({"status": "reset"})

# =================================
# SCENES
# =================================
@app.route("/scenes", methods=["GET"])
def list_scenes():
    scenes_dir = "scenes"
    scene_list = []
    if os.path.exists(scenes_dir):
        for filename in os.listdir(scenes_dir):
            if filename.endswith(".json"):
                with open(os.path.join(scenes_dir, filename), 'r', encoding='utf-8') as f:
                    try:
                        data = json.load(f)
                        scene_list.append({
                            "id":          data.get("scene", filename.replace(".json", "")),
                            "title":       data.get("ui", {}).get("title", filename.replace(".json", "").capitalize()),
                            "description": data.get("ui", {}).get("description", "A conversation scene"),
                            "icon":        data.get("ui", {}).get("icon", "MessageSquare"),
                            "gradient":    data.get("ui", {}).get("gradient", "from-slate-500 to-slate-600"),
                            "level":       data.get("ui", {}).get("level", "Beginner"),
                            "turns":       data.get("ui", {}).get("turns", 10)
                        })
                    except:
                        pass
    return jsonify(scene_list)

@app.route("/scene/<scene_name>", methods=["GET"])
@app.route("/scene-data/<scene_name>", methods=["GET"])
def get_scene_data(scene_name):
    try:
        scene = load_scene(scene_name)
        return jsonify({
            "scene":       scene.get("scene", scene_name),
            "slots":       scene.get("slots", []),
            "prompts":     scene.get("prompts", {}),
            "goal_labels": scene.get("goal_labels", {}),
            "ui":          scene.get("ui", {}),
            "templates":   scene.get("templates", {})
        })
    except Exception as e:
        print(f"Error loading scene {scene_name}: {e}")
        return jsonify({"error": "Scene not found"}), 404

@app.route("/")
def home():
    return "Lingofy Unified Backend Running 🚀"

if __name__ == "__main__":
    print()
    print("🚀 Starting Unified Lingofy Backend (Optimized for Stability)")
    print("📡 STT Interface: Cloud-based (HuggingFace Space)")
    print("🗣️  TTS Engine: Local gTTS (Lightweight)")
    print("🎯 Scene Engine: Hybrid Gemini 1.5-Pro")
    print("🛡️  Threaded mode enabled for parallel feedback")
    print()
    threading.Thread(target=_warmup_services_bg, daemon=True).start()
    # Debug is set to False here to prevent duplicate model loading and watchdog hangs on Windows
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
