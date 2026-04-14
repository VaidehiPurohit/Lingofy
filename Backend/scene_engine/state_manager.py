sessions = {}

def _session_key(user_id, scene):
    # Key state by both user and scene to avoid slot/status desync.
    # `scene` is the full scene JSON loaded by `scene_loader.load_scene()`.
    scene_name = scene.get("scene") if isinstance(scene, dict) else str(scene)
    return f"{user_id}:{scene_name}"

def init_state(user_id, scene):
    state = {
        "scene": scene["scene"],
        "slots": {slot: None for slot in scene["slots"]},
        "status": "active",
        "history": [] # Stack of (slots_dict, status_str)
    }
    sessions[_session_key(user_id, scene)] = state
    return state


def get_state(user_id, scene):
    key = _session_key(user_id, scene)
    if key not in sessions:
        return init_state(user_id, scene)
    return sessions[key]


def save_snapshot(user_id, scene):
    """Save the current state to history before it gets modified."""
    state = get_state(user_id, scene)
    # Store a deep copy of slots and the current status
    snapshot = {
        "slots": dict(state["slots"]),
        "status": state["status"]
    }
    state["history"].append(snapshot)
    # Keep history manageable
    if len(state["history"]) > 20: 
        state["history"].pop(0)


def undo_state(user_id, scene):
    """Revert the state to the last saved snapshot."""
    state = get_state(user_id, scene)
    if state and state.get("history"):
        last_snapshot = state["history"].pop()
        state["slots"] = last_snapshot["slots"]
        state["status"] = last_snapshot["status"]
        return True
    return False


def update_slot(user_id, scene, slot, value):
    key = _session_key(user_id, scene)
    if key not in sessions:
        return
    if "slots" not in sessions[key] or slot not in sessions[key]["slots"]:
        return
    
    # Actually updating
    sessions[key]["slots"][slot] = value
    
    # 🚫 AUTO-COMPLETE REMOVED: Status is now handled exclusively 
    # by dialogue_manager.py (checks for Closing intent) to prevent glitches.
