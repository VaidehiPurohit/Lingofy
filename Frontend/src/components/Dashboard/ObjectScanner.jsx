import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, Play, Loader2, Sparkles, X } from 'lucide-react';
import { API_BASE_URL } from '../../apiConfig';

const CaptureAndLearn = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);                  // keep track of the stream
  const audioPlayerRef = useRef(null);              // prevents GC killing audio on mobile
  const [mode, setMode] = useState('idle');         // idle | camera | captured | loading | results
  const [objects, setObjects] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);

  // ── Start camera ──────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    // Always reset state first
    setObjects([]);
    setCapturedImage(null);
    setSelectedWord(null);
    setError(null);

    try {
      // Stop any existing stream before requesting a new one
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }

      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      streamRef.current = stream;
      setMode('camera');

      // videoRef.current may not be in the DOM yet — wait briefly
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied. Please allow camera permissions.');
      setMode('idle');
    }
  }, []);

  // ── Stop camera ───────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  // ── Capture frame and detect ──────────────────────────────────────────────
  const captureImage = useCallback(async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);

    const base64Image = canvas.toDataURL('image/jpeg', 0.82);
    setCapturedImage(base64Image);
    stopCamera();
    setMode('loading');

    try {
      const res = await fetch(`${API_BASE_URL}/api/vision/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });
      const data = await res.json();
      setObjects(data.objects || []);
      setMode('results');
    } catch (err) {
      console.error('Detection failed:', err);
      setError('Detection failed. Is the backend running?');
      setMode('idle');
    }
  }, [stopCamera]);

  // ── Fetch Hindi word card ─────────────────────────────────────────────────
  const fetchWordDetails = useCallback(async (name) => {
    setSelectedWord(null);
    setIsDetailLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/vision/word/${encodeURIComponent(name)}`);
      const data = await res.json();
      setSelectedWord(data);
    } catch (err) {
      console.error('Word fetch failed:', err);
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  // ── TTS ───────────────────────────────────────────────────────────────────
  const speak = useCallback(async (text) => {
    // 1. Create player IMMEDIATELY to satisfy "User Gesture" requirement on mobile
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      URL.revokeObjectURL(audioPlayerRef.current.src);
    }
    const audio = new Audio();
    audioPlayerRef.current = audio;

    try {
      const resp = await fetch(`${API_BASE_URL}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!resp.ok) throw new Error(`TTS HTTP ${resp.status}`);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);

      // 2. Assign source and play
      audio.src = url;
      await audio.play();
    } catch (err) {
      console.error("TTS play failed:", err);
    }
  }, []);

  // ── Try Again — fully reset and reopen camera ─────────────────────────────
  const handleTryAgain = useCallback(() => {
    setMode('idle');
    setObjects([]);
    setCapturedImage(null);
    setSelectedWord(null);
    setError(null);
    // Use setTimeout so state updates flush before starting camera
    setTimeout(() => startCamera(), 100);
  }, [startCamera]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => () => stopCamera(), [stopCamera]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Sparkles className="text-indigo-600 shrink-0" size={28} />
          Capture &amp; Learn
        </h1>
        <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">
          Scan any real-world object to learn its Hindi name instantly.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium">
          <X size={16} className="shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">Dismiss</button>
        </div>
      )}

      {/* Camera / Captured Viewport */}
      <div className="relative w-full rounded-2xl md:rounded-[2rem] overflow-hidden bg-slate-900 shadow-2xl ring-1 ring-slate-200 aspect-[3/4] md:aspect-video">

        {/* IDLE STATE */}
        {mode === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 p-6 md:p-8 text-center gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <Camera className="text-indigo-600" size={36} />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800">Point at anything</h3>
              <p className="text-slate-400 text-sm mt-1 max-w-xs">Enable your camera and tap capture to identify objects around you.</p>
            </div>
            <button
              onClick={startCamera}
              className="px-6 md:px-8 py-3 md:py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
            >
              Enable Camera
            </button>
          </div>
        )}

        {/* LIVE CAMERA */}
        {mode === 'camera' && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Corner brackets */}
            <div className="absolute inset-0 pointer-events-none">
              {['top-6 left-6 border-t-4 border-l-4', 'top-6 right-6 border-t-4 border-r-4',
                'bottom-6 left-6 border-b-4 border-l-4', 'bottom-6 right-6 border-b-4 border-r-4'
              ].map((cls, i) => (
                <div key={i} className={`absolute w-8 h-8 md:w-10 md:h-10 border-indigo-400 rounded-sm ${cls}`} />
              ))}
            </div>
            {/* Capture button */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <button
                onClick={captureImage}
                className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform ring-4 ring-white/30"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                  <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border-2 border-white" />
                </div>
              </button>
            </div>
          </>
        )}

        {/* LOADING */}
        {mode === 'loading' && (
          <>
            <img src={capturedImage} className="w-full h-full object-cover blur-sm opacity-50" alt="" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-white drop-shadow-lg" size={48} />
              <p className="text-white font-black text-base md:text-lg uppercase tracking-widest drop-shadow">Identifying Objects…</p>
            </div>
          </>
        )}

        {/* RESULTS */}
        {mode === 'results' && (
          <div className="absolute inset-0">
            <img src={capturedImage} className="w-full h-full object-cover" alt="" />

            {/* Markers Container */}
            <div className="absolute inset-0 overflow-hidden">
              {(!objects || objects.length === 0) ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="bg-black/60 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                    <p className="text-white font-bold text-base md:text-lg mb-4">No objects detected. Try again with better lighting.</p>
                    <button
                      onClick={handleTryAgain}
                      className="mx-auto flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all active:scale-95 shadow-xl"
                    >
                      <RefreshCw size={16} /> Try Again
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {objects.map((obj) => (
                    <button
                      key={obj.id}
                      onClick={() => fetchWordDetails(obj.name)}
                      className="absolute group flex flex-col items-center gap-2 -translate-x-1/2 -translate-y-1/2 transition-all hover:z-10"
                      style={{
                        left: `${obj.center?.x ?? 50}%`,
                        top: `${obj.center?.y ?? 50}%`
                      }}
                    >
                      {/* Pulse Dot */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75 scale-150" />
                        <div className="w-5 h-5 bg-indigo-600 border-2 border-white rounded-full shadow-lg relative z-10 group-hover:scale-125 transition-transform" />
                      </div>

                      {/* Label Label */}
                      <div className="bg-black/70 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-full shadow-2xl opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all">
                        <span className="text-white font-black text-[10px] uppercase tracking-widest whitespace-nowrap">
                          {obj.name}
                        </span>
                      </div>
                    </button>
                  ))}

                  {/* Try Again Overlay Button (Bottom Right) */}
                  <div className="absolute bottom-6 right-6">
                    <button
                      onClick={handleTryAgain}
                      className="flex items-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black text-xs hover:bg-white/40 transition-all active:scale-95 shadow-2xl"
                    >
                      <RefreshCw size={14} /> Retake
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Word Detail Card */}
      {(selectedWord || isDetailLoading) && (
        <div className="mt-6 md:mt-8 p-5 md:p-8 bg-white border border-slate-100 rounded-2xl md:rounded-[2rem] shadow-xl animate-in slide-in-from-bottom-4 duration-400">
          {isDetailLoading ? (
            <div className="flex items-center gap-4">
              <Loader2 className="animate-spin text-indigo-600 shrink-0" size={24} />
              <p className="font-bold text-slate-500">Fetching Hindi data…</p>
            </div>
          ) : selectedWord ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                    {selectedWord.translation || "No Translation"}
                  </h2>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest shrink-0">
                    {selectedWord.word || "Unknown"}
                  </span>
                </div>
                <div className="flex gap-4">
                  {selectedWord.gender && <span className="text-sm font-medium text-slate-600"><strong>Gender:</strong> {selectedWord.gender}</span>}
                  {selectedWord.plural && <span className="text-sm font-medium text-slate-600"><strong>Plural:</strong> {selectedWord.plural}</span>}
                </div>
                <p className="text-base md:text-xl font-medium text-slate-500 italic line-clamp-2">"{selectedWord.example || "No example sentence available."}"</p>
              </div>

              {selectedWord.translation && (
                <button
                  onClick={() => speak(selectedWord.translation)}
                  className="flex items-center justify-center gap-3 px-6 md:px-8 py-4 md:py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 active:scale-95 transition-all shadow-xl shrink-0 w-full sm:w-auto"
                >
                  <Play size={18} fill="white" />
                  Listen in Hindi
                </button>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default CaptureAndLearn;
