from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
import os
from PIL import Image

from yolo_detector import detect_objects
from gemini_service import get_word_data

app = Flask(__name__)
CORS(app)

TEMP_IMAGE = "temp.jpg"


# 🧠 DETECT OBJECTS (YOLO only — no CLIP for CPU speed)
@app.route('/detect', methods=['POST'])
def detect():
    data = request.get_json()

    if not data or 'image' not in data:
        return jsonify({'error': 'No image provided'}), 400

    # Decode base64 image
    img_b64 = data['image'].split(',')[-1]
    image_bytes = base64.b64decode(img_b64)

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # Resize large images before saving — big speedup on CPU
    max_size = 640
    if max(image.size) > max_size:
        image.thumbnail((max_size, max_size), Image.LANCZOS)

    image.save(TEMP_IMAGE)

    detections = detect_objects(TEMP_IMAGE)

    objects = []
    seen_labels = set()

    for i, d in enumerate(detections):
        if d["confidence"] < 0.4:
            continue

        label = d["label"]

        # Skip duplicate labels — show only the highest-confidence one
        if label in seen_labels:
            continue
        seen_labels.add(label)

        x1, y1, x2, y2 = d["bbox"]

        objects.append({
            "id": i,
            "name": label,
            "confidence": round(d["confidence"], 2),
            "box": {
                "x1": x1,
                "y1": y1,
                "x2": x2,
                "y2": y2
            }
        })

    # Keep top 6 by confidence
    objects = sorted(objects, key=lambda x: x["confidence"], reverse=True)[:6]

    # Clean up temp file
    if os.path.exists(TEMP_IMAGE):
        os.remove(TEMP_IMAGE)

    return jsonify({"objects": objects})


# 🌍 WORD LEARNING (Gemini + Cache)
@app.route('/word/<label>', methods=['GET'])
def word(label):
    data = get_word_data(label)
    return jsonify(data)


# ❤️ HEALTH CHECK
@app.route('/health')
def health():
    return jsonify({"status": "ok"})


if __name__ == '__main__':
    print("🚀 Lingofy Backend Running on http://localhost:5000")
    app.run(debug=False, host="0.0.0.0", port=5000)  # debug=False is faster
