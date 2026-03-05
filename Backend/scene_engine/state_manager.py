sessions = {}

def init_state(user_id, scene): 
    state = {
        "scene": scene["scene"], 
        "slots": {slot: None for slot in scene["slots"]},
        "status": "ordering"  # Options: ordering, confirming, paying, completed
    }
    sessions[user_id] = state
    return state



def get_state(user_id, scene):
    if user_id not in sessions:
        return init_state(user_id, scene)
    
    # Don't auto-reset completed sessions here — let the frontend
    # explicitly call /reset-session when user wants to replay.
    return sessions[user_id]


def update_slot(user_id, slot, value):
    sessions[user_id]["slots"][slot] = value