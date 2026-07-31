import React, { useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";

const AlphabetCard = ({ letter, english }) => {
  const audioRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakLetter = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);

    // 1. Prepare player IMMEDIATELY for mobile browser permission
    if (!audioRef.current) {
        audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    
    try {
      const response = await fetch(`${API_BASE_URL}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: letter }), 
      });

      if (!response.ok) throw new Error(`TTS HTTP ${response.status}`);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // 2. Play with preserved gesture context
      audio.src = url;
      audio.onended = () => setIsSpeaking(false);
      await audio.play();

    } catch (err) {
      console.error("TTS error:", err);
      setIsSpeaking(false);
    }
  };

  return (
    <div className="w-45 h-47 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">

      {/* Letter */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl text-white text-5xl font-bold">
        {letter}
      </div>

      {/* Bottom Row */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-2xl font-semibold text-gray-800">
          {english}
        </span>

        <button
          onClick={speakLetter}
          className={`p-2 rounded-full transition ${isSpeaking ? "bg-indigo-100 text-indigo-600 animate-pulse" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}
          disabled={isSpeaking}
        >
          <Volume2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default AlphabetCard;