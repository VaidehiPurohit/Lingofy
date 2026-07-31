import os
import requests
import json
import re
import time
from scene_engine.local_nlp_grammar import analyze_hindi_grammar
from dotenv import load_dotenv

load_dotenv()

# GEMINI API CONFIGURATION 
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-3.1-flash-lite-preview"

if not GEMINI_API_KEY:
    GEMINI_API_KEY = None 

GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}" if GEMINI_API_KEY else None
# ──────────────────────────────────────────────────────────────────────

def generate_turn_feedback(user_text, scene, state, extracted_entities=None, expected_text=""):
    """Generate high-quality hybrid linguistic feedback using Gemini AI."""
    title = scene.get("ui", {}).get("title", "Scene")
    
    # Identify the next goal for accuracy check
    missing_slots = [s for s in scene.get("slots", []) if state["slots"].get(s) is None]
    current_goal = missing_slots[0] if missing_slots else "conversation completion"
    goal_label = scene.get("goal_labels", {}).get(current_goal, current_goal)
    
    #  LOCAL NLP ANALYSIS 
    local_deduction, local_points = analyze_hindi_grammar(user_text)

    prompt = f"""You are an encouraging and supportive Hindi language partner helping a student practice their conversational skills.
Analyze the student's input for the scenario: "{title}"
User input: "{user_text}"
Expected/Target word (if applicable): "{expected_text}"

EVALUATION PHILOSOPHY:
1. PRIORITIZE COMMUNICATION: If the user communicates their intent effectively (e.g., successully ordering a coffee), give a high score (80+) regardless of minor grammatical flaws.
2. BE GENTLE: Provide tips as "friendly suggestions" rather than "critiques".
3. LOANWORDS: Accept transliterations of English words like "Latte" (लट्टे, लाटे) as valid in a modern cafe context. Do not penalize them.
4. TONE: Start the 'tip' with a positive phrase like "Great effort!" or "You're doing well!".

Return ONLY JSON:
{{
  "spelling_score": 0-100, 
  "grammar_score": 0-100,
  "naturalness_score": 0-100,
  "accuracy_score": 0-100,
  "tip": "Supportive and helpful tip in English. Focus on the most important correction.",
  "suggestion": "How a native speaker would say it naturally",
  "grammar_points": ["Brief point about word choice or sentence structure"]
}}
"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 1024}
    }

    if not GEMINI_URL:
        return generate_turn_fallback_feedback(user_text, scene, state, local_points)

    try:
        resp = requests.post(GEMINI_URL, json=payload, timeout=12)
        resp.raise_for_status()
        raw_text = resp.json()['candidates'][0]['content']['parts'][0]['text'].strip()
        
        # Extract JSON from response
        match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if match:
            res_json = json.loads(match.group())
            # Merge local NLP deductions
            sub_scores = [
                v for k, v in res_json.items()
                if k.endswith("_score") and isinstance(v, (int, float))
            ]
            overall = int(sum(sub_scores) / len(sub_scores)) if sub_scores else 50
            overall = max(0, overall - local_deduction)
            res_json["score"] = overall
            res_json["overall_score"] = overall
            res_json["grammar_points"] = list(set(res_json.get("grammar_points", []) + local_points))
            return res_json
        
        return generate_turn_fallback_feedback(user_text, scene, state, local_points)

    except Exception as e:
        print(f"[Feedback Engine] Error: {e}")
        return generate_turn_fallback_feedback(user_text, scene, state, local_points)

def generate_turn_fallback_feedback(user_text, scene, state, local_points):
    """Fallback if Gemini fails."""
    return {
        "score": max(0, 80 - (len(local_points) * 10)),
        "accuracy_score": 85,
        "tip": "Good effort! " + (local_points[0] if local_points else "Keep practicing your Hindi sentences."),
        "suggestion": user_text,
        "grammar_points": local_points or ["Sentence looks okay."]
    }
