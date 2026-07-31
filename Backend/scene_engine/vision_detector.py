from ultralytics import YOLO
import os

# YOLOv8 nano

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "yolov8n.pt")
model = YOLO(MODEL_PATH)

def detect_objects_in_image(image_path):
    """
    Detect objects using local YOLO model.
    Returns: list of detections with labels, confidence, and bounding boxes.
    """
    try:
        results = model(image_path, verbose=False)[0]

        detections = []
        for box in results.boxes:
            label = results.names[int(box.cls)]
            confidence = float(box.conf)
            x1, y1, x2, y2 = box.xyxy[0].tolist()

            detections.append({
                "label": label,
                "confidence": confidence,
                "bbox": [x1, y1, x2, y2]
            })

        return detections
    except Exception as e:
        print(f"[YOLO Error] {e}")
        return []
