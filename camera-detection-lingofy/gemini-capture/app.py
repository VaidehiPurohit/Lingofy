from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import base64, json, re, requests, os

app = Flask(__name__, static_folder='static')
CORS(app)
# ── Prompt ────────────────────────────────────────────────────────────────────
PROMPT = """You are an object detection system. Analyze this image and identify every distinct visible object.

For each object, return a JSON object with:
- "name": specific name in lowercase (e.g. "laptop", "bottle")
- "box_2d": [ymin, xmin, ymax, xmax] as percentage 0-1000
- "confidence": 0.0 to 1.0

Rules:
- Include visible products, furniture, clothing, gadgets, etc.
- SKIP generic background objects like "wall", "ceiling", "floor", "sky".
- Return ONLY a JSON array. DO NOT TRUNCATE.
- Ensure every opening brace { has a closing brace }.

Example output:
[{"name":"laptop","box_2d":[200,300,700,800],"confidence":0.99}]"""


def parse_objects(raw: str) -> list:
    raw = raw.strip()
    # Remove markdown code fences
    raw = re.sub(r'```(?:json)?', '', raw).strip()
    
    # helper to check if string is valid json
    def try_json(s):
        try:
            d = json.loads(s)
            if isinstance(d, list): return d
            if isinstance(d, dict):
                for v in d.values():
                    if isinstance(v, list): return v
        except: return None
        return None

    # 1. Try full JSON load
    res = try_json(raw)
    if res is not None: return res

    # 2. Try to fix common truncation (missing closing brace/bracket)
    # This is useful for when Gemini hits max tokens mid-list
    for suffix in [']', '}', '}]', '}]}']:
        res = try_json(raw + suffix)
        if res is not None: return res

    # 3. Robust object-by-object extraction
    objs = []
    # Look for the start of an object and the start of an array
    pattern = r'\{[^{}]*?"name"[^{}]*?(?:"box"|"box_2d")[^{}]*?\['
    for match in re.finditer(pattern, raw, re.DOTALL):
        segment = match.group()
        # If the array is truncated like [300, 
        # let's try to close it with dummy values to save the label
        # We try various padding strategies
        for suffix in ['0,0,0]}', '500,500,500]}', '10,10,10]}', '],"confidence":0.9}', '],"confidence":0.9}]']:
            try:
                # Check for existing comma to avoid double commas
                test_segment = segment
                if not test_segment.endswith(('[', ',')):
                    test_segment += ','
                
                obj = json.loads(test_segment + suffix)
                if 'name' in obj:
                    objs.append(obj)
                    break 
            except: continue
            
    # Fallback to standard object match if we found nothing
    if not objs:
        pattern = r'\{[^{}]*?"name"[^{}]*?\}'
        for match in re.finditer(pattern, raw, re.DOTALL):
            try:
                objs.append(json.loads(match.group()))
            except:
                try: objs.append(json.loads(match.group() + '}'))
                except: continue
            
    return objs


@app.route('/')
def index():
    return send_from_directory('static', 'index.html')


@app.route('/detect', methods=['POST'])
def detect():
    if GEMINI_API_KEY == "YOUR_API_KEY_HERE":
        return jsonify({'error': 'API key not set. Edit app.py'}), 401

    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({'error': 'No image provided'}), 400

    img_b64 = data['image'].split(',')[-1]
    mime    = 'image/jpeg'

    # Use the global GEMINI_URL configured at the top
    print(f"DEBUG: Using Gemini URL: {GEMINI_URL}")

    payload = {
        "contents": [{
            "parts": [
                {"text": PROMPT},
                {"inline_data": {"mime_type": mime, "data": img_b64}}
            ]
        }],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 2048,
        }
    }

    try:
        resp = requests.post(GEMINI_URL, json=payload, timeout=30)
        resp.raise_for_status()
        raw_text = resp.json()['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"DEBUG: Error: {e}")
        return jsonify({'error': str(e)}), 500

    print(f"DEBUG: Gemini raw text length: {len(raw_text)}")
    print(f"DEBUG: Gemini raw text: {raw_text[:200]}...")
    raw_objects = parse_objects(raw_text)

    objects = []
    for i, obj in enumerate(raw_objects):
        # Handle both [x1,y1,x2,y2] and [ymin,xmin,ymax,xmax]
        raw_box = obj.get('box_2d') or obj.get('box') or []
        
        # New: Handle 5-element arrays where the 5th is confidence [y1, x1, y2, x2, conf]
        if not (isinstance(raw_box, list) and (len(raw_box) == 4 or len(raw_box) == 5)):
            continue

        try:
            b = [float(x) for x in raw_box]
            
            # Extract confidence if present in the box array
            detected_confidence = b[4] if len(b) > 4 else float(obj.get('confidence', 0.9))
            
            # Normalization check: 0-1000 vs 0-100 vs 0-1
            # We only look at the first 4 coordinate values
            max_val = max(b[:4])
            coords = b[:4]
            
            if max_val <= 1.05:
                # 0-1 range
                coords = [x * 100.0 for x in coords]
            elif max_val > 105:
                # 0-1000 range
                coords = [x / 10.0 for x in coords]
            
            # Map [ymin, xmin, ymax, xmax] to [x1, y1, x2, y2]
            y1, x1, y2, x2 = coords
            
            # Clamp
            x1, x2 = max(0, min(100, x1)), max(0, min(100, x2))
            y1, y2 = max(0, min(100, y1)), max(0, min(100, y2))

            if abs(x2-x1) < 1 or abs(y2-y1) < 1: continue

            objects.append({
                'id': i,
                'name': str(obj.get('name', 'object')).lower().strip(),
                'confidence': round(detected_confidence, 2),
                'box': {'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2},
                'area': abs(x2-x1) * abs(y2-y1)
            })
        except:
            continue

    # Sort by area descending (large things first, small things on top)
    objects.sort(key=lambda x: x['area'], reverse=True)
    
    print(f"DEBUG: Found {len(objects)} valid objects")
    return jsonify({'objects': objects, 'count': len(objects)})



@app.route('/health')
def health():
    # Use the global API key check
    key_set = GEMINI_API_KEY != "YOUR_API_KEY_HERE" and "AIzaSy" in GEMINI_API_KEY
    return jsonify({'status': 'ok', 'api_key_set': key_set, 'url': GEMINI_URL})


if __name__ == '__main__':
    print('\n' + '─'*48)
    print('  WordCam  —  Gemini 2.5 Flash Edition')
    print('─'*48)
    if GEMINI_API_KEY == "YOUR_API_KEY_HERE":
        print('  ⚠  No API key set!')
        print('  Edit app.py → replace YOUR_API_KEY_HERE')
    else:
        print(f'  ✓  API key loaded')
    print('\n  Running at → http://localhost:5000')
    print('─'*48 + '\n')
    app.run(debug=False, port=5000, threaded=True)
