import os
import requests
import json
import re
import time

# ── GEMINI API CONFIGURATION ──────────────────────────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyBeNhp6m82kQmfW43w2I5XYnnv8ydroNQM")
GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
# ──────────────────────────────────────────────────────────────────────

def generate_turn_feedback(user_text, scene, state):
    """Generate real-time linguistic feedback using Gemini AI."""
    title = scene.get("ui", {}).get("title", "Scene")

    prompt = f"""You are an expert Hindi language teacher helping a student practice conversations.
The student said: "{user_text}"
Scenario: {title}

Analyze their Hindi and respond with ONLY this JSON (no markdown, no explanation):
{{"score": 85, "tip": "one short tip about their Hindi", "suggestion": "a better way to say it in Hindi"}}
"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 1024}
    }

    # Retry up to 2 times with a short delay if rate-limited
    for attempt in range(2):
        try:
            resp = requests.post(GEMINI_URL, json=payload, timeout=10)
            
            if resp.status_code == 429:
                print(f"[Feedback] Rate limited, retrying in 2s... (attempt {attempt+1})")
                time.sleep(2)
                continue
            
            resp.raise_for_status()
            raw_text = resp.json()['candidates'][0]['content']['parts'][0]['text'].strip()
            
            # Extract JSON from response
            match = re.search(r'\{.*\}', raw_text, re.DOTALL)
            if match:
                return json.loads(match.group())
            
            return {"score": None, "tip": "Nice effort! Keep practicing.", "suggestion": ""}

        except Exception as e:
            print(f"[Feedback] Error (attempt {attempt+1}): {e}")
            if attempt == 0:
                time.sleep(1)
                continue
            return None

    return None
