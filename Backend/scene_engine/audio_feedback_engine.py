import os
import requests
import json
import re
import time
import base64

# ── GEMINI API CONFIGURATION ──────────────────────────────────────────
# Only read API keys from environment. Hardcoding keys is a security risk.
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-3.1-flash-lite-preview"

GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}" if GEMINI_API_KEY else None
# ──────────────────────────────────────────────────────────────────────

def generate_audio_feedback(audio_path, scene_title, expected_text=""):
    """
    Generate audio feedback by calling Gemini's multimodal audio capacity.
    """
    if not GEMINI_URL:
        return generate_audio_fallback_feedback(scene_title)

    # Check file size - skip if too large (reduce API load)
    try:
        file_size = os.path.getsize(audio_path)
        if file_size > 1024 * 1024:  # 1MB limit
            print(f"[Audio Feedback] Audio file too large ({file_size} bytes), skipping")
            return {"score": None, "tip": "Audio recorded successfully!", "suggestion": ""}
    except:
        pass
    
    # Read and encode the audio file
    try:
        with open(audio_path, "rb") as f:
            audio_data = base64.b64encode(f.read()).decode("utf-8")
    except Exception as e:
        print(f"[Audio Feedback] Could not read audio file: {e}")
        return None

    prompt = f"""You are a professional Hindi pronunciation coach. 
Analyze this student's audio for scenario: {scene_title}
EXPECTED WORD/PHRASE: "{expected_text}"

EVALUATION GOALS:
1. Determine pronunciation accuracy (0-100) specifically comparing against "{expected_text}".
2. Identify specific accent issues or vowel/consonant mispronunciations.
3. If they spoke a completely different word (e.g. "Hello" instead of "Namaste"), penalize accuracy heavily.
4. Check for natural flow and clarity.

Return ONLY JSON: 
{{
  "score": 0-100, 
  "accuracy_details": "Brief technical note on sounds (e.g. aspirated consonants, vowel length)",
  "tip": "Actionable pronunciation tip (English)", 
  "suggestion": "How to say '{expected_text}' perfectly in Hindi script"
}}"""

    if not GEMINI_URL:
        return generate_audio_fallback_feedback(scene_title)

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
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 256}
    }

    # Retry logic if rate-limited
    for attempt in range(2):
        try:
            resp = requests.post(GEMINI_URL, json=payload, timeout=12)
            
            if resp.status_code == 429:
                print(f"[Audio Feedback] Rate limited, retrying in 1s... (attempt {attempt+1})")
                time.sleep(1)
                continue
            
            resp.raise_for_status()
            raw_text = resp.json()['candidates'][0]['content']['parts'][0]['text'].strip()
            
            # Extract JSON from response
            match = re.search(r'\{.*\}', raw_text, re.DOTALL)
            if match:
                return json.loads(match.group())
            
            return {"score": None, "tip": f"Good effort in the {scene_title} scenario! Pay attention to your vowels.", "suggestion": ""}

        except Exception as e:
            print(f"[Audio Feedback] Error (attempt {attempt+1}): {e}")
            if attempt == 0:
                time.sleep(0.5)
                continue
            return generate_audio_fallback_feedback(scene_title)

    return generate_audio_fallback_feedback(scene_title)


def generate_audio_fallback_feedback(scene_title):
    """Generate fallback audio feedback when API fails."""
    tips = [
        f"Good recording! Focus on clear pronunciation in the {scene_title} scenario.",
        f"Recording received! Try speaking a bit slower for better clarity.",
        f"Well done! Pay attention to vowel sounds when practicing {scene_title}.",
        f"Audio captured! Practice with native speakers to improve your accent."
    ]
    import random
    return {
        "score": None,
        "tip": random.choice(tips),
        "suggestion": "Keep practicing your pronunciation regularly!"
    }
