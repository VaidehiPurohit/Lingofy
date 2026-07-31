from ultralytics import YOLO
from PIL import Image

# YOLOv8 nano — smallest & fastest, good enough for common objects
# Downloads automatically (~6MB) on first run
model = YOLO("yolov8n.pt")


def detect_objects(image_path: str) -> list[dict]:
    """
    Run YOLOv8n on image_path.
    Returns list of {label, confidence, bbox: [x1,y1,x2,y2]}.
    Resizes image to 640px max before inference to keep CPU fast (~0.3-0.8s).
    """
    # Shrink before inference — biggest CPU speedup
    img = Image.open(image_path).convert("RGB")
    max_dim = 640
    w, h = img.size
    if max(w, h) > max_dim:
        scale = max_dim / max(w, h)
        img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
        img.save(image_path)

    results = model.predict(
        source=image_path,
        imgsz=640,
        conf=0.4,       # min confidence
        iou=0.5,        # NMS overlap threshold
        verbose=False,  # no console spam
        device="cpu"
    )

    detections = []
    for result in results:
        for box in result.boxes:
            x1, y1, x2, y2 = map(float, box.xyxy[0])
            label = result.names[int(box.cls[0])]
            conf = float(box.conf[0])
            detections.append({
                "label": label,
                "confidence": conf,
                "bbox": [x1, y1, x2, y2]
            })

    return detections
