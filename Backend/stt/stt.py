import torch
import librosa
import sounddevice as sd
import numpy as np
from scipy.io.wavfile import write
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC

SAMPLE_RATE = 16000
DURATION = 10
AUDIO_FILE = "live_audio.wav"
MODEL_ID = "ai4bharat/indicwav2vec-hindi"
print("Loading AI4Bharat Hindi model...")

processor = Wav2Vec2Processor.from_pretrained(MODEL_ID)
model = Wav2Vec2ForCTC.from_pretrained(MODEL_ID)

device = "cuda" if torch.cuda.is_available() else "cpu"
model = model.to(device)
model.eval()

print("Model loaded\n")
print("Recording will start now.")
print(f"Speak Hindi clearly for {DURATION} seconds...")

audio = sd.rec(
    int(DURATION * SAMPLE_RATE),
    samplerate=SAMPLE_RATE,
    channels=1,
    dtype=np.float32
)
sd.wait()

print("Recording finished.")

write(AUDIO_FILE, SAMPLE_RATE, audio)
print(f"Audio saved as {AUDIO_FILE}\n")

def ai4bharat_hindi_stt(audio_path):
    speech, sr = librosa.load(audio_path, sr=16000)

    inputs = processor(
        speech,
        sampling_rate=16000,
        return_tensors="pt"
    )

    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        logits = model(**inputs).logits

    predicted_ids = torch.argmax(logits, dim=-1)
    transcription = processor.decode(predicted_ids[0])

    return transcription
print("Running Speech-to-Text...\n")

text = ai4bharat_hindi_stt(AUDIO_FILE)

print("TRANSCRIPTION:")
print(text)
with open("transcription.txt", "w", encoding="utf-8") as f:
    f.write(text)
