import { Play, Check } from "lucide-react";

const LessonCard = ({
  title,
  description,
  level,
  words,
  progress = null,
  completed = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm 
      hover:shadow-lg hover:-translate-y-1 hover:border-indigo-500 
      hover:bg-indigo-50 transition-all duration-300 cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">
            {title}
          </h3>

          <p className="text-gray-900 text-sm">
            {description}
          </p>

          <div className="flex items-center gap-4 mt-2">
            <span className="px-3 py-1 text-xs rounded-full bg-indigo-100 text-indigo-600 font-medium">
              {level}
            </span>

            <span className="text-sm text-gray-900">
              {words} words
            </span>
          </div>
        </div>

        {completed ? (
          <div className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center text-white">
            <Check size={20} />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Play size={20} />
          </div>
        )}
      </div>

      {progress !== null && (
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-900 mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-indigo-900 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonCard;