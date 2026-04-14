import nltk
from nltk.tokenize import word_tokenize
import re

# Minimal Hindi Grammar Rules
# 1. SOV Check: Subject-Object-Verb (Mostly ends with verb)
# 2. Particle check: If destination is mentioned, 'ko' or 'se' might be present
# 3. Completeness: Sentences should have more than 2 words for complex goals

HINDI_VERB_ENDINGS = [
    "है", "हैं", "था", "थी", "थे", "हो", "हूँ", # Auxiliaries
    "गा", "गी", "गे", # Future
    "लो", "दो", "करो", "चाहिए", # Imperative/Modal
    "गया", "गयी", "गए", # Past
    "रहा", "रही", "रहे", # Continuous
    "ता", "ती", "ते" # Habitual
]

def analyze_hindi_grammar(text):
    """
    Perform local NLP analysis on Hindi text using NLTK and Rule-based logic.
    Returns: { 'score_deduction': int, 'feedback': [str] }
    """
    deduction = 0
    feedback = []
    
    # 1. Basic cleaning and tokenization
    tokens = [t for t in word_tokenize(text) if t not in "।?!.,"]
    if not tokens:
        return 0, []

    # 2. Verb check (Hindi is SOV, verbs usually at the end)
    last_word = tokens[-1]
    has_verb = any(last_word.endswith(end) for end in HINDI_VERB_ENDINGS) or last_word in HINDI_VERB_ENDINGS
    
    if not has_verb and len(tokens) > 2:
        # Deduct if it's a long sentence but has no clear verb/auxiliary at the end
        deduction += 10
        feedback.append("Hindi sentences usually end with a verb or 'hai/tha'.")

    # 3. Length check for complex goals
    if len(tokens) < 2 and len(text) > 5:
        deduction += 5
        feedback.append("Try to use complete phrases for better clarity.")

    # 4. Repeated word check (Common typo in speech/typing)
    for i in range(len(tokens)-1):
        if tokens[i] == tokens[i+1]:
            deduction += 15
            feedback.append(f"Repeated word detected: '{tokens[i]}'.")

    return deduction, feedback
