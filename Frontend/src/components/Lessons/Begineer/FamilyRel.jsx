import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2 } from "lucide-react";
import FamilyItem from "./FamilyItem";
import familyData from "./familyData";

const FamilyRel = () => {
  const navigate = useNavigate();

  const playAll = () => {
    familyData.forEach((item, index) => {
      const audio = new Audio(item.sound);
      setTimeout(() => audio.play(), index * 1900);
    });
  };

  return (
    <div className="w-full mx-auto p-6 space-y-8">

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/dashboard/lessons")}
          className="flex items-center gap-2 font-medium text-gray-900 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Back to Lessons
        </button>
      </div>

      <div>
        <h1 className="text-3xl font-semibold text-gray-800">
          Numbers and Counting
        </h1>
        <p className="text-gray-900 mt-2">
          Learn Numbers
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 grid grid-cols-3 gap-6 shadow-sm">
        <div>
          <p className="text-sm text-gray-900">Level</p>
          <p className="font-medium text-gray-800">Beginner</p>
        </div>

        <div>
          <p className="text-sm text-gray-900">Words to Learn</p>
          <p className="font-medium text-gray-800">
            {familyData.length} words
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-900">Estimated Time</p>
          <p className="font-medium text-gray-800">45 minutes</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-gray-800">
          Vocabulary
        </h2>

        <button
          onClick={() =>
            navigate("/dashboard/lessons/family-members/speaking-practice")
          }
          className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
        >
          Start Practice
        </button>

        <button
          onClick={playAll}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition"
        >
          <Volume2 size={18} />
          Play All
        </button>
      </div>

      <div className="space-y-4">
        {familyData.map((word, index) => (
          <FamilyItem key={index} {...word} />
        ))}
      </div>

    </div>
  );
};

export default FamilyRel;