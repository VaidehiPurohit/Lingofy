import nltk
from nltk.tokenize import word_tokenize

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
    nltk.download('punkt_tab')

def preprocess(text):
    text = text.lower().strip()
    tokens = word_tokenize(text)
    return tokens

user_text = input("Enter text to preprocess: ")
tokens = preprocess(user_text)

print(tokens)
