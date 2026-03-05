import json

def load_scene(scene_name):

    path = f"scenes/{scene_name}.json"

    with open(path, encoding="utf-8") as f:
        scene = json.load(f)

    return scene