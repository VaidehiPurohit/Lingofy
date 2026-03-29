from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import json
import uuid
import requests
import io
import threading
from concurrent.futures import ThreadPoolExecutor
from gtts import gTTS

# Scene Engine Imports
from scene_engine.dialogue_manager import handle_message
from scene_engine.state_manager import get_state, init_state
from scene_engine.scene_loader import load_scene
from scene_engine.intent_detection import detect_intent_with_score
from scene_engine.feedback_engine import generate_turn_feedback

from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

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

class Progress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    module_name = db.Column(db.String(100), nullable=False)
    score = db.Column(db.Integer, default=0)
    status = db.Column(db.String(50), default='in_progress')

with app.app_context():
    db.create_all()

# =================================
# CLOUD STT CONFIG
# Fully cloud-based STT using HF Space (no local ML processing)
# =================================
STT_URLS = [
    "https://vai2719-lingofy-speech.hf.space/stt",
]

# =================================
# DATABASE AUTH & PROGRESS ROUTES
# =================================
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.json
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"error": "Email already exists"}), 400
    new_user = User(
        name=data.get('name', 'Student'),
        email=data.get('email'),
        password=data.get('password')
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Success", "user": {"id": new_user.id, "name": new_user.name, "email": new_user.email}})

@app.route("/api/login", methods=["POST"])
def login_route():
    data = request.json
    user = User.query.filter_by(email=data.get('email'), password=data.get('password')).first()
    if user:
        return jsonify({"message": "Success", "user": {"id": user.id, "name": user.name, "email": user.email}})
    return jsonify({"error": "Invalid email or password"}), 401

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
    return jsonify([{"module": r.module_name, "score": r.score, "status": r.status} for r in records])

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
        tts_obj = gTTS(text=text, lang="hi")
        fp = io.BytesIO()
        tts_obj.write_to_fp(fp)
        fp.seek(0)
        return send_file(fp, mimetype="audio/mpeg", download_name="speech.mp3")
    except Exception as e:
        print(f"TTS Error: {e}")
        return jsonify({"error": str(e)}), 500

# =================================
# STT — Cloud failover + instant response
# Audio feedback runs in background (non-blocking)
# =================================
def _call_cloud_stt(audio_bytes):
    """Call cloud STT service. Return text on success."""
    url = STT_URLS[0]  # Only one URL now
    try:
        print(f"📡 STT → {url}")
        resp = requests.post(
            url,
            files={'file': ('recording.webm', audio_bytes, 'audio/webm')},
            headers={'ngrok-skip-browser-warning': 'true'},
            timeout=8  # Reduced timeout for faster response
        )
        if resp.status_code == 200:
            text = resp.json().get("text", "").strip()
            print(f"✅ STT got: {text!r}")
            return text
    except Exception as e:
        print(f"⚠️  STT failed: {e}")
    return ""

def _run_audio_feedback_bg(audio_bytes, scene_name, transcribed_text):
    """Fire lightweight pronunciation feedback in background. Does not block the response."""
    try:
        # Skip if no transcribed text (no speech detected)
        if not transcribed_text.strip():
            return

        from scene_engine.audio_feedback_engine import generate_audio_feedback
        # Write bytes to a temp file for the feedback engine
        tmp = f"fb_{uuid.uuid4()}.webm"
        with open(tmp, "wb") as f:
            f.write(audio_bytes)
        generate_audio_feedback(tmp, scene_name)
        try: os.remove(tmp)
        except: pass
    except Exception as e:
        print(f"[Feedback BG] Error: {e}")

@app.route("/stt", methods=["POST"])
def stt():
    if "file" not in request.files:
        return jsonify({"error": "No audio file"}), 400

    # Read entire audio into memory once — avoids race conditions from multiple readers
    audio_bytes = request.files["file"].read()
    scene_name = request.form.get("scene", "cafe")
    user_id    = request.form.get("user_id", "default")

    # ── STT: call cloud, get text ──
    transcribed_text = _call_cloud_stt(audio_bytes)

    # ── Intent detection (hybrid intelligence) ──
    scene = load_scene(scene_name)
    intent, intent_confidence = detect_intent_with_score(transcribed_text, scene)

    # ── Audio feedback: fire and forget in background ──
    threading.Thread(
        target=_run_audio_feedback_bg,
        args=(audio_bytes, scene_name, transcribed_text),
        daemon=True
    ).start()

    if not transcribed_text.strip():
        return jsonify({"text": "", "error": "No speech detected", "intent": None, "intent_confidence": 0.0})

    # ── Chat logic: inline, no extra round-trip ──
    chat_result = handle_message(user_id, transcribed_text, scene)
    state = get_state(user_id, scene)

    # ── Hybrid turn feedback (LLM) ──
    stt_feedback = chat_result.get("feedback")
    if stt_feedback is None:
        stt_feedback = generate_turn_feedback(transcribed_text, scene, state) or {"score": None, "tip": "Great attempt!", "suggestion": ""}

    return jsonify({
        "text":                transcribed_text,
        "intent":              intent,
        "intent_confidence":   intent_confidence,
        "reply":               chat_result.get("reply"),
        "feedback":            stt_feedback,
        "audio_feedback":      None,                         # pronunciation feedback comes async
        "slots":               state.get("slots", {}),
        "status":              state.get("status", "unknown")
    })

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

    return jsonify({
        "reply":    result["reply"],
        "feedback": result["feedback"],
        "slots":    state["slots"],
        "status":   state["status"]
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

@app.route("/scene-data/<scene_name>", methods=["GET"])
def get_scene_data(scene_name):
    try:
        scene = load_scene(scene_name)
        return jsonify({
            "slots":       scene["slots"],
            "prompts":     scene["prompts"],
            "goal_labels": scene.get("goal_labels", {}),
            "ui":          scene.get("ui", {})
        })
    except:
        return jsonify({"error": "Scene not found"}), 404

@app.route("/")
def home():
    return "Lingofy Unified Backend Running 🚀"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
