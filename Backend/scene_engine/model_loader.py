
_sentence_transformers = None
_util = None

def _get_sentence_transformers():
    global _sentence_transformers, _util
    if _sentence_transformers is None:
        from sentence_transformers import SentenceTransformer, util
        _sentence_transformers = SentenceTransformer
        _util = util
    return _sentence_transformers, _util

_model = None

def _get_model():
    global _model
    if _model is None:
        print("🔄 Loading sentence transformer model...")
        SentenceTransformer, util = _get_sentence_transformers()
        _model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        print("✅ Model loaded")
    return _model

def get_similarity(text1, text2):
    #  returns a score from 0 to 1
    model = _get_model()
    SentenceTransformer, util = _get_sentence_transformers()
    emb1 = model.encode(text1, convert_to_tensor=True)
    emb2 = model.encode(text2, convert_to_tensor=True)
    return util.cos_sim(emb1, emb2).item()
