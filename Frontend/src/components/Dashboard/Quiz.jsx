import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setQuestions, startQuiz } from '../../Quiz/store/quizSlice';
import { sampleQuestions } from '../../Quiz/data/questions';
import ProgressBar from '../../Quiz/ProgressBar';
import Questions from '../../Quiz/Questions';
import Timer from '../../Quiz/Timer';

<<<<<<< Updated upstream
/* ✅ Proper Fisher-Yates Shuffle */
=======
>>>>>>> Stashed changes
const getRandomQuestions = (questions, count) => {
  const shuffled = [...questions];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
};

const Quiz = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    questions,
    currentQuestionIndex,
    isQuizCompleted
  } = useSelector((state) => state.quiz);

<<<<<<< Updated upstream
  /* ✅ Load 12 random questions */
=======
>>>>>>> Stashed changes
  useEffect(() => {
    const randomQuestions = getRandomQuestions(sampleQuestions, 12);
    dispatch(setQuestions(randomQuestions));
    dispatch(startQuiz());
  }, [dispatch]);

<<<<<<< Updated upstream
  /* ✅ Redirect on completion (unchanged) */
=======
>>>>>>> Stashed changes
  useEffect(() => {
    if (isQuizCompleted) {
      navigate('/dashboard/quiz/results');
    }
  }, [isQuizCompleted, navigate]);

  if (!questions.length) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 space-y-8">

<<<<<<< Updated upstream
=======
      {/* Header */}
>>>>>>> Stashed changes
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Daily Quiz</h1>
          <p className="text-gray-500">Test your knowledge</p>
        </div>
        <Timer />
      </div>

<<<<<<< Updated upstream
=======
      {/* Progress */}
>>>>>>> Stashed changes
      <div className="mb-8">
        <ProgressBar
          current={currentQuestionIndex + 1}
          total={questions.length}
        />
      </div>

<<<<<<< Updated upstream
      <Questions />
    </div>
=======
      {/* Questions ONLY */}
      <Questions />
    </div>

>>>>>>> Stashed changes
  );
};

export default Quiz;