import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetQuiz } from "./store/quizSlice";
import { Trophy, Target, XCircle, Award, TrendingUp, RotateCcw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Results = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { score, questions } = useSelector((state) => state.quiz);

  const total = questions.length;
  const percentage = Math.round((score / total) * 100);
  const incorrect = total - score;

  const getGrade = () => {
    if (percentage >= 80) return "A";
    if (percentage >= 60) return "C";
    if (percentage >= 40) return "D";
    return "F";
  };

  const xpEarned = score * 10;

  const handleRetry = () => {
  dispatch(resetQuiz());
  navigate('/dashboard/quiz');
};


  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      
      <div className="text-center mb-10">
        <div className="w-20 h-20 mx-auto bg-yellow-400 rounded-full flex items-center justify-center shadow-lg mb-4">
          <Trophy className="text-white" size={36} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Quiz Complete!</h2>
        <p className="text-gray-500 mt-1">Here's how you performed</p>
      </div>

      {/* Score Card */}
      <div className="bg-gradient-to-r from-emerald-400 to-sky-500 rounded-3xl p-10 text-center text-white shadow-xl mb-10">
        <p className="text-sm uppercase tracking-wide opacity-90">Your Score</p>
        <p className="text-6xl font-bold my-4">{percentage}%</p>
        <p className="text-lg">{score} out of {total} correct</p>

        <span className="inline-block mt-5 bg-white text-amber-600 font-semibold px-6 py-2 rounded-full">
          Grade: {getGrade()}
        </span>
      </div>

      {/* Performance Breakdown */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Performance Breakdown
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center bg-green-50 rounded-xl p-4">
            <div className="flex items-center gap-3 text-green-700">
              <Target />
              <span>Correct Answers</span>
            </div>
            <span className="font-semibold">{score}</span>
          </div>

          <div className="flex justify-between items-center bg-red-50 rounded-xl p-4">
            <div className="flex items-center gap-3 text-red-600">
              <XCircle />
              <span>Incorrect Answers</span>
            </div>
            <span className="font-semibold">{incorrect}</span>
          </div>

          <div className="flex justify-between items-center bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-3 text-blue-600">
              <Award />
              <span>XP Earned</span>
            </div>
            <span className="font-semibold">+{xpEarned}</span>
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-10">
        <div className="flex items-center gap-3 text-purple-700 font-semibold mb-2">
          <TrendingUp />
          Feedback
        </div>
        <p className="text-purple-700">
          Keep practicing! Continue practicing to improve your language skills.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleRetry}
          className="flex-1 flex items-center justify-center gap-2 border-2 border-green-500 text-green-600 py-4 rounded-xl hover:bg-green-50 transition"
        >
          <RotateCcw />
          Retry Quiz
        </button>

        <button
          onClick={() => navigate("/dashboard/home")}
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-4 rounded-xl hover:bg-green-600 transition"
        >
          <Home />
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Results;
