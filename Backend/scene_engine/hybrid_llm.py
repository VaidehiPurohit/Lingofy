import os
import requests

# We use Gemini for the hybrid fallback responses
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyD2Y3cvNtPBhw3k_OgwnxvXSVT2djkW3qE")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

def generate_fallback_response(user_text, scene, state):
    title = scene.get("ui", {}).get("title", "Scene")
    description = scene.get("ui", {}).get("description", "")
    
    # Identify what slots are still missing so the LLM can steer the user
    missing_slots = [slot for slot, val in state["slots"].items() if val is None]
    
    prompt = f"""You are the central character in a scenario called '{title}'.
Context: {description}

The user is practicing their conversation skills. 
Their current progress (filled slots): {state['slots']}
Missing information they still need to provide: {missing_slots}

The user just said something out of the strict expected flow: "{user_text}"

Your Task:
1. Act in character and respond to their statement/question naturally in Hindi (or Hinglish if appropriate).
2. After answering them, gently steer the conversation back to the missing information ({missing_slots[0] if missing_slots else 'tell them they are done'}).
3. Keep your response short and conversational (1-2 sentences max).
4. Do not include any quotes, markdown, or metadata in your response. Just the dialogue.
"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 150}
    }

    try:
        resp = requests.post(GEMINI_URL, json=payload, timeout=8)
        resp.raise_for_status()
        reply = resp.json()['candidates'][0]['content']['parts'][0]['text'].strip()
        return reply
    except Exception as e:
        print(f"LLM Fallback error: {e}")
        return "माफ़ कीजिए, मैं समझ नहीं पाया। हम क्या बात कर रहे थे?"
