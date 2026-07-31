from scene_engine.entity_extractor import extract_entities
from scene_engine.intent_detection import detect_intent
from scene_engine.state_manager import get_state, update_slot, init_state, save_snapshot
from scene_engine.feedback_engine import generate_turn_feedback

def handle_message(user_id, text, scene):
    state = get_state(user_id, scene)

    # Initial load scene
    if text.strip() == "__init_scene__":
        init_state(user_id, scene) # Ensure fresh state
        greeting_text = scene.get("templates", {}).get("greeting") or _scene_greeting(scene)
        return {"reply": greeting_text, "feedback": None}

    # 1. EARLY EXIT
    if state.get("status") == "completed":
        return {
            "reply": scene.get("templates", {}).get("closing", "बहुत अच्छे!"),
            "feedback": None
        }

    # Save current state as history 
    save_snapshot(user_id, scene)

    # Identiy the next goal for context 
    all_slots = scene.get("slots", [])
    missing_slots = [s for s in all_slots if state["slots"].get(s) is None]
    next_slot = missing_slots[0] if missing_slots else None

    # Intent and entities
    intent = detect_intent(text, scene)
    
    entities, match_score = extract_entities(text, scene, allowed_slots=all_slots)

    # Consider out-of-context only if no information was extracted 
    out_of_context = len(entities) == 0 and intent not in ["greeting", "closing", "confirmation_yes", "confirmation_no"]

    if intent == "greeting" and "greet" in state["slots"] and state["slots"]["greet"] is None:
        update_slot(user_id, scene, "greet", text)
        if "greet" in entities: del entities["greet"]
        out_of_context = False
        print(f"👋 [Dialogue Manager] Greeting intent: {text}")

    # Grammar Gate
    from scene_engine.local_nlp_grammar import analyze_hindi_grammar
    grammar_deduction, _ = analyze_hindi_grammar(text)

    for slot, value in entities.items():
        update_slot(user_id, scene, slot, value)
    

    if not out_of_context:

        pass

    # RE-EVALUATE: Only mark as completed if User provides a CLOSING intent 
    # and all logical slots are filled.
    missing_after = [s for s in all_slots if state["slots"].get(s) is None]
    
    if (intent == "closing" or intent == "confirmation_no") and not missing_after:
        state["status"] = "completed"
        return {
            "reply": scene.get("templates", {}).get("closing", "बहुत अच्छे!"),
            "feedback": None
        }
    
    # If all slots filled but no closing intent yet, stay active but prompt for closing
    if not missing_after and intent != "closing":
        target_prompt = scene.get("templates", {}).get("acknowledgment", "बहुत अच्छा! क्या कुछ और चाहिए?")
    elif missing_after:
        next_slot = missing_after[0]
        target_prompt = scene.get("prompts", {}).get(next_slot)
    else:
        target_prompt = scene.get("templates", {}).get("closing")

    # 3. GENERATE LINGUISTIC FEEDBACK (Hybrid LLM)
    feedback = generate_turn_feedback(text, scene, state, extracted_entities=entities)

    # 4. SCENE-ONLY HYBRID (reply only, no Gemini if out-of-context)

    truly_out_of_context = out_of_context and len(entities) == 0
    
    if truly_out_of_context and target_prompt:
        reply_text = f"माफ़ कीजिए, मैं समझ नहीं पाया। {target_prompt}"
    else:
        # Acknowledge progress or just prompt for next step

        reply_text = target_prompt or _scene_greeting(scene)

    return {"reply": reply_text, "feedback": feedback}


def _scene_greeting(scene):
    """Generate a scene-appropriate greeting using the scene title."""
    title = scene.get("ui", {}).get("title", "the scene")
    greetings = [
        f"नमस्ते! {title} में आपका स्वागत है। मैं आपकी किस प्रकार सहायता कर सकता हूँ?",
        f"हेलो! {title} में आपका स्वागत है। मैं आपकी कैसे मदद कर सकता हूँ?",
        f"नमस्ते! {title} में आए, बताइए मैं आपकी कैसे मदद कर सकता हूँ?",
    ]
    import random
    return random.choice(greetings)
