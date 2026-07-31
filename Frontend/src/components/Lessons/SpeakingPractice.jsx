import {
  ArrowLeft,
  Volume2,
  Play,
  Mic,
  ArrowRight,
  RotateCcw,
  Target
} from "lucide-react";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../apiConfig";

const SpeakingPractice = ({ data, title = "Lesson" }) => {
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showTranscription, setShowTranscription] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [isWaitingFeedback, setIsWaitingFeedback] = useState(false);
  const [allScores, setAllScores] = useState([]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mimeTypeRef = useRef("audio/webm");   // tracks actual recorded MIME type
  const audioPlayerRef = useRef(null);          // prevents GC killing audio on mobile

  const currentWord = data[currentIndex];
  // Refs so onstop callback (set once at warmup) always reads the latest values
  const currentWordRef = useRef(currentWord);
  const sendAudioRef = useRef(null);
  useEffect(() => { currentWordRef.current = data[currentIndex]; }, [currentIndex, data]);

  // =========================
  // TIMER
  // =========================
  // 🎙️ PRE-INITIALIZE MIC STREAM (Fixes Click Lag!)
  const streamRef = useRef(null);
  useEffect(() => {
    const warmUpMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        streamRef.current = stream;

        // Pick the best MIME type the device supports and remember it
        const mimeType =
          MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" :
          MediaRecorder.isTypeSupported("audio/webm")             ? "audio/webm" :
          MediaRecorder.isTypeSupported("audio/mp4")              ? "audio/mp4"  :
                                                                    "";
        mimeTypeRef.current = mimeType;
        console.log("🎙️ Recording MIME type:", mimeType);

        const recorder = new MediaRecorder(stream, {
          ...(mimeType ? { mimeType } : {}),
          audioBitsPerSecond: 128000
        });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        recorder.onstop = () => sendAudioRef.current();
        console.log("🎙️ Practice Mic ready!");
      } catch (err) {
        console.warn("Practice Mic Warmup failed:", err);
      }
    };
    warmUpMic();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    let interval;

    if (isRecording) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRecording]);

  // =========================
  // 🔊 TTS — PLAY REFERENCE
  // =========================

  const playReferenceAudio = async () => {
    // 1. Create player IMMEDIATELY to satisfy "User Gesture" requirement on mobile
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      URL.revokeObjectURL(audioPlayerRef.current.src);
    }
    const audio = new Audio();
    audioPlayerRef.current = audio;

    try {
      const response = await fetch(`${API_BASE_URL}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentWord.hindi || currentWord.transliteration,
        }),
      });

      if (!response.ok) throw new Error(`TTS HTTP ${response.status}`);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // 2. Assign source and play - browser preserves the "gesture" context
      audio.src = url;
      await audio.play();
    } catch (err) {
      console.error("TTS error:", err);
    }
  };

  // =========================
  // 🎤 START / STOP RECORDING
  // =========================
  const handleMicClick = () => {
    if (!mediaRecorderRef.current) {
      alert("Microphone not ready. Please refresh!");
      return;
    }

    if (!isRecording && !isComplete) {
      // CLEAR PREVIOUS ATTEMPT DATA
      setFeedback(null);
      setRecognizedText("");
      setShowTranscription(false);
      setIsWaitingFeedback(false);

      audioChunksRef.current = [];
      mediaRecorderRef.current.start();

      setIsRecording(true);
      setSeconds(0);
    } else if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsComplete(true);
    }
  };

  // =========================
  // 📡 SEND AUDIO → STT API
  // =========================
  const [feedback, setFeedback] = useState(null);

  // =========================
  // 📡 SEND AUDIO → STT API
  // =========================
  // sendAudio definition follows

  const sendAudio = async () => {
    try {
      setIsWaitingFeedback(true);
      const mimeType = mimeTypeRef.current || "audio/webm";
      const ext = mimeType.includes("mp4") ? "mp4" : "webm";
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      console.log("📤 Sending audio blob:", audioBlob.size, "bytes, type:", mimeType);
      if (audioBlob.size === 0) {
        setRecognizedText("No audio recorded. Please try again.");
        setShowTranscription(true);
        setIsWaitingFeedback(false);
        return;
      }
      const formData = new FormData();
      formData.append("file", audioBlob, `recording.${ext}`);
      const sceneName = title.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_');
      formData.append("scene", `lesson_${sceneName}`);
      formData.append("user_id", "lesson_user");
      formData.append("expected_text", currentWordRef.current?.hindi || "");

      const response = await fetch(`${API_BASE_URL}/stt`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setRecognizedText(data.text || "No speech detected");
      
      // Safety: Only set feedback if it's a valid object with fields, not "pending"
      if (data.feedback && typeof data.feedback === "object" && data.feedback.tip) {
          setFeedback(data.feedback);
          if (data.feedback.score != null) {
              setAllScores(prev => [...prev, data.feedback.score]);
          }
      } else {
          setFeedback(null);
      }
      setShowTranscription(true);
      setIsWaitingFeedback(false);

      audioChunksRef.current = [];
    } catch (err) {
      console.error("STT error:", err);
      setRecognizedText("Error processing audio");
      setShowTranscription(true);
      setIsWaitingFeedback(false);
    }
  };

  useEffect(() => {
    sendAudioRef.current = sendAudio;
  }, [sendAudio]);

  // =========================
  // OTHER HANDLERS
  // =========================
  const handleRetry = () => {
    setIsComplete(false);
    setSeconds(0);
    setShowTranscription(false);
    setRecognizedText("");
  };

  const handleSubmit = () => {
    setShowTranscription(true);
  };

  const handleContinue = () => {
    setIsComplete(false);
    setIsRecording(false);
    setSeconds(0);
    setShowTranscription(false);
    setRecognizedText("");

    if (currentIndex < data.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // 🔥 Save Progress to Backend with ACTUAL AI SCORE!
      const saveProgress = async () => {
        try {
          const user = JSON.parse(localStorage.getItem("lingofy_user"));
          if (user?.email) {
            const avgScore = allScores.length > 0 
              ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
              : 100;

            await fetch(`${API_BASE_URL}/api/save-progress`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                module: `Lessons: ${title}`,
                score: avgScore,
                completed: true
              })
            });
          }
        } catch (err) { console.error("Save failed:", err); }
      };
      saveProgress();
      navigate("/dashboard/lessons");
    }
  };

  const progress = ((currentIndex + 1) / data.length) * 100;

  if (!currentWord) return null;

  // =========================
  // UI
  // =========================
  return (
    <div className="max-w-5xl mx-auto px-4 py-4 md:p-6 space-y-6 md:space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <span className="text-gray-600 text-sm">
          Question {currentIndex + 1} of {data.length}
        </span>
      </div>

      {/* TITLE + PROGRESS */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
          Speaking Practice
        </h1>

        <div className="w-full h-2 bg-gray-200 rounded-full mt-3 md:mt-4">
          <div
            className="h-2 bg-green-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 🔊 REFERENCE AUDIO */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-6 space-y-6">

        <div className="flex items-center gap-2 text-sky-700 font-medium">
          <Volume2 size={18} />
          Reference Audio
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-gray-800 text-lg">
            {currentWord.transliteration}
          </p>
          <p className="text-gray-600 mt-1">
            {currentWord.hindi}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={playReferenceAudio}
            className="flex-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl transition"
          >
            <Play size={18} />
            Play Audio
          </button>

          <button className="p-3 rounded-xl border border-sky-300 text-sky-600 hover:bg-sky-100 transition">
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* 🎤 RECORDING */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-6">

        <div className="flex items-center gap-2 text-rose-600 font-medium justify-start">
          <Mic size={18} />
          Your Recording
        </div>

        {!isComplete ? (
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={handleMicClick}
              className={`w-24 h-24 rounded-full text-white flex items-center justify-center shadow-lg transition ${isRecording
                ? "bg-red-500 hover:bg-red-600"
                : "bg-rose-500 hover:bg-rose-600"
                }`}
            >
              <Mic size={32} />
            </button>
            {isRecording ? (
              <>
                <p className="text-gray-800 font-medium">Recording...</p>
                <p className="text-gray-500 text-sm">
                  0:{seconds.toString().padStart(2, "0")}
                </p>
              </>
            ) : (
              <p className="text-gray-500 text-sm">Tap to Record</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg text-2xl">
              ✓
            </div>

            <p className="text-gray-800 font-medium">
              Recording Complete
            </p>

            <div className="flex gap-4 w-full">
              <button
                onClick={() => {
                  setIsComplete(false);
                  setSeconds(0);
                  setFeedback(null);
                  setRecognizedText("");
                  setShowTranscription(false);
                  audioChunksRef.current = [];
                }}
                className="flex-1 bg-white border border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50"
              >
                Retry
              </button>

              <button
                onClick={handleSubmit}
                className="flex-1 bg-green-500 text-white py-3 rounded-xl hover:bg-green-600"
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 📝 TRANSCRIPTION & FEEDBACK */}
      {showTranscription && (
        <div className="bg-white border p-6 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
              YOUR PRONUNCIATION
            </p>
            {feedback?.score != null && (
              <div className="text-green-600 font-bold border border-green-200 bg-green-50 px-3 py-1 rounded-full text-xs">
                Score: {feedback.score}%
              </div>
            )}
          </div>

          <p className="text-gray-900 text-3xl font-bold">
            {recognizedText}
          </p>

          {feedback && (
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex flex-wrap gap-2 mb-2">
                {feedback.pronunciation_score != null && (
                  <div className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">
                    Pronunciation: {feedback.pronunciation_score}%
                  </div>
                )}
                {feedback.grammar_score != null && (
                  <div className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-100">
                    Grammar: {feedback.grammar_score}%
                  </div>
                )}
                {feedback.spelling_score != null && (
                  <div className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-[10px] font-bold border border-orange-100">
                    Spelling: {feedback.spelling_score}%
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2">
                <Target size={14} className="mt-1 text-amber-500" />
                <div className="flex flex-col gap-1">
                  <p className="text-gray-600 text-sm leading-relaxed font-medium">
                    {feedback.tip}
                  </p>
                </div>
              </div>

              {feedback.suggestion && (
                <div className="p-3 bg-gray-50 rounded-lg flex flex-col gap-1 border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Lesson Suggestion:</span>
                  <p className="text-gray-900 font-bold text-xl">{feedback.suggestion}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CONTINUE */}
      <div className="flex justify-between gap-6">
        <button
          onClick={handleContinue}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition"
        >
          Continue
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default SpeakingPractice;