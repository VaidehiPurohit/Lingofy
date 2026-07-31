import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Trophy, Brain } from 'lucide-react';
import { API_BASE_URL } from '../../apiConfig';

const PlacementQuiz = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0); // 0: Intro, 1: Quiz, 2: Result
  const [currentQuestionData, setCurrentQuestionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState(30); // Baseline starting points
  const [askedIds, setAskedIds] = useState([]);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const MAX_QUESTIONS = 5; // Test ends after 5 questions

  const fetchNextQuestion = async (currentPoints, currentAsked) => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/api/placement-quiz/next?points=${currentPoints}&asked=${currentAsked.join(',')}`;
      const res = await fetch(url);
      const data = await res.json();
      setCurrentQuestionData(data);
    } catch (err) {
      console.error("Fallback to basic logic:", err);
      // Fallback question
      setCurrentQuestionData({ id: 99, q: "Translate 'Hello'", options: ["नमस्ते", "अलविदा"], correct: 0, difficulty: 10 });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (currentStep === 1 && !currentQuestionData && questionsAnswered === 0) {
      fetchNextQuestion(points, askedIds);
    }
  }, [currentStep]);

  const handleAnswer = (index) => {
    // Basic point-weighting algorithm (Student Logic)
    const isCorrect = index === currentQuestionData.correct;

    // Add points if right, subtract if wrong to jump around difficulty array
    const newPoints = isCorrect ? points + 20 : points - 20;
    setPoints(newPoints);

    // Mark as asked
    const newAsked = [...askedIds, currentQuestionData.id];
    setAskedIds(newAsked);
    const newCount = questionsAnswered + 1;
    setQuestionsAnswered(newCount);

    // Fetch next state or complete
    if (newCount < MAX_QUESTIONS) {
      fetchNextQuestion(newPoints, newAsked);
    } else {
      setCurrentStep(2);
      finishQuiz(newPoints);
    }
  };

  const finishQuiz = async (finalPoints) => {
    // Placement Logic: <30 Beginner, 30-70 Intermediate, >70 Advanced
    let level = "Beginner";
    if (finalPoints > 70) level = "Advanced";
    else if (finalPoints >= 30) level = "Intermediate";

    try {
      const user = JSON.parse(localStorage.getItem("lingofy_user"));
      if (user?.email) {
        await fetch(`${API_BASE_URL}/api/update-level`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, level: level })
        });

        // Update local storage too
        const newUser = { ...user, level: level };
        localStorage.setItem("lingofy_user", JSON.stringify(newUser));
        // We intentionally DO NOT call onComplete here so the user can read the result screen.
      }
    } catch (err) {
      console.error("Failed to update level:", err);
    }
  };

  if (currentStep === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-100 max-w-2xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600">
          <Brain size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Analyze Your Level</h2>
        <p className="text-gray-500">Take this quick 2-minute quiz to unlock the right lessons for your skills.</p>
        <button
          onClick={() => setCurrentStep(1)}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"
        >
          Start Assessment <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  if (currentStep === 1) {
    if (loading || !currentQuestionData) {
      return (
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-100 max-w-2xl mx-auto space-y-8 flex flex-col items-center justify-center min-h-[300px]">
          <div className="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full mb-4"></div>
          <h3 className="text-xl font-bold text-gray-700 animate-pulse">Calculating Adaptive Difficulty...</h3>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-100 max-w-2xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Question {questionsAnswered + 1} / {MAX_QUESTIONS}</span>
          <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${((questionsAnswered + 1) / MAX_QUESTIONS) * 100}%` }} />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-800">{currentQuestionData.q}</h3>

        <div className="grid grid-cols-1 gap-4">
          {currentQuestionData.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className="p-5 text-left border-2 border-gray-100 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all font-medium text-gray-700 flex justify-between items-center group"
            >
              {opt}
              <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-indigo-500" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-100 max-w-2xl mx-auto text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
        <Trophy size={40} />
      </div>
      <h2 className="text-3xl font-bold text-gray-800">Assessment Complete!</h2>
      <p className="text-gray-500 text-lg">Your Hind proficiency is:</p>
      <div className="py-2 px-6 bg-indigo-600 text-white rounded-full inline-block text-xl font-bold shadow-lg shadow-indigo-200">
        {points > 70 ? "Advanced" : points >= 30 ? "Intermediate" : "Beginner"}
      </div>
      <p className="text-gray-400 text-sm mt-4"> </p>
      <button
        onClick={() => {
          const finalLevel = points > 70 ? "Advanced" : points >= 30 ? "Intermediate" : "Beginner";
          if (onComplete) onComplete(finalLevel);
          else window.location.reload();
        }}
        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default PlacementQuiz;
