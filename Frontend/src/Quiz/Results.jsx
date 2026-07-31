import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetQuiz } from "./store/quizSlice";
import { Trophy, Target, XCircle, Award, TrendingUp, RotateCcw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../apiConfig";

const Results = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { score, questions, answers } = useSelector((state) => state.quiz);
  const total = questions.length;

  React.useEffect(() => {
    if (total === 0) {
      navigate("/dashboard/quiz");
      return;
    }

    // 🔥 Save Progress to Backend!
    const saveToDB = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("lingofy_user"));
        if (user?.email) {
          await fetch(`${API_BASE_URL}/api/save-progress`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              module: "Daily Quiz",
              score: Math.round((score / total) * 100),
              completed: true
            })
          });
        }
      } catch (err) { console.error("Save progress failed:", err); }
    };
    saveToDB();
  }, [total, navigate, score]);

  if (total === 0) return null;

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
          {percentage >= 80 ? "Outstanding! You're mastering Hindi at a great pace." : "Keep practicing! Every mistake is a step towards fluency."}
        </p>
      </div>

      {/* DETAILED REPORT SECTION */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-10 border border-gray-100">
        <h3 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
          <Award className="text-indigo-500" />
          Review Your Answers
        </h3>
        
        <div className="space-y-6 text-left">
          {questions.map((q, idx) => {
            const userAnswer = answers.find(a => a.questionId === q.id);
            const isCorrect = userAnswer?.isCorrect;
            
            return (
              <div key={q.id} className={`p-6 rounded-2xl border-2 transition-all ${isCorrect ? 'bg-green-50/30 border-green-100' : 'bg-red-50/30 border-red-100'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Question {idx + 1}</p>
                    {q.hindiQuestion && <h4 className="text-xl font-black text-slate-900">{q.hindiQuestion}</h4>}
                    <h4 className={`text-lg font-bold ${q.hindiQuestion ? "text-slate-400 italic" : "text-gray-800"}`}>{q.question}</h4>
                  </div>
                  <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-500 shadow-green-200' : 'bg-red-500 shadow-red-200'} shadow-lg text-white`}>
                    {isCorrect ? <Award size={20} /> : <XCircle size={20} />}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border-2 ${isCorrect ? 'bg-white border-green-200' : 'bg-white border-red-200'}`}>
                    <p className="text-xs font-black text-gray-400 uppercase mb-1">Your Answer</p>
                    <p className={`font-bold ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                      {q.options[userAnswer?.selectedOption] || "No answer"}
                    </p>
                  </div>
                  
                  {!isCorrect && (
                    <div className="p-4 rounded-xl border-2 bg-indigo-50 border-indigo-200">
                      <p className="text-xs font-black text-indigo-400 uppercase mb-1">Correct Solution</p>
                      <p className="font-bold text-indigo-700">
                        {q.options[q.correctAnswer]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 px-4 pb-8">
        <button
          onClick={handleRetry}
          className="flex-1 flex items-center justify-center gap-2 border-2 border-indigo-200 bg-white text-indigo-600 py-5 rounded-2xl font-black text-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all active:scale-[0.98] shadow-sm"
        >
          <RotateCcw />
          Retry Quiz
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all active:scale-[0.98] shadow-2xl shadow-slate-200"
        >
          <Home />
          Dashboard
        </button>
      </div>
    </div>
  );
};

export default Results;
