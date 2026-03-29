from scene_engine.entity_extractor import extract_entities
from scene_engine.intent_detection import detect_intent
from scene_engine.state_manager import get_state, update_slot
from scene_engine.responses import greeting

def handle_message(user_id, text, scene):
    state = get_state(user_id, scene)
    intent = detect_intent(text, scene)
    
    # AI Modules Lazy Import
    from scene_engine.feedback_engine import generate_turn_feedback
    from scene_engine.hybrid_llm import generate_fallback_response

    # ┌──────────────────────────────────────────────────────────────────────────
    # │ 0. GLOBAL OVERRIDE
    # └──────────────────────────────────────────────────────────────────────────
    if intent == "closing":
        state["status"] = "completed"
        return {"reply": scene["templates"]["closing"], "feedback": None}

    # ┌──────────────────────────────────────────────────────────────────────────
    # │ 1. STATE TRACKING & UPDATE
    # └──────────────────────────────────────────────────────────────────────────
    pre_slots = state["slots"].copy()
    entities = extract_entities(text, scene)
    is_init_message = text.lower().strip() == "__init_scene__"
    
    if not is_init_message:
        for slot, value in entities.items():
            update_slot(user_id, slot, value)
        
        # Simple implicit greeting logic
        if entities and state["slots"].get("greet") is None:
            update_slot(user_id, "greet", "done")
        elif intent == "greeting":
            update_slot(user_id, "greet", "done")

    slots = state["slots"]
    newly_filled = [s for s in entities if pre_slots.get(s) is None]
    
    # ┌──────────────────────────────────────────────────────────────────────────
    # │ 2. FALLBACK/HYBRID CHECK (The "Anytime" AI)
    # └──────────────────────────────────────────────────────────────────────────
    is_off_script = not is_init_message and not newly_filled and intent not in ("greeting", "confirmation_yes", "confirmation_no", "payment", "closing")
    
    if is_off_script:
        reply = generate_fallback_response(text, scene, state)
        feedback = generate_turn_feedback(text, scene, state)
        return {"reply": reply, "feedback": feedback}
    
    # ┌──────────────────────────────────────────────────────────────────────────
    # │ 3. STANDARD STATE LOGIC
    # └──────────────────────────────────────────────────────────────────────────
    prefix = ""
    if intent == "greeting" and pre_slots.get("greet") is None:
        prefix = greeting() + " "
    
    reply_str = ""

    # PHASE: Ordering
    if state["status"] == "ordering":
        for slot in scene["slots"]:
            val = slots.get(slot)
            # Check for refinement
            is_refinement = val in scene.get("refinement_values", {}).get(slot, [])
            
            if val is None or is_refinement:
                if slot == "greet": 
                    if is_init_message: 
                        return {"reply": greeting(), "feedback": None}
                    else:
                        reply_str = scene["prompts"][slot]
                else:
                    reply_str = scene["prompts"][slot]
                
                feedback = generate_turn_feedback(text, scene, state) if not is_init_message else None
                return {"reply": prefix + reply_str, "feedback": feedback}

        # Everything filled!
        if "confirmation" not in scene.get("templates", {}):
            if "ask_payment" in scene.get("templates", {}):
                state["status"] = "paying"
                reply_str = scene["templates"]["ask_payment"]
            else:
                state["status"] = "completed"
                reply_str = scene["templates"]["closing"]
        else:
            import re
            template = scene["templates"]["confirmation"]
            keys = re.findall(r'\{(.*?)\}', template)
            format_data = {k: slots.get(k, "") for k in keys}
            reply_str = template.format(**format_data)
            state["status"] = "confirming"

    # PHASE: Confirmation
    elif state["status"] == "confirming":
        if intent == "confirmation_yes":
            if "ask_payment" in scene.get("templates", {}):
                state["status"] = "paying"
                reply_str = scene["templates"]["ask_payment"]
            else:
                state["status"] = "completed"
                reply_str = scene["templates"]["closing"]
        elif intent == "confirmation_no" or intent == "payment":
             if intent == "confirmation_no":
                for s in scene["slots"]:
                    if s != "greet": state["slots"][s] = None
                state["status"] = "ordering"
                reply_str = scene["templates"]["order_reset"]
             else:
                if "ask_payment" in scene.get("templates", {}):
                    state["status"] = "paying"
                    reply_str = scene["templates"]["ask_payment"]
                else:
                    state["status"] = "completed"
                    reply_str = scene["templates"]["closing"]
        else:
            reply_str = scene.get("templates", {}).get("confirm_failed", "Please confirm with yes or no.")

    # PHASE: Payment
    elif state["status"] == "paying":
        if intent == "payment" or intent == "confirmation_yes":
            state["status"] = "completed"
            reply_str = scene["templates"]["closing"]
        else:
            reply_str = scene.get("templates", {}).get("payment_failed", "Please complete the payment.")

    # PHASE: Completed
    elif state["status"] == "completed":
        reply_str = scene.get("templates", {}).get("closing", "Done!")

    else:
        reply_str = "माफ़ कीजिए, मैं समझ नहीं पाया।"

    feedback = generate_turn_feedback(text, scene, state) if not is_init_message else None
    print(f"DEBUG: Feedback result for '{text}': {feedback}")
    return {"reply": prefix + reply_str, "feedback": feedback}
