import React from 'react';
import { CheckCircle, XCircle, CheckCircle2, Mic } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { answerQuestions, nextQuestion } from './store/quizSlice';
import { API_BASE_URL } from '../apiConfig';

function Questions() {
  const dispatch = useDispatch();

  const { questions, currentQuestionIndex, answers, showExplanation } =
    useSelector((state) => state.quiz);

  const currentQuestion = questions[currentQuestionIndex];

  const currentAnswer = answers.find(
    (answer) => answer.questionId === currentQuestion.id
  );

  const handleOptionClick = (optionIndex) => {
    if (currentAnswer) return;

    dispatch(answerQuestions({ selectedOption: optionIndex }));

    // ✅ Keep original auto-advance for ALL questions
    setTimeout(() => {
      dispatch(nextQuestion());
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
        <div className="mb-8">

          {/* Question Text */}
          <h2 className="text-2xl font-bold text-slate-800 mb-6 leading-relaxed">
            {currentQuestion.hindiQuestion && (
              <div className="text-3xl font-black text-slate-900 mb-3 block">
                {currentQuestion.hindiQuestion}
              </div>
            )}
            <div className={currentQuestion.hindiQuestion ? "text-lg text-slate-400 font-medium italic" : ""}>
              {currentQuestion.question}
            </div>
          </h2>

          {/* Audio Player (only shows if question has audio) */}
          {currentQuestion.type === 'audio' && (
            <div className="mb-8 flex flex-col items-center p-8 bg-sky-50 rounded-2xl border-2 border-dashed border-sky-200">
              <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center shadow-lg mb-4 animate-pulse">
                <Mic className="text-white" size={32} />
              </div>
              <p className="text-sky-700 font-bold mb-4">Audio Question</p>
              <button
                onClick={async () => {
                  const textToPlay = currentQuestion.options[currentQuestion.correctAnswer];
                  try {
                    const response = await fetch(`${API_BASE_URL}/tts`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ text: textToPlay })
                    });
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    const audio = new Audio(url);
                    audio.play();
                  } catch (err) {
                    console.error("TTS error:", err);
                  }
                }}
                className="px-8 py-3 bg-white border-2 border-sky-500 text-sky-600 rounded-xl font-bold hover:bg-sky-50 transition-all flex items-center gap-2"
              >
                <CheckCircle2 size={20} />
                Listen Word
              </button>
            </div>
          )}

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

        {/* Explanation */}
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

        {/* Optional Manual Next Button (does NOT break auto-advance) */}
        {showExplanation && currentQuestion.type === 'audio' && (
          <div className="mt-6 text-right">
            <button
              onClick={() => dispatch(nextQuestion())}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Next Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Questions;