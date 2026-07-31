from flask import Flask, request, jsonify
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
import torch
import librosa
import os
import subprocess
from huggingface_hub import login

app = Flask(__name__)

# Read the secret token injected by HF Space Settings → "Variables and secrets"
HF_TOKEN = os.environ.get("HF_TOKEN")
if HF_TOKEN:
    print("✅ HF_TOKEN found — logging in to access gated model...")
    login(token=HF_TOKEN)
else:
    print("⚠️ WARNING: HF_TOKEN not set. Download of gated model will fail!")

MODEL_ID = "ai4bharat/indicwav2vec-hindi"
print(f"📦 Loading model: {MODEL_ID} ...")
processor = Wav2Vec2Processor.from_pretrained(MODEL_ID, token=HF_TOKEN)
model = Wav2Vec2ForCTC.from_pretrained(MODEL_ID, token=HF_TOKEN)
model.eval()
print("✅ Model loaded successfully!")

@app.route("/")
def home():
    return "Lingofy Speech Server — ai4bharat Model Running 🚀"

@app.route("/stt", methods=["POST"])
def stt():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files["file"]
    input_path = "/tmp/input.webm"
    output_path = "/tmp/output.wav"
    file.save(input_path)
    
    # Convert audio to 16kHz mono WAV using ffmpeg
    result = subprocess.run(
        ["ffmpeg", "-y", "-i", input_path, "-ar", "16000", "-ac", "1", output_path],
        capture_output=True
    )
    
    if result.returncode != 0:
        return jsonify({"error": "Audio conversion failed", "details": result.stderr.decode()}), 500
    
    try:
        # Load and transcribe
        speech, _ = librosa.load(output_path, sr=16000)
        inputs = processor(speech, sampling_rate=16000, return_tensors="pt", padding=True)
        
        with torch.no_grad():
            logits = model(**inputs).logits
        
        predicted_ids = torch.argmax(logits, dim=-1)
        transcription = processor.batch_decode(predicted_ids)[0]
        
        print(f"🎙️ Transcribed: {transcription}")
        return jsonify({"text": transcription})
    
    except Exception as e:
        print(f"❌ Transcription error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7860)
