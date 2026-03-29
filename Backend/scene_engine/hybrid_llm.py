import os
import requests
import time

# ── GEMINI API CONFIGURATION ──────────────────────────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyBeNhp6m82kQmfW43w2I5XYnnv8ydroNQM")
GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
# ──────────────────────────────────────────────────────────────────────

def generate_fallback_response(user_text, scene, state):
    """Handle off-script messages with a natural in-character AI response."""
    title = scene.get("ui", {}).get("title", "Scene")
    missing = [s for s in state['slots'] if state['slots'].get(s) is None]

    prompt = f"""You are acting in a conversation scene: '{title}'.
Current goal: {missing[0] if missing else 'end the session'}.

User said: "{user_text}"

Respond naturally in Hindi/Hinglish (1 sentence max), then gently guide them back to the goal.
No quotes, no markdown, just dialogue.
"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.5, "maxOutputTokens": 100}
    }

    for attempt in range(2):
        try:
            resp = requests.post(GEMINI_URL, json=payload, timeout=10)

            if resp.status_code == 429:
                print(f"[Hybrid LLM] Rate limited, retrying in 2s...")
                time.sleep(2)
                continue

            resp.raise_for_status()
            reply = resp.json()['candidates'][0]['content']['parts'][0]['text'].strip()
            return reply

        except Exception as e:
            print(f"[Hybrid LLM] Error: {e}")
            if attempt == 0:
                time.sleep(1)
                continue
            return "माफ़ कीजिए, मैं समझ नहीं पाया। हम क्या बात कर रहे थे?"

    return "माफ़ कीजिए, मैं समझ नहीं पाया।"
