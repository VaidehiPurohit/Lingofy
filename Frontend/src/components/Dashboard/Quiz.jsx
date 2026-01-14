import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { setQuestions, startQuiz } from '../../Quiz/store/quizSlice';
import { sampleQuestions } from '../../Quiz/data/questions';

import ProgressBar from '../../Quiz/ProgressBar';
import Questions from '../../Quiz/Questions';
import Timer from '../../Quiz/Timer';

const Quiz = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { 
    questions,
    currentQuestionIndex,
    isQuizCompleted 
  } = useSelector((state) => state.quiz);

  // Load questions + start quiz
  useEffect(() => {
    dispatch(setQuestions(sampleQuestions));
    dispatch(startQuiz());
  }, [dispatch]);

  // 🚀 Redirect when quiz completes
  useEffect(() => {
    if (isQuizCompleted) {
      navigate('/dashboard/quiz/results');
    }
  }, [isQuizCompleted, navigate]);

  if (!questions.length) return null;

  return (
      <div className="max-w-5xl mx-auto px-4 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Daily Quiz</h1>
            <p className="text-gray-500">Test your knowledge</p>
          </div>
          <Timer />
        </div>

        {/* Progress */}
        <div className="mb-8">
          <ProgressBar
            current={currentQuestionIndex + 1}
            total={questions.length}
          />
        </div>

        {/* Questions ONLY */}
        <Questions />
      </div>
    
  );
};

export default Quiz;
