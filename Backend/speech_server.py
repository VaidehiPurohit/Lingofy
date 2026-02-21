from flask import Flask, request, jsonify, send_file
from gtts import gTTS
import torch
import librosa
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
import uuid
import os

app = Flask(__name__)

# LOAD AI4BHARAT MODEL ON START
MODEL_ID = "ai4bharat/indicwav2vec-hindi"

print("Loading AI4Bharat Hindi model...")

processor = Wav2Vec2Processor.from_pretrained(MODEL_ID)
model = Wav2Vec2ForCTC.from_pretrained(MODEL_ID)

device = "cuda" if torch.cuda.is_available() else "cpu"
model = model.to(device)
model.eval()

print("Model loaded\n")

# TEXT → SPEECH
@app.route("/tts", methods=["POST"])
def tts():

    text = request.json.get("text")

    filename = f"{uuid.uuid4()}.mp3"
    gTTS(text=text, lang="hi").save(filename)

    return send_file(filename, mimetype="audio/mpeg")
# SPEECH → TEXT
@app.route("/stt", methods=["POST"])
def stt():

    if "file" not in request.files:
        return jsonify({"error": "No audio file"}), 400

    file = request.files["file"]

    temp_path = "temp_audio.wav"
    file.save(temp_path)

    # Load audio
    speech, sr = librosa.load(temp_path, sr=16000)

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

    os.remove(temp_path)

    return jsonify({"text": text})

if __name__ == "__main__":
    app.run(debug=True)