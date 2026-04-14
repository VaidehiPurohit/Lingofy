import google.generativeai as genai
from database import get_word, save_word

genai.configure(api_key="YOUR_GEMINI_API_KEY")

model = genai.GenerativeModel("gemini-pro")


def get_word_data(word):
    cached = get_word(word)

    if cached:
        return {
            "word": cached[0],
            "translation": cached[1],
            "example": cached[2]
        }

    prompt = f"""
    Give Hindi translation and one simple sentence for the word: {word}

    Return JSON:
    {{
      "translation": "...",
      "example": "..."
    }}
    """

    response = model.generate_content(prompt)
    text = response.text

    # Simple parsing (can improve later)
    lines = text.strip().split("\n")

    translation = lines[0]
    example = lines[1] if len(lines) > 1 else ""

    save_word(word, translation, example)

    return {
        "word": word,
        "translation": translation,
        "example": example
    }