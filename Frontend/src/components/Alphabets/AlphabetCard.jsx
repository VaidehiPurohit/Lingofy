import React from 'react'

import { Volume2 } from "lucide-react";
import { useRef } from "react";

const AlphabetCard = ({ letter, english, sound }) => {
  const audioRef = useRef(null);

  const playSound = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };

  return (
    <div className="w-45 h-47 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
      
      <div className="flex-1 flex items-center justify-center bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl text-white text-5xl font-bold">
        {letter}
      </div>
      <div className="flex justify-between items-center mt-4">
        <span className="text-2xl font-semibold text-gray-800">
          {english}
        </span>

        <button
          onClick={playSound}
          className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 hover:bg-indigo-200 transition"
        >
          <Volume2 size={20} />
        </button>
      </div>

      {sound && <audio ref={audioRef} src={sound} />}
    </div>
  );
};

export default AlphabetCard;