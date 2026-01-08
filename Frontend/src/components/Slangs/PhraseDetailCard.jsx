import { Volume2, BookOpen } from "lucide-react";
import { useRef } from "react";

const PhraseDetailCard = ({
  phrase,
  Hindi,
  literal,
  level = "Informal",
  meaning,
  whenToUse,
  example,
  gradient,
  hoverBorder,
  audioSrc, // NEW
}) => {
  const audioRef = useRef(null);

  const handlePlayAudio = () => {
    if (!audioRef.current) return;

    audioRef.current.currentTime = 0; // restart if clicked again
    audioRef.current.play();
  };

  return (
    <div className={`w-full h-full rounded-2xl overflow-hidden border border-gray-200 bg-white flex flex-col transition-all duration-200
    hover:-translate-y-1 hover:shadow-md
    ${hoverBorder}
  `}
  >

      {/* Header */}
      <div className={`p-6 text-white ${gradient}`}>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <span>#</span>
              {phrase}
            </h2>

            <p className="italic text-xl opacity-90 mt-1 ">
              <span>{Hindi}</span>
            </p>
            <p className="italic text-sm opacity-90 mt-1">
              Literal: "{literal}"
            </p>

            <span className="inline-block mt-3 px-3 py-1 text-xs rounded-full bg-white/20">
              {level}
            </span>
          </div>

          <button
            onClick={handlePlayAudio}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
            aria-label="Play pronunciation"
          >
            <Volume2 size={20} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col gap-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Meaning</p>
          <p className="text-gray-800">{meaning}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">When to use</p>
          <p className="text-gray-800">{whenToUse}</p>
        </div>

        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
          <div className="flex items-center gap-2 text-sky-700 mb-2">
            <BookOpen size={16} />
            <p className="text-sm font-medium">Example</p>
          </div>
          <p className="italic text-gray-800">{example}</p>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={audioSrc} preload="auto" />
    </div>
  );
};

export default PhraseDetailCard;
