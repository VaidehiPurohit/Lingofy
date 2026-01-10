from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer('all-MiniLM-L6-v2')

user_sentence = "can i have pizza"
expected_sentences = [
    "i would like pizza",
    "i want a burger",
    "can i order pasta"
]

user_emb = model.encode(user_sentence, convert_to_tensor=True)
expected_embs = model.encode(expected_sentences, convert_to_tensor=True)

scores = util.cos_sim(user_emb, expected_embs)

print(scores)
