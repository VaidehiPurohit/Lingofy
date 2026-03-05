import React from "react";
import BegLessons from "../Lessons/Begineer/BegLessons";

const Lessons = () => {
  const completedLessons = 0;
  const totalLessons = 25;

  const progressPercent = Math.round(
    (completedLessons / totalLessons) * 100
  );

  return (
    <div id="lessons" className="space-y-8">

      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Lessons
        </h1>
        <p className="text-gray-500 mt-1">
          Structured learning path to master the language
        </p>
      </div>

      <div className="rounded-2xl p-6 text-white bg-gradient-to-r from-indigo-500 to-cyan-500">
        <p className="text-sm opacity-90">
          Your Progress
        </p>

        <h2 className="text-3xl font-semibold mt-2">
          {completedLessons} / {totalLessons} Lessons
        </h2>

        <div className="mt-5 h-2 w-full bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="text-sm mt-4 opacity-90">
          Keep going! You’re doing great!
        </p>
      </div>

      <BegLessons />

    </div>
  );
};

export default Lessons;