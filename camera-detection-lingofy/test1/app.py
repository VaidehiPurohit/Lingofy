from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
from PIL import Image

from yolo_detector import detect_objects
from gemini import get_word_data

app = Flask(__name__)
CORS(app)


@app.route('/detect', methods=['POST'])
def detect():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({'error': 'No image provided'}), 400

    # Decode base64 image (strip data URI prefix if present)
    img_b64 = data['image'].split(',')[-1]
    image_bytes = base64.b64decode(img_b64)

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image.save("temp.jpg")

    detections = detect_objects("temp.jpg")

    # Filter low confidence, keep top 6 by confidence
    objects = []
    for i, d in enumerate(detections):
        if d["confidence"] < 0.45:
            continue
        x1, y1, x2, y2 = d["bbox"]
        objects.append({
            "id": i,
            "name": d["label"],
            "confidence": round(d["confidence"], 2),
            "box": {"x1": x1, "y1": y1, "x2": x2, "y2": y2}
        })

    objects = sorted(objects, key=lambda x: x["confidence"], reverse=True)[:6]
    return jsonify({"objects": objects})


@app.route('/word/<label>', methods=['GET'])
def word(label):
    data = get_word_data(label)
    return jsonify(data)


@app.route('/health')
def health():
    return jsonify({"status": "ok"})


if __name__ == '__main__':
    print("🚀 Lingofy Backend Running → http://localhost:5000")
    # threaded=False is safer with SQLite + single conn
    app.run(debug=True, threaded=False)
