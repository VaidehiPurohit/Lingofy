from sentence_transformers import SentenceTransformer, util

# This model is small, fast, and understands both Hindi and English.
# It will download the first time you run it (about 400MB).
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

def get_similarity(text1, text2):
    # This helper function compares two strings and returns a score from 0 to 1
    emb1 = model.encode(text1, convert_to_tensor=True)
    emb2 = model.encode(text2, convert_to_tensor=True)
    return util.cos_sim(emb1, emb2).item()
