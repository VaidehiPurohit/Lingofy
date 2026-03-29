import requests, json

r = requests.post(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyBeNhp6m82kQmfW43w2I5XYnnv8ydroNQM',
    json={
        'contents': [{'parts': [{'text': 'You are an expert Hindi language teacher. The student said: "namaste suprabhat". Scenario: Cafe. Respond with ONLY this JSON (no markdown): {"score": 85, "tip": "one tip", "suggestion": "better way"}'}]}],
        'generationConfig': {'temperature': 0.1, 'maxOutputTokens': 1024}
    },
    timeout=15
)

print(f"Status: {r.status_code}")
data = r.json()
raw = data['candidates'][0]['content']['parts'][0]['text']
print(f"Raw text: [{raw}]")

import re
match = re.search(r'\{.*\}', raw, re.DOTALL)
if match:
    parsed = json.loads(match.group())
    print(f"Parsed: {parsed}")
else:
    print("NO JSON FOUND")
