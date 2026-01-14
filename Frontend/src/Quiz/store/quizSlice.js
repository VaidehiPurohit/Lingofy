import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  isQuizCompleted: false,
  score: 0,
  timeLeft: 300,
  isTimerActive: false,
  showExplanation: false,
};

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    setQuestions: (state, action) => {
      state.questions = action.payload;
    },

    startQuiz: (state) => {
      state.currentQuestionIndex = 0;
      state.answers = [];
      state.isQuizCompleted = false;
      state.score = 0;
      state.timeLeft = 300;
      state.isTimerActive = true;
      state.showExplanation = false;
    },

    answerQuestions: (state, action) => {
      const correctQuestion = state.questions[state.currentQuestionIndex];
      const isCorrect =
        action.payload.selectedOption === correctQuestion.correctAnswer;

      state.answers.push({
        questionId: correctQuestion.id,
        selectedOption: action.payload.selectedOption,
        isCorrect,
      });

      if (isCorrect) state.score += 1;
      state.showExplanation = true;
    },

    nextQuestion: (state) => {
      state.showExplanation = false;
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex++;
      } else {
        state.isQuizCompleted = true;
        state.isTimerActive = false;
      }
    },

    previousQuestion: (state) => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex--;
      }
      state.showExplanation = false;
    },

    decrementTimer: (state) => {
      if (state.isTimerActive && state.timeLeft > 0) {
        state.timeLeft -= 1;
      }
      if (state.timeLeft === 0) {
        state.isQuizCompleted = true;
        state.isTimerActive = false;
      }
    },

    resetQuiz: () => initialState,
  },
});

export const {
  setQuestions,
  startQuiz,
  decrementTimer,
  answerQuestions,
  nextQuestion,
  previousQuestion,
  resetQuiz,
} = quizSlice.actions;

export default quizSlice.reducer;
