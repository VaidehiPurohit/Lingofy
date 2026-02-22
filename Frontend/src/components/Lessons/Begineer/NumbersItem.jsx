
import { Volume2 } from "lucide-react";
import { useRef } from "react";

const NumbersItem = ({ 
  english, 
  hindi, 
  transliteration, 
  example, 
  sound,
}) => {
  const audioRef = useRef(null);

  const playSound = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
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

      {sound && <audio ref={audioRef} src={sound} />}
    </div>
  );
};

export default NumbersItem;