#!/usr/bin/env python3
"""
Lingofy Backend Runner - Optimized for low-resource systems
Only runs the main Flask backend on port 5000
"""

import os
import sys

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app

if __name__ == "__main__":
    print("🚀 Starting Lingofy Backend (Optimized for 8GB RAM)")
    print("📡 STT: Cloud-based (HF Space)")
    print("🗣️  TTS: Local gTTS (lightweight)")
    print("🎯 Audio Feedback: Background processing")
    print()
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
