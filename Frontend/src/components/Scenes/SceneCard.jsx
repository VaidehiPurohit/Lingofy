import { CheckCircle2, Play } from "lucide-react";
import React from "react";

const SceneCard = ({
  title,
  description,
  level,
  turns,
  status,
  icon,
  gradient,
  hoverBorder,
  onClick,
}) => {
  const isCompleted = status === "completed";

  return (
    <div
     onClick={onClick}
      className={`
        w-full rounded-2xl border
        transition-all duration-200
        hover:-translate-y-1 hover:shadow-md
        ${
          isCompleted
            ? "bg-indigo-50 border-indigo-400"
            : "bg-white border-gray-200"
        }
        ${hoverBorder}
      `}
    >
      {/* HEADER */}
      <div className="p-6 flex items-start gap-4">
        <div
          className={`
            w-14 h-14 rounded-2xl flex items-center justify-center
            text-white shrink-0
            ${gradient}
          `}
        >
          {icon}
        </div>

        <div className="flex-1">
          <h3 className="text-lg text-gray-900">
            {title}
          </h3>
          <p className="text-gray-500 mt-1">
            {description}
          </p>
        </div>
      </div>

      <div className="px-6 flex items-center gap-3 text-m">
        <span
          className={`
            px-3 py-1 rounded-full font-medium
            ${
              level === "Beginner"
                ? "bg-emerald-100 text-emerald-700"
                : level === "Intermediate"
                ? "bg-amber-100 text-amber-700"
                : "bg-rose-100 text-rose-700"
            }
          `}
        >
          {level}
        </span>

        <span className="text-gray-500">
          {turns} dialogue turns
        </span>
      </div>

      {/* FOOTER */}
      <div className="px-6 pb-6 mt-4">
        {isCompleted ? (
          <div className="flex items-center gap-2 text-indigo-600 font-medium">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
              ✓
            </span>
            Completed
          </div>
        ) : (
          <div className="flex items-center gap-2 text-indigo-600 font-medium">
            <Play size={18} />
            Start Scene
          </div>
        )}
      </div>
    </div>
  );
};

export default SceneCard;
