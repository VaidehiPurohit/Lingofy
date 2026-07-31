
import { Volume2 } from "lucide-react";
import { useRef } from "react";

const NumbersItem = ({ 
  english, 
  hindi, 
  transliteration, 
  example, 
}) => {
  const audioRef = useRef(null);

  const playSound = async () => {
    try {
      const response = await fetch("http://localhost:5000/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: hindi || transliteration })
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex justify-between items-center bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-indigo-500 transition-colors duration-200">
      
      <div className="space-y-1">
        <h3 className="text-lg font-medium text-gray-800">
          {english}
        </h3>

        <p className="text-indigo-600 font-medium">
          {hindi} <span className="text-gray-900">({transliteration})</span>
        </p>

        <p className="text-sm text-gray-900 italic">
          {example}
        </p>
      </div>

      <button
        onClick={playSound}
        className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200 transition"
      >
        <Volume2 size={20} />
      </button>

      <audio ref={audioRef} preload="auto" />
    </div>
  );
};

export default NumbersItem;