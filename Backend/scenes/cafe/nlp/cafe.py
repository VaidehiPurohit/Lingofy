import json

# Lazy imports
_sentence_transformers = None
_util = None

def _get_sentence_transformers():
    global _sentence_transformers, _util
    if _sentence_transformers is None:
        from sentence_transformers import SentenceTransformer, util
        _sentence_transformers = SentenceTransformer
        _util = util
    return _sentence_transformers, _util

# Lazy load model
_model = None

def _get_model():
    global _model
    if _model is None:
        SentenceTransformer, util = _get_sentence_transformers()
        _model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
    return _model

with open("data/intents.json", encoding="utf-8") as f:
    INTENTS = json.load(f)

def preprocess(text):
    return text.strip()

def goal_keyword_check(user_input, goal):
    if goal == "order_coffee":
        coffee_keywords = ["कॉफी", "लाटे", "कैप्पुचिनो", "मोका", "एस्प्रेसो"]
        return any(word in user_input for word in coffee_keywords)

    if goal == "payment":
        payment_keywords = ["कार्ड", "कैश", "नकद", "भुगतान"]
        return any(word in user_input for word in payment_keywords)

    return True

def check_goal(user_input, goal, threshold=0.6):
    user_input = preprocess(user_input)

    # Step 1: Goal-specific keyword validation
    if not goal_keyword_check(user_input, goal):
        return False, 0.0

    # Step 2: Semantic similarity
    anchors = INTENTS[goal]
    model = _get_model()
    SentenceTransformer, util = _get_sentence_transformers()

    user_emb = model.encode(user_input, convert_to_tensor=True)
    anchor_embs = model.encode(anchors, convert_to_tensor=True)

    scores = util.cos_sim(user_emb, anchor_embs)[0]
    best_score = float(scores.max())

    return best_score >= threshold, best_score