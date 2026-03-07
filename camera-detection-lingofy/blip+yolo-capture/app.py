"""
Lingofy — Stable BLIP + YOLO-World Version
Focus: Accurate object detection first
No VQA. Clean noun normalization. Higher confidence.

Run:
  python app.py
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image
import base64, io, sqlite3, time, re, requests
import torch
import numpy as np
import spacy
from transformers import BlipProcessor, BlipForConditionalGeneration
from ultralytics import YOLOWorld

# ─────────────────────────────────────────────
# Flask Setup
# ─────────────────────────────────────────────

app = Flask(__name__)
CORS(app)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"\nDevice: {DEVICE}")

# ─────────────────────────────────────────────
# Load Models
# ─────────────────────────────────────────────

print("Loading BLIP...")
blip_processor = BlipProcessor.from_pretrained(
    "Salesforce/blip-image-captioning-base"
)
blip_model = BlipForConditionalGeneration.from_pretrained(
    "Salesforce/blip-image-captioning-base",
    torch_dtype=torch.float32
).to(DEVICE)
blip_model.eval()
print("✅ BLIP ready")

print("Loading YOLO-World...")
yolo = YOLOWorld("yolov8s-worldv2.pt")
print("✅ YOLO ready")

print("Loading spaCy...")
nlp = spacy.load("en_core_web_sm")
print("✅ spaCy ready\n")

# ─────────────────────────────────────────────
# SQLite Setup
# ─────────────────────────────────────────────

DB_PATH = "lingofy.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS words (
            english TEXT UNIQUE,
            hindi TEXT,
            transliteration TEXT,
            example_sentence TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def get_cached(label):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    row = conn.execute(
        "SELECT * FROM words WHERE english = ?", (label.lower(),)
    ).fetchone()
    conn.close()
    return dict(row) if row else None

def cache_word(label, data):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        INSERT OR IGNORE INTO words
        (english, hindi, transliteration, example_sentence)
        VALUES (?, ?, ?, ?)
    """, (
        label.lower(),
        data.get("hindi"),
        data.get("transliteration"),
        data.get("example_sentence")
    ))
    conn.commit()
    conn.close()

# ─────────────────────────────────────────────
# BLIP Caption
# ─────────────────────────────────────────────

def get_caption(image):
    inputs = blip_processor(image, "", return_tensors="pt").to(DEVICE)
    with torch.no_grad():
        out = blip_model.generate(
            **inputs,
            max_new_tokens=50,
            num_beams=4
        )
    caption = blip_processor.decode(out[0], skip_special_tokens=True).strip()
    print("Caption:", caption)
    return caption

# ─────────────────────────────────────────────
# Noun Extraction + Normalization
# ─────────────────────────────────────────────

SKIP_WORDS = {
    "image","photo","room","area","scene","thing","object",
    "objects","floor","wall","ceiling","side","part","place"
}

QUANTITY_WORDS = {
    "one","two","three","four","five","six",
    "several","many","few","multiple"
}

def extract_nouns(caption):
    doc = nlp(caption)
    nouns = []

    for chunk in doc.noun_chunks:
        text = re.sub(r"^(a|an|the)\s+", "", chunk.text.lower())
        nouns.append(text)

    return list(dict.fromkeys(nouns))

def normalize_noun(noun):
    words = noun.split()

    # remove quantity words
    words = [w for w in words if w not in QUANTITY_WORDS]

    if not words:
        return None

    # take head noun
    word = words[-1]

    # simple singularization
    if word.endswith("s") and len(word) > 3:
        word = word[:-1]

    if word in SKIP_WORDS:
        return None

    return word

def clean_nouns(raw_nouns):
    cleaned = []

    for n in raw_nouns:
        norm = normalize_noun(n)
        if norm and norm not in cleaned:
            cleaned.append(norm)

    return cleaned[:6]  # max 6 classes

# ─────────────────────────────────────────────
# YOLO Detection
# ─────────────────────────────────────────────

def yolo_detect(image, nouns):
    if not nouns:
        return []

    yolo.set_classes(nouns)

    results = yolo.predict(
        np.array(image),
        conf=0.4,
        iou=0.5,
        verbose=False
    )[0]

    detections = []

    for box in results.boxes:
        label = results.names[int(box.cls)]
        confidence = float(box.conf)

        x1, y1, x2, y2 = box.xyxy[0].tolist()
        w = x2 - x1
        h = y2 - y1

        detections.append({
            "label": label,
            "confidence": round(confidence, 2),
            "bbox": [round(x1), round(y1), round(w), round(h)],
            "has_box": True
        })

    print("Detections:", detections)
    return detections

# ─────────────────────────────────────────────
# Translation
# ─────────────────────────────────────────────

def translate_word(label):
    cached = get_cached(label)
    if cached:
        return cached

    try:
        r = requests.get(
            f"https://api.mymemory.translated.net/get?q={label}&langpair=en|hi",
            timeout=8
        ).json()
        hindi = r.get("responseData", {}).get("translatedText", "")
        if hindi.lower() == label.lower():
            hindi = None
    except:
        hindi = None

    data = {
        "hindi": hindi,
        "transliteration": label.title(),
        "example_sentence": None
    }

    cache_word(label, data)
    return data

# ─────────────────────────────────────────────
# Detection Route
# ─────────────────────────────────────────────

@app.route("/api/detect", methods=["POST"])
def detect():
    try:
        data = request.get_json()
        if not data or "image" not in data:
            return jsonify({"success": False, "error": "No image"}), 400

        img_b64 = data["image"].split(",")[1]
        image = Image.open(io.BytesIO(base64.b64decode(img_b64))).convert("RGB")

        max_size = 640
        if max(image.size) > max_size:
            ratio = max_size / max(image.size)
            image = image.resize(
                (int(image.width * ratio), int(image.height * ratio))
            )

        print("\n==============================")

        caption = get_caption(image)

        raw_nouns = extract_nouns(caption)
        nouns = clean_nouns(raw_nouns)

        print("Final nouns:", nouns)

        detections = yolo_detect(image, nouns)

        results = []
        for det in detections:
            hindi_data = translate_word(det["label"])
            results.append({
                **det,
                "hindi": hindi_data.get("hindi"),
                "transliteration": hindi_data.get("transliteration")
            })

        return jsonify({
            "success": True,
            "detections": results,
            "caption": caption,
            "count": len(results),
            "image_width": image.width,
            "image_height": image.height
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ─────────────────────────────────────────────
# UI Route
# ─────────────────────────────────────────────

@app.route("/")
def serve_ui():
    return send_from_directory(".", "test.html")

# ─────────────────────────────────────────────
# Start
# ─────────────────────────────────────────────

if __name__ == "__main__":
    init_db()
    print("\n🚀 Lingofy Stable Version Running")
    app.run(host="0.0.0.0", port=5001, debug=False)