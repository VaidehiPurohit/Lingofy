from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from gtts import gTTS
import uuid
import os
import requests
import subprocess

app = Flask(__name__)
CORS(app)  # 🔥 Allow React (localhost:5173) to access API

# This securely targets your new Hugging Face Server
HF_SPACE_URL = "https://vai2719-lingofy-speech.hf.space/stt"


# =================================
# TEXT → SPEECH (TTS) (Runs Locally)
# =================================
def text_to_speech(text):
    filename = f"tts_{uuid.uuid4()}.mp3"
    tts = gTTS(text=text, lang="hi")
    tts.save(filename)
    return filename

@app.route("/tts", methods=["POST"])
def tts():
    data = request.get_json()
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    audio_file = text_to_speech(text)
    response = send_file(audio_file, mimetype="audio/mpeg")

    @response.call_on_close
    def cleanup():
        try:
            os.remove(audio_file)
        except:
            pass

    return response


# =================================
# SPEECH → TEXT (STT) (Forwarded to Cloud API)
# =================================
@app.route("/stt", methods=["POST"])
def stt():
    if "file" not in request.files:
        return jsonify({"error": "No audio file"}), 400

    file = request.files["file"]

    # Save uploaded file
    input_path = "input_audio.webm"
    file.save(input_path)

    # Convert to WAV for local feedback engine
    output_path = "converted_audio.wav"
    subprocess.run(["ffmpeg", "-y", "-i", input_path, "-ar", "16000", "-ac", "1", output_path], check=False)

    try:
        # Offload exactly 99% of CPU usage: Forward audio to your NEW Cloud Server
        with open(input_path, "rb") as f:
            files_to_send = {'file': ('input.webm', f, 'audio/webm')}
            hf_response = requests.post(HF_SPACE_URL, files=files_to_send, timeout=120)

        hf_data = hf_response.json()
        transcribed_text = hf_data.get("text", "")
    except Exception as e:
        print(f"Error accessing Hugging Face Cloud Server: {e}")
        transcribed_text = "Error connecting to cloud server."

    # --- GET AUDIO FEEDBACK (Local) ---
    scene_name = request.form.get("scene", "Unknown Scene")
    
    import sys
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    try:
        from scene_engine.audio_feedback_engine import generate_audio_feedback
        audio_feedback = generate_audio_feedback(output_path, scene_name)
    except Exception as e:
        print(f"Error loading audio feedback engine: {e}")
        audio_feedback = None

    # Cleanup Local Drive
    try:
        os.remove(input_path)
        os.remove(output_path)
    except:
        pass

    return jsonify({"text": transcribed_text, "audio_feedback": audio_feedback})


# =================================
# ROOT ROUTE (Health Check)
# =================================
@app.route("/")
def home():
    return "Hybrid Cloud Speech Proxy Running 🚀"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)