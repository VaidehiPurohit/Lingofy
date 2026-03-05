from scene_engine.entity_extractor import extract_entities
from scene_engine.intent_detection import detect_intent
from scene_engine.state_manager import get_state, update_slot
from scene_engine.responses import greeting

def handle_message(user_id, text, scene):
    state = get_state(user_id, scene)
    intent = detect_intent(text, scene)
    
    # 0. GLOBAL OVERRIDE: If user wants to thank or close at ANY time
    if intent == "closing":
        state["status"] = "completed"
        return scene["templates"]["closing"]

    # 1. Track what was ALREADY filled before this turn
    pre_slots = state["slots"].copy()
    
    # 2. Extract and Update
    entities = extract_entities(text, scene)
    
    # SPECIAL: If this is the 'init' message from frontend, don't update slots
    is_init_message = text.lower().strip() == "__init_scene__"
    
    if not is_init_message:
        for slot, value in entities.items():
            update_slot(user_id, slot, value)
        
        # Implicit Greeting: If they started ordering, they've effectively greeted
        if entities and state["slots"].get("greet") is None:
            update_slot(user_id, "greet", "done")
        elif intent == "greeting":
            update_slot(user_id, "greet", "done")

    slots = state["slots"]
    
    # 3. Identify NEWLY filled slots (for LLM to acknowledge later)
    newly_filled = [s for s in entities if pre_slots.get(s) is None]
    
    # 4. Build Response Logic
    prefix = ""
    if intent == "greeting" and pre_slots.get("greet") is None:
        prefix = greeting() + " "
    
    # Generic Refinement: If the extracted value is marked as "needs_refinement" in JSON
    for slot, val in slots.items():
        if val in scene.get("refinement_values", {}).get(slot, []):
            pass

    # --- PHASE: Ordering ---
    if state["status"] == "ordering":
        # Check for first invalid or empty slot
        for slot in scene["slots"]:
            val = slots.get(slot)
            
            is_refinement = val in scene.get("refinement_values", {}).get(slot, [])
            if val is None or is_refinement:
                if slot == "greet": 
                    # If they haven't greeted, and this isn't the init message, keep asking
                    if not is_init_message: return prefix + scene["prompts"][slot]
                    else: return greeting() # Just say Hello on start
                
                return prefix + scene["prompts"][slot]

        # Everything filled!
        state["status"] = "confirming"
        return prefix + scene["templates"]["confirmation"].format(**slots)

    # --- PHASE: Confirmation ---
    if state["status"] == "confirming":
        if intent == "confirmation_yes":
            state["status"] = "paying"
            return scene["templates"]["ask_payment"]
        elif intent == "confirmation_no" or intent == "payment": # Allow jump to payment if they insist
             if intent == "confirmation_no":
                for s in scene["slots"]:
                    if s != "greet": state["slots"][s] = None
                state["status"] = "ordering"
                return scene["templates"]["order_reset"]
             else:
                state["status"] = "paying"
                return scene["templates"]["ask_payment"]
        else:
            return scene["templates"]["confirm_failed"]

    # --- PHASE: Payment ---
    if state["status"] == "paying":
        if intent == "payment" or intent == "confirmation_yes":
            state["status"] = "completed"
            return scene["templates"]["closing"]
        else:
            return scene["templates"]["payment_failed"]

    # --- PHASE: Completed ---
    if state["status"] == "completed":
        return scene["templates"]["closing"]

    return "माफ़ कीजिए, मैं समझ नहीं पाया। आप क्या लेना चाहेंगे?"
