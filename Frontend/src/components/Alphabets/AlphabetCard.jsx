import React, { useRef } from "react";
import { Volume2 } from "lucide-react";

const AlphabetCard = ({ letter, english }) => {
  const audioRef = useRef(null);

  const speakLetter = async () => {
    try {
      const response = await fetch("http://localhost:5000/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: letter }), // 🔥 speaks the letter
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      audioRef.current.src = url;
      audioRef.current.currentTime = 0;
      audioRef.current.play();

    } catch (err) {
      console.error("TTS error:", err);
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
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
        >
          <Volume2 size={20} />
        </button>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="auto" />

    </div>
  );
};

export default AlphabetCard;