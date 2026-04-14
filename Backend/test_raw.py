import requests, re, json
import os

# IMPORTANT: never hardcode API keys in git-tracked files.
key = os.environ.get("GEMINI_API_KEY")
if not key:
    raise SystemExit("Set GEMINI_API_KEY env var to run this test.")

url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={key}'
prompt = 'Respond ONLY in raw JSON no markdown. Student said "namaste suprabhat" in a cafe scene. Format: {"reply": "hindi reply", "feedback": {"score": 80, "tip": "tip", "suggestion": "sug", "grammar_points": []}}'

r = requests.post(url, json={
    'contents': [{'parts': [{'text': prompt}]}],
    'generationConfig': {'temperature': 0.2, 'maxOutputTokens': 800}
}, timeout=20)

raw = r.json()['candidates'][0]['content']['parts'][0]['text'].strip()
print('FULL RAW:')
print(repr(raw))
print()

# Strip markdown fences
raw_clean = re.sub(r'^```(?:json)?\s*', '', raw, flags=re.IGNORECASE)
raw_clean = re.sub(r'\s*```$', '', raw_clean).strip()
print('AFTER CLEAN:')
print(repr(raw_clean))
print()

m = re.search(r'\{.*\}', raw_clean, re.DOTALL)
if m:
    parsed = json.loads(m.group())
    print('PARSED OK:')
    print(json.dumps(parsed, ensure_ascii=False, indent=2))
else:
    print('NO JSON FOUND')
