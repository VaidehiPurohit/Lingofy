import string
import os
from typing import Dict, Tuple, Optional, List
from difflib import SequenceMatcher

# Optional semantic matching (SBERT)
_SENTENCE_TRANSFORMERS_MODEL_NAME = "all-MiniLM-L6-v2"
_model = None
_scene_cache = {}
# Safe-by-default: SBERT on, with fallback to fuzzy when unavailable.
# Set LINGOFY_USE_SBERT=0 to force-disable.
_USE_SBERT = os.environ.get("LINGOFY_USE_SBERT", "1") == "1"


def _get_model():
    global _model
    if not _USE_SBERT:
        return None
    if _model is not None:
        return _model
    try:
        from sentence_transformers import SentenceTransformer
    except Exception:
        return None

    _model = SentenceTransformer(_SENTENCE_TRANSFORMERS_MODEL_NAME)
    return _model


def prewarm_sbert() -> bool:
    """Try loading SBERT once at startup; return whether it is available."""
    try:
        model = _get_model()
        return model is not None
    except Exception:
        return False


def _normalize_text(text: str) -> str:
    text_lower = text.lower().strip()
    translator = str.maketrans(string.punctuation + "।", " " * (len(string.punctuation) + 1))
    return text_lower.translate(translator)


def _build_scene_semantic_cache(scene: dict):
    """
    Build embeddings for all slot variants once per process.
    Cache format:
      _scene_cache[scene_name][slot] = {
        "embeddings": <numpy array [n, dim]>,
        "canonical_for_variant": [canonical_0, ...]
      }
    """
    scene_name = scene.get("scene", "unknown_scene")
    if scene_name in _scene_cache:
        return _scene_cache[scene_name]

    cache_for_scene = {}
    model = _get_model()
    if model is None:
        _scene_cache[scene_name] = cache_for_scene
        return cache_for_scene

    slot_values = scene.get("slot_values", {}) or {}
    for slot, values in slot_values.items():
        variant_texts = []
        canonical_for_variant = []
        for canonical, variants in values.items():
            for variant in variants:
                v = (variant or "").strip()
                if not v:
                    continue
                variant_texts.append(v)
                canonical_for_variant.append(canonical)

        if not variant_texts:
            continue

        embeddings = model.encode(variant_texts, normalize_embeddings=True)
        cache_for_scene[slot] = {
            "embeddings": embeddings,
            "canonical_for_variant": canonical_for_variant,
        }

    # Handle `greet` slot (your scene JSON doesn't have slot_values for greet,
    # but it does have `intents.greeting` phrases).
    slots = scene.get("slots", []) or []
    if "greet" in slots:
        greet_variants = ((scene.get("intents", {}) or {}).get("greeting", []) or [])
        greet_variants = [str(x).strip() for x in greet_variants if str(x).strip()]
        if greet_variants:
            embeddings = model.encode(greet_variants, normalize_embeddings=True)
            cache_for_scene["greet"] = {
                "embeddings": embeddings,
                # When greet matches semantically, we store the user's text in the slot.
                "canonical_for_variant": ["__GREET__"] * len(greet_variants),
            }

    _scene_cache[scene_name] = cache_for_scene
    return cache_for_scene


def extract_entities(text: str, scene: dict, allowed_slots: Optional[List[str]] = None) -> Tuple[Dict[str, str], float]:
    """
    Returns:
      (extracted_slots, best_similarity_score)
    - extracted_slots: only slot keys from scene["slots"] that we could match
    - best_similarity_score: 1.0 when keyword match succeeds, else semantic max similarity
    """
    if not text or not text.strip():
        return {}, 0.0

    text_norm = _normalize_text(text)
    extracted: Dict[str, str] = {}
    best_score = 0.0

    # 1) Keyword matching first (fast + deterministic)
    slot_values = scene.get("slot_values", {}) or {}
    allowed_set = set(allowed_slots) if allowed_slots else None
    for slot, values in slot_values.items():
        if allowed_set is not None and slot not in allowed_set:
            continue
        if not values:
            continue

        padded_text = f" {text_norm} "
        for canonical, variants in values.items():
            for variant in variants or []:
                v = (variant or "").lower().strip()
                if not v:
                    continue
                if f" {v} " in padded_text:
                    extracted[slot] = canonical
                    best_score = 1.0
                    break
            if best_score == 1.0 and extracted.get(slot) == canonical:
                break

    # 2) If nothing matched via keywords, use semantic matching.
    # Prefer SBERT only when enabled via LINGOFY_USE_SBERT=1.
    # Otherwise use a lightweight fuzzy matcher to keep runtime stable.
    if not extracted:
        model = _get_model()
        # Increased thresholds to prevent false positives from generic words
        sbert_threshold = 0.82
        fuzzy_threshold = 0.88

        if model is not None:
            cache = _build_scene_semantic_cache(scene)
            input_emb = model.encode([text], normalize_embeddings=True)
            # Sort matches by score to only pick the BEST one if they are too similar
            matches = []
            for slot, info in cache.items():
                if allowed_set is not None and slot not in allowed_set:
                    continue
                embeddings = info["embeddings"] # shape [n, dim]
                canonical_for_variant = info["canonical_for_variant"]
                sims = (embeddings @ input_emb[0]).tolist()
                slot_best = max(sims) if sims else 0.0
                
                if slot_best >= sbert_threshold:
                    idx = sims.index(slot_best)
                    matches.append((slot_best, slot, canonical_for_variant[idx]))

            if matches:
                matches.sort(key=lambda x: x[0], reverse=True)
                # Take the top match
                best_score, best_slot, best_canonical = matches[0]
                extracted[best_slot] = text if best_slot == "greet" else best_canonical
                
                # Only take second match if it's ALSO very high score and a DIFFERENT slot
                if len(matches) > 1 and matches[1][0] > 0.85:
                    _, slot2, canon2 = matches[1]
                    extracted[slot2] = canon2
                
                best_score = best_score
        else:
            # Lightweight fallback semantic matching (fuzzy ratio).
            # This keeps scene flow stable even when SBERT isn't available/enabled.
            global_best = 0.0
            slot_values = scene.get("slot_values", {}) or {}
            for slot, values in slot_values.items():
                if allowed_set is not None and slot not in allowed_set:
                    continue
                slot_best = 0.0
                slot_best_canonical = None
                for canonical, variants in values.items():
                    for variant in variants or []:
                        v = _normalize_text(str(variant))
                        if not v:
                            continue
                        ratio = SequenceMatcher(None, text_norm, v).ratio()
                        slot_best = max(slot_best, ratio)
                        if ratio >= fuzzy_threshold:
                            slot_best_canonical = canonical
                global_best = max(global_best, slot_best)
                if slot_best_canonical:
                    extracted[slot] = slot_best_canonical
            best_score = global_best

    # Only keep slots defined in scene["slots"]
    allowed_slots = set(scene.get("slots", []) or [])
    extracted = {k: v for k, v in extracted.items() if k in allowed_slots}
    return extracted, best_score
