import {
  ArrowLeft,
  Volume2,
  Play,
  Mic,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const SpeakingPractice = ({ data }) => {
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showTranscription, setShowTranscription] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const currentWord = data[currentIndex];

  // =========================
  // TIMER
  // =========================
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
    try {
      const response = await fetch("http://localhost:5000/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: currentWord.hindi || currentWord.transliteration,
        }),
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      new Audio(url).play();
    } catch (err) {
      console.error("TTS error:", err);
    }
  };

  // =========================
  // 🎤 START / STOP RECORDING
  // =========================
  const handleMicClick = async () => {
    // START RECORDING
    if (!isRecording && !isComplete) {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      recorder.onstop = sendAudio;

      recorder.start();

      setIsRecording(true);
      setSeconds(0);
    }

    // STOP RECORDING
    else if (isRecording) {
      mediaRecorderRef.current.stop();

      setIsRecording(false);
      setIsComplete(true);
    }
  };

  // =========================
  // 📡 SEND AUDIO → STT API
  // =========================
  const sendAudio = async () => {
    try {
      const audioBlob = new Blob(audioChunksRef.current);

      console.log("Audio size:", audioBlob.size);

      const formData = new FormData();

      // ⭐ Flask expects "file"
      formData.append("file", audioBlob, "recording.webm");

      const response = await fetch("http://localhost:5000/stt", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log("Recognized:", data.text);

      setRecognizedText(data.text || "No speech detected");
      setShowTranscription(true);

      audioChunksRef.current = [];
    } catch (err) {
      console.error("STT error:", err);
      setRecognizedText("Error processing audio");
      setShowTranscription(true);
    }
  };

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
      navigate("/dashboard/lessons");
    }
  };

  const progress = ((currentIndex + 1) / data.length) * 100;

  if (!currentWord) return null;

  // =========================
  // UI
  // =========================
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">

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
        <h1 className="text-2xl font-semibold text-gray-800">
          Speaking Practice
        </h1>

        <div className="w-full h-2 bg-gray-200 rounded-full mt-4">
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
              className={`w-24 h-24 rounded-full text-white flex items-center justify-center shadow-lg transition
              ${
                isRecording
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
                onClick={handleRetry}
                className="flex-1 border border-gray-300 py-3 rounded-xl hover:bg-gray-100"
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

      {/* 📝 TRANSCRIPTION */}
      {showTranscription && (
        <div className="bg-gray-100 border border-gray-200 rounded-2xl p-6">
          <p className="text-gray-600 text-sm mb-2">
            Your transcription:
          </p>

          <p className="text-gray-900 text-lg font-medium">
            {recognizedText}
          </p>
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