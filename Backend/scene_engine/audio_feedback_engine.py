import os
import requests
import json
import re
import time
import base64

# ── GEMINI API CONFIGURATION ──────────────────────────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyBeNhp6m82kQmfW43w2I5XYnnv8ydroNQM")
GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
# ──────────────────────────────────────────────────────────────────────

def generate_audio_feedback(audio_file_path, scene_title):
    """Generate lightweight pronunciation feedback from audio using Gemini AI."""
    
    # Check file size - skip if too large (reduce API load)
    try:
        file_size = os.path.getsize(audio_file_path)
        if file_size > 1024 * 1024:  # 1MB limit
            print(f"[Audio Feedback] Audio file too large ({file_size} bytes), skipping")
            return {"score": None, "tip": "Audio recorded successfully!", "suggestion": ""}
    except:
        pass
    
    # Read and encode the audio file
    try:
        with open(audio_file_path, "rb") as f:
            audio_data = base64.b64encode(f.read()).decode("utf-8")
    except Exception as e:
        print(f"[Audio Feedback] Could not read audio file: {e}")
        return None

    prompt = f"""You are a Hindi language tutor. Listen to this short audio clip from a student practicing: {scene_title}

Focus on pronunciation and accent. Give brief, encouraging feedback.

Return ONLY JSON: {{"score": 80, "tip": "One short tip", "suggestion": "Specific improvement"}}"""

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": "audio/webm",
                            "data": audio_data
                        }
                    }
                ]
            }
        ],
        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 256}  # Reduced tokens
    }

    # Retry logic if rate-limited
    for attempt in range(2):
        try:
            resp = requests.post(GEMINI_URL, json=payload, timeout=15)  # Reduced timeout
            
            if resp.status_code == 429:
                print(f"[Audio Feedback] Rate limited, retrying in 1s... (attempt {attempt+1})")
                time.sleep(1)  # Reduced wait time
                continue
            
            resp.raise_for_status()
            raw_text = resp.json()['candidates'][0]['content']['parts'][0]['text'].strip()
            
            # Extract JSON from response
            match = re.search(r'\{.*\}', raw_text, re.DOTALL)
            if match:
                return json.loads(match.group())
            
            return {"score": None, "tip": "Good attempt at speaking! Keep practicing your accent.", "suggestion": ""}

        except Exception as e:
            print(f"[Audio Feedback] Error (attempt {attempt+1}): {e}")
            if attempt == 0:
                time.sleep(0.5)  # Reduced retry delay
                continue
            return None

    return None
