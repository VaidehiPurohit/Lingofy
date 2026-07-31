import re

def detect_intent_with_score(text, scene):
    text = text.lower().strip()
    
    # Robust keyword search for intents defined in the scene JSON
    for intent, examples in scene.get("intents", {}).items():
        for phrase in examples:
            phrase_lower = phrase.lower().strip()
            # Match if phrase exists in text (more reliable for Hindi characters)
            if phrase_lower in text:
                return intent, 1.0

    return None, 0.0

def detect_intent(text, scene):
    intent, _ = detect_intent_with_score(text, scene)
    return intent
