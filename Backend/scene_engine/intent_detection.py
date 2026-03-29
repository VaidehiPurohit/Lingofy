import re
from scene_engine.model_loader import get_similarity


def detect_intent_with_score(text, scene):
    text = text.lower().strip()
    best_intent = None
    highest_score = 0

    for intent, examples in scene["intents"].items():
        for phrase in examples:
            phrase_lower = phrase.lower()

            # Check for EXACT match — full text equals phrase, or phrase is a whole word in text
            if text == phrase_lower or phrase_lower in text.split():
                return intent, 1.0

            # Check for SEMANTIC match (Smart)
            score = get_similarity(text, phrase)
            if score > highest_score:
                highest_score = score
                best_intent = intent

    if highest_score >= 0.6:
        return best_intent, highest_score

    return None, highest_score


def detect_intent(text, scene):
    intent, _ = detect_intent_with_score(text, scene)
    return intent
