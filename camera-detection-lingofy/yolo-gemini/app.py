from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
from PIL import Image

from yolo_detector import detect_objects
from clip_refiner import refine_label
from gemini_service import get_word_data

app = Flask(__name__)
CORS(app)


# 🧠 DETECT OBJECTS (YOLO + CLIP)
@app.route('/detect', methods=['POST'])
def detect():
    data = request.get_json()

    if not data or 'image' not in data:
        return jsonify({'error': 'No image provided'}), 400

    img_b64 = data['image'].split(',')[-1]
    image_bytes = base64.b64decode(img_b64)

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image.save("temp.jpg")

    detections = detect_objects("temp.jpg")

    objects = []

    for i, d in enumerate(detections):
        if d["confidence"] < 0.5:
            continue

        label = refine_label(image, d["bbox"])

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

    # 🔥 limit objects to avoid clutter
    objects = sorted(objects, key=lambda x: x["confidence"], reverse=True)[:6]

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
    app.run(debug=True)