from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from gtts import gTTS
import torch
import librosa
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
import uuid
import os

app = Flask(__name__)
CORS(app)  # 🔥 Allow React (localhost:5173) to access API


# ================================
# LOAD STT MODEL (Speech → Text)
# ================================

MODEL_ID = "ai4bharat/indicwav2vec-hindi"

print("Loading AI4Bharat Hindi model...")

processor = Wav2Vec2Processor.from_pretrained(MODEL_ID)
model = Wav2Vec2ForCTC.from_pretrained(MODEL_ID)

device = "cuda" if torch.cuda.is_available() else "cpu"
model = model.to(device)
model.eval()

print("Model loaded successfully\n")


# =================================
# TEXT → SPEECH (TTS)
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

    # Optional: delete file after sending
    @response.call_on_close
    def cleanup():
        try:
            os.remove(audio_file)
        except:
            pass

    return response


# =================================
# SPEECH → TEXT (STT)
# =================================

@app.route("/stt", methods=["POST"])
def stt():

    if "file" not in request.files:
        return jsonify({"error": "No audio file"}), 400

    file = request.files["file"]

    # Save uploaded file (webm/opus)
    input_path = "input_audio.webm"
    file.save(input_path)

    # Convert to WAV using ffmpeg
    output_path = "converted_audio.wav"

    import subprocess

    subprocess.run([
        "ffmpeg",
        "-y",
        "-i", input_path,
        "-ar", "16000",
        "-ac", "1",
        output_path
    ])

    # Load converted audio
    speech, sr = librosa.load(output_path, sr=16000)

    inputs = processor(
        speech,
        sampling_rate=16000,
        return_tensors="pt"
    )

    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        logits = model(**inputs).logits

    predicted_ids = torch.argmax(logits, dim=-1)
    text = processor.decode(predicted_ids[0])

    # Cleanup
    os.remove(input_path)
    os.remove(output_path)

    return jsonify({"text": text})

# =================================
# ROOT ROUTE (Health Check)
# =================================

@app.route("/")
def home():
    return "Speech Server Running 🚀"


# =================================
# RUN SERVER
# =================================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)