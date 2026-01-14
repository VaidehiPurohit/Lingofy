import React from 'react';
import { CheckCircle, XCircle, CheckCircle2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { answerQuestions, nextQuestion } from './store/quizSlice';

function Questions() {
  const dispatch = useDispatch();

  const { questions, currentQuestionIndex, answers, showExplanation } =
    useSelector((state) => state.quiz);

  const currentQuestion = questions[currentQuestionIndex];

  const currentAnswer = answers.find(
    (answer) => answer.questionId === currentQuestion.id
  );

  // Handle answer click → auto-next
  const handleOptionClick = (optionIndex) => {
    if (currentAnswer) return;

    dispatch(answerQuestions({ selectedOption: optionIndex }));

    // Auto move to next question after feedback
    setTimeout(() => {
      dispatch(nextQuestion());
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 leading-relaxed">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="grid gap-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = currentAnswer?.selectedOption === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const isWrong = isSelected && !isCorrect && showExplanation;

              let buttonClass =
                'w-full p-4 text-left rounded-xl border transition-all duration-200';

              if (showExplanation) {
                if (isCorrect) {
                  buttonClass += ' border-green-500 bg-green-50 text-green-800';
                } else if (isWrong) {
                  buttonClass += ' border-red-500 bg-red-50 text-red-800';
                } else {
                  buttonClass += ' border-gray-200 bg-gray-50 text-gray-600';
                }
              } else {
                buttonClass +=
                  ' border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md';
              }

              return (
                <button
                  key={index}
                  className={buttonClass}
                  onClick={() => handleOptionClick(index)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{option}</span>

                    {showExplanation && isCorrect && (
                      <CheckCircle2 size={20} className="text-green-600" />
                    )}
                    {showExplanation && isWrong && (
                      <XCircle size={20} className="text-red-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Explanation (optional) */}
        {showExplanation && currentQuestion.explanation && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div className="ml-3">
                <p className="text-blue-800 font-medium">Explanation</p>
                <p className="text-blue-700 mt-1">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Questions;
