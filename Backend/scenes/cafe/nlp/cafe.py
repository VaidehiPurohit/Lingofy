import json
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

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

    user_emb = model.encode(user_input, convert_to_tensor=True)
    anchor_embs = model.encode(anchors, convert_to_tensor=True)

    scores = util.cos_sim(user_emb, anchor_embs)[0]
    best_score = float(scores.max())

    return best_score >= threshold, best_score