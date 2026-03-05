from flask import Flask, request, jsonify
from flask_cors import CORS  # <-- Add this
from scene_engine.dialogue_manager import handle_message
from scene_engine.state_manager import get_state # <-- Add this
from scene_engine.scene_loader import load_scene

app = Flask(__name__)
CORS(app) # <-- Add this to allow Frontend access

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_id = data.get("user_id", "default")
    scene_name = data.get("scene", "cafe")
    message = data["message"]

    scene = load_scene(scene_name)
    reply = handle_message(user_id, message, scene)
    
    # Get the updated state to send to UI
    state = get_state(user_id, scene)

    return jsonify({
        "reply": reply,
        "slots": state["slots"],   # <-- UI Goal checklist
        "status": state["status"] # <-- UI Progress bar
    })

@app.route("/reset-session", methods=["POST"])
def reset_session():
    data = request.json
    user_id = data.get("user_id", "default")
    scene_name = data.get("scene", "cafe")
    
    scene = load_scene(scene_name)
    from scene_engine.state_manager import init_state
    init_state(user_id, scene)
    
    return jsonify({"status": "reset"})

import os
import json

@app.route("/scenes", methods=["GET"])
def list_scenes():
    scenes_dir = "scenes"
    scene_list = []
    if os.path.exists(scenes_dir):
        for filename in os.listdir(scenes_dir):
            if filename.endswith(".json"):
                with open(os.path.join(scenes_dir, filename), 'r', encoding='utf-8') as f:
                    try:
                        data = json.load(f)
                        scene_list.append({
                            "id": data.get("scene", filename.replace(".json", "")),
                            "title": data.get("ui", {}).get("title", filename.replace(".json", "").capitalize()),
                            "description": data.get("ui", {}).get("description", "A conversation scene"),
                            "icon": data.get("ui", {}).get("icon", "MessageSquare"),
                            "gradient": data.get("ui", {}).get("gradient", "from-slate-500 to-slate-600"),
                            "level": data.get("ui", {}).get("level", "Beginner"),
                            "turns": data.get("ui", {}).get("turns", 10)
                        })
                    except Exception as e:
                        print(f"Error loading {filename}: {e}")
    return jsonify(scene_list)

@app.route("/scene-data/<scene_name>", methods=["GET"])
def get_scene_data(scene_name):
    try:
        scene = load_scene(scene_name)
        return jsonify({
            "slots": scene["slots"],
            "prompts": scene["prompts"],
            "goal_labels": scene.get("goal_labels", {}),
            "ui": scene.get("ui", {})
        })
    except FileNotFoundError:
        return jsonify({"error": "Scene not found"}), 404

if __name__ == "__main__":
    app.run(debug=True, port=5000)
