import os
import requests
import json
import re

GEMINI_MODEL = "gemini-3.1-flash-lite-preview"
GEMINI_URL = f'https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}'

# --- Test 1: Basic Feedback + Reply JSON parse ---
print("=" * 60)
print("TEST 1: Gemini Scene Response (Cafe scene, student says namaste)")
print("=" * 60)

prompt = """You are an expert Hindi language tutor acting as a character in a 'The Cozy Cafe' scenario.

CONVERSATION GOALS (track these):
  - Greet the Barista: ❌ Not yet
  - Choose Coffee Type: ❌ Not yet

STUDENT'S CURRENT GOAL: "Greet the Barista"
ENTITIES DETECTED IN STUDENT'S MESSAGE: None detected

STUDENT SAID: "namaste suprabhat"

YOUR TASKS:
1. Respond IN-CHARACTER as the Cafe staff in natural Hindi/Hinglish (1-2 sentences).
2. Give linguistic feedback on the student's Hindi.

RESPOND ONLY IN THIS EXACT JSON FORMAT (no markdown, no code blocks, just raw JSON):
{
  "reply": "Your in-character Hindi/Hinglish response here",
  "feedback": {
    "score": 85,
    "tip": "One specific, actionable grammar or usage tip in English",
    "suggestion": "How a native Hindi speaker would say this correctly",
    "grammar_points": ["Note 1"]
  }
}"""

r = requests.post(
    GEMINI_URL,
    json={
        'contents': [{'parts': [{'text': prompt}]}],
        'generationConfig': {'temperature': 0.4, 'maxOutputTokens': 600}
    },
    timeout=15
)

print(f"HTTP Status: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    raw = data['candidates'][0]['content']['parts'][0]['text'].strip()
    print(f"Raw text:\n{raw}\n")

    # Strip markdown code fences
    raw = re.sub(r'^```(?:json)?\s*', '', raw, flags=re.IGNORECASE)
    raw = re.sub(r'\s*```$', '', raw)

    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        parsed = json.loads(match.group())
        print("✅ PARSED SUCCESSFULLY:")
        print(f"  reply    : {parsed.get('reply')}")
        fb = parsed.get('feedback', {})
        print(f"  score    : {fb.get('score')}")
        print(f"  tip      : {fb.get('tip')}")
        print(f"  suggestion: {fb.get('suggestion')}")
    else:
        print("❌ JSON NOT FOUND in response")
else:
    print(f"❌ API Error: {r.text[:300]}")
