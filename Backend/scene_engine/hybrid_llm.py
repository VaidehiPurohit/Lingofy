import os
import re
import json
import requests
import time
from functools import lru_cache

# GEMINI API CONFIGURATION 
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-3.1-flash-lite-preview" # Matching the 3.1 model preferred by the user

GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}" if GEMINI_API_KEY else None
# ──────────────────────────────────────────────────────────────────────

# Simple rate limiting
_last_request_time = 0.0
_min_request_interval = 1.0 

_response_cache = {}
_cache_max_size = 50

def _get_cache_key(user_text, scene_name, state_summary):
    """Generate a cache key for similar requests."""
    # Normalize user text (remove extra spaces, lowercase)
    normalized_text = ' '.join(user_text.lower().split())
    return f"{scene_name}:{normalized_text[:50]}:{state_summary}"

def get_scene_response(user_text, scene, state, target_prompt=None, extracted_entities=None):
    title = scene.get("ui", {}).get("title", "Scene")
    
    # Check cache first
    state_summary = f"missing_{len([s for s in scene.get('slots', []) if state['slots'].get(s) is None])}"
    cache_key = _get_cache_key(user_text, title, state_summary)
    
    if cache_key in _response_cache:
        cached_response = _response_cache[cache_key]
        # Modify the reply to include the target prompt if needed
        if target_prompt and target_prompt not in cached_response["reply"]:
            cached_response["reply"] = f"{cached_response['reply'].split('!')[0]}! {target_prompt}"
        return cached_response
    
    # Track goal progress for Gemini context
    all_slots = scene.get("slots", [])
    completed_slots = [s for s in all_slots if state["slots"].get(s) is not None]
    missing_slots = [s for s in all_slots if state["slots"].get(s) is None]
    
    goals_summary = []
    for slot in all_slots:
        val = state["slots"].get(slot)
        label = scene.get("goal_labels", {}).get(slot, slot)
        status = f"✅ {val}" if val else "❌ Not yet"
        goals_summary.append(f"  - {label}: {status}")
    goals_text = "\n".join(goals_summary)
 
    # Determine progress status for AI
    progress_status = "Onto next goal" if missing_slots else "SCENE MASTERED"

    prompt = f"""You are a character in a '{title}' scenario.
    
PROGRESS:
{goals_text}

STUDENT SAID: "{user_text}"

REQUIRED ACTION:
1. Acknowledge what the student said in natural Hindi/Hinglish.
2. If the student made progress on a goal, celebrate it briefly.
3. If they finished everything, congratulate them.
4. Then, you MUST ask the following question exactly to keep the conversation moving:
"{target_prompt or "How can I help you today?"}"

FEEDBACK REQUIREMENTS (Crucial):
1. Analyze the student's Hindi input "{user_text}" for grammar and politeness.
2. Provide specific linguistic feedback in English (grammar, gender agreement, tone).
3. Do NOT give generic "Good job" feedback. Be "turn-wise" and specific.
4. Mention their progress towards the goals: {progress_status}.

JSON FORMAT ONLY:
{{
  "reply": "Natural Hindi Response (Acknowledgment + the REQUIRED question)",
  "feedback": {{
    "overall_score": 0-100,
    "grammar_score": 0-100,
    "relevance_score": 0-100,
    "vocabulary_score": 0-100,
    "tip": "Specific grammar/usage tip in English AND current goal status",
    "suggestion": "How a native speaker would say the student's sentence correctly in Hindi script",
    "grammar_points": ["Specific grammar point 1"]
  }}
}}"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 600}
    }

    if not GEMINI_URL:
        return {
            "reply": f"बहुत बढ़िया! {target_prompt or 'आगे बढ़िए।'}",
            "feedback": generate_fallback_feedback(user_text, scene, state, extracted_entities, target_prompt)
        }

    global _last_request_time
    current_time = time.time()
    time_since_last = current_time - _last_request_time
    if time_since_last < _min_request_interval:
        time.sleep(_min_request_interval - time_since_last)
    _last_request_time = time.time()

    try:
        resp = requests.post(GEMINI_URL, json=payload, timeout=45)
        resp.raise_for_status()
        raw_text = resp.json()['candidates'][0]['content']['parts'][0]['text'].strip()

        # Robust JSON extraction
        raw_text = re.sub(r'^```(?:json)?\s*', '', raw_text, flags=re.IGNORECASE)
        raw_text = re.sub(r'\s*```$', '', raw_text)
        match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        
        if match:
            response_data = json.loads(match.group())
            
            # Cache successful response
            if len(_response_cache) < _cache_max_size:
                _response_cache[cache_key] = response_data
            
            return response_data

        print(f"⚠️ [Gemini] Invalid JSON format. Raw output: {raw_text[:200]}")
    except Exception as e:
        print(f"❌ [Gemini Error] {e}")

    # IMPROVED FALLBACK: If AI fails (e.g. 429), use state-aware logic
    current_action = target_prompt if target_prompt else "आगे बढ़िए।"
    fallback_reply = f"बहुत बढ़िया! {current_action}"
    
    # Identify what they just did if possible
    last_val = "that"
    if extracted_entities:
        last_val = list(extracted_entities.values())[0]

    # Better fallback feedback based on scene progress
    fallback_feedback = generate_fallback_feedback(user_text, scene, state, extracted_entities, current_action)
    
    return {
        "reply": fallback_reply,
        "feedback": fallback_feedback
    }


def generate_fallback_feedback(user_text, scene, state, extracted_entities=None, current_action=""):
    """Generate better fallback feedback when Gemini API fails."""
    title = scene.get("ui", {}).get("title", "Scene")
    
    # Basic grammar checks
    grammar_tips = []
    
    # Check for common Hindi politeness markers
    has_polite_form = any(word in user_text.lower() for word in ['आप', 'जी', 'कृपया', 'please'])
    if not has_polite_form and 'greet' in state.get('slots', {}):
        grammar_tips.append("Try using 'आप' (aap) for polite address")
    
    # Check for question words
    has_question = any(word in user_text for word in ['क्या', 'कौन', 'कवाँ', 'कब', 'क्यों'])
    if has_question and not user_text.endswith('?'):
        grammar_tips.append("End questions with a question mark (?)")
    
    # Check for basic sentence structure
    words = user_text.split()
    if len(words) < 3:
        grammar_tips.append("Try making more complete sentences")
    
    # Goal-specific feedback
    missing_slots = [s for s in scene.get("slots", []) if state["slots"].get(s) is None]
    current_goal = missing_slots[0] if missing_slots else "completion"
    goal_label = scene.get("goal_labels", {}).get(current_goal, current_goal)
    
    # Construct helpful feedback
    if grammar_tips:
        tip = f"Good effort! {grammar_tips[0]}. Current goal: {goal_label}."
    else:
        tip = f"Well done! You're working on: {goal_label}. Keep practicing!"
    
    # Better suggestion
    if extracted_entities:
        entity_val = list(extracted_entities.values())[0]
        suggestion = f"Practice saying: '{user_text}' with better pronunciation"
    else:
        suggestion = f"Try: '{user_text}' (focus on clear pronunciation)"
    
    score = 75  
    
    return {
        "overall_score": score,
        "grammar_score": score - 5,
        "relevance_score": score,
        "vocabulary_score": score - 5,
        "tip": tip,
        "suggestion": suggestion,
        "grammar_points": grammar_tips if grammar_tips else ["Sentence structure"]
    }
