import spacy
nlp = spacy.load("en_core_web_sm")

def preprocess(text):
    text = text.lower().strip()
    doc = nlp(text)
    lemmas = [token.lemma_ for token in doc if not token.is_punct]
    return lemmas

user_text = input("Enter text to preprocess: ")
lemmas = preprocess(user_text)

print(lemmas)
