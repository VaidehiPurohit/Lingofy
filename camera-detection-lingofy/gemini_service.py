import json
import re
import google.generativeai as genai
from database import get_word, save_word

genai.configure(api_key="YOUR_GEMINI_API_KEY")  # 🔑 Replace with your key

model = genai.GenerativeModel("gemini-1.5-flash")  # Flash is faster than Pro


def get_word_data(word):
    # Check cache first — avoids API call entirely
    cached = get_word(word)
    if cached:
        return {
            "word": cached[0],
            "translation": cached[1],
            "example": cached[2]
        }

    prompt = f"""Give the Hindi translation and one simple English example sentence for the word: "{word}"

Respond ONLY with a valid JSON object, no markdown, no extra text:
{{"translation": "hindi word here", "example": "simple english sentence here"}}"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()

        # Strip markdown code fences if present
        text = re.sub(r"```json|```", "", text).strip()

        parsed = json.loads(text)
        translation = parsed.get("translation", word)
        example = parsed.get("example", "")

    except Exception as e:
        print(f"Gemini error for '{word}': {e}")
        translation = word  # fallback gracefully
        example = ""

    save_word(word, translation, example)

    return {
        "word": word,
        "translation": translation,
        "example": example
    }
