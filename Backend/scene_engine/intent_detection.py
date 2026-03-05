import re
from scene_engine.model_loader import get_similarity

def detect_intent(text, scene):
    text = text.lower().strip()
    best_intent = None
    highest_score = 0

    for intent, examples in scene["intents"].items():
        for phrase in examples:
            phrase_lower = phrase.lower()
            
            # Check for EXACT match — full text equals phrase, or phrase is a whole word in text
            if text == phrase_lower or phrase_lower in text.split():
                return intent
            
            # Check for SEMANTIC match (Smart)
            score = get_similarity(text, phrase)
            if score > highest_score:
                highest_score = score
                best_intent = intent

    # Only return the intent if it's a strong match (70% or higher)
    if highest_score > 0.7:
        return best_intent
        
    return None
