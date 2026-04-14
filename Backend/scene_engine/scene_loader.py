import json
import os

def load_scene(scene_name):
    try:
        # Get the directory of this file and go up one level to find scenes
        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(current_dir)
        path = os.path.join(backend_dir, "scenes", f"{scene_name}.json")
        
        if not os.path.exists(path):
            return None

        with open(path, encoding="utf-8") as f:
            scene = json.load(f)
        return scene
    except Exception as e:
        print(f"[Loader] Failed to load scene '{scene_name}': {e}")
        return None
