import json
import re
import google.generativeai as genai
from database import get_word, save_word

# ⚠️  Replace with your actual key or set env var GEMINI_API_KEY
import os
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-3.1-flash-lite-preview")   # Flash = faster + cheaper than Pro


def get_word_data(word: str) -> dict:
    # 1. Try cache first — instant response
    cached = get_word(word)
    if cached:
        return {"word": cached[0], "translation": cached[1], "example": cached[2]}

    # 2. Ask Gemini
    prompt = f"""Give the Hindi translation and one simple English example sentence for the word: "{word}"

Respond ONLY with valid JSON — no markdown, no extra text:
{{"translation": "...", "example": "..."}}"""

    try:
        response = model.generate_content(prompt)
        raw = response.text.strip()

        # Strip any accidental markdown fences
        raw = re.sub(r"^```json|^```|```$", "", raw, flags=re.MULTILINE).strip()

        parsed = json.loads(raw)
        translation = parsed.get("translation", "")
        example = parsed.get("example", "")

    except Exception as e:
        print(f"[Gemini error] {e}")
        translation = word      # fallback: return the word itself
        example = ""

    save_word(word, translation, example)
    return {"word": word, "translation": translation, "example": example}
