from ultralytics import YOLO

# YOLOv8 nano — fastest model, optimized for CPU
model = YOLO("yolov8n.pt")

def detect_objects(image_path):
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
