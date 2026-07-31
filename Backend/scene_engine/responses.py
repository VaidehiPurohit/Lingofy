import random


def greeting():

    responses = [
        "नमस्ते! मैं आपकी किस प्रकार सहायता कर सकता हूँ?",
        "हेलो! स्वागत है।",
        "नमस्ते! आप कैसे हैं?"
    ]

    return random.choice(responses)
