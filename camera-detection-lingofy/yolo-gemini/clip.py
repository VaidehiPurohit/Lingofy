import torch
import clip
from PIL import Image

device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

LABELS = [
    "laptop", "mobile phone", "bottle",
    "coffee mug", "book", "pen",
    "chair", "table", "keyboard", "mouse"
]

text_tokens = clip.tokenize(LABELS).to(device)

def refine_label(image, bbox):
    x1, y1, x2, y2 = map(int, bbox)
    crop = image.crop((x1, y1, x2, y2))

    image_input = preprocess(crop).unsqueeze(0).to(device)

    with torch.no_grad():
        image_features = model.encode_image(image_input)
        text_features = model.encode_text(text_tokens)

        probs = (image_features @ text_features.T).softmax(dim=-1)
        idx = probs.argmax().item()

    return LABELS[idx]