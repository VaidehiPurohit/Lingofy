import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Send,
    Mic,
    Volume2,
    CheckCircle2,
    RotateCcw,
    Languages,
    History,
    MessageCircle,
    Trophy,
    Target
} from 'lucide-react';
import { API_BASE_URL } from '../../apiConfig';

const GenericScenePage = () => {
    const { sceneId } = useParams();
    const navigate = useNavigate();

    const [userId] = useState(() => {
        const raw = localStorage.getItem("lingofy_user");
        if (!raw) return "anon";
        try {
            const parsed = JSON.parse(raw);
            return String(parsed?.id ?? "anon");
        } catch {
            return "anon";
        }
    });

    const [sceneData, setSceneData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [completedGoals, setCompletedGoals] = useState({});
    const [inputText, setInputText] = useState("");
    const [status, setStatus] = useState("active");
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [translations, setTranslations] = useState({});
    const [sttAvailable, setSttAvailable] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const scrollRef = useRef(null);

    useEffect(() => {
        fetchScene();
    }, [sceneId]);

    // Real-time study metric tracker & remote sync
    useEffect(() => {
        const interval = setInterval(async () => {
            const current = parseFloat(localStorage.getItem('lingofy_study_seconds') || '0');
            const newVal = current + 1;
            localStorage.setItem('lingofy_study_seconds', newVal.toString());

            // Sync to backend every 10 seconds to reduce load
            if (newVal % 10 === 0) {
                const raw = localStorage.getItem("lingofy_user");
                if (raw) {
                    const p = JSON.parse(raw);
                    fetch(`${API_BASE_URL}/api/user-data`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: p.email, study_time: newVal })
                    }).catch(e => console.error("Sync error", e));
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const saveProgressDB = async (fBack, cStatus) => {
        if (!sceneData) return;
        try {
            const r = localStorage.getItem("lingofy_user");
            if (!r) return;
            const p = JSON.parse(r);
            if (!p.email) return;
            const s = fBack?.overall_score !== undefined ? fBack.overall_score : (fBack?.score || 0);
            await fetch(`${API_BASE_URL}/api/save-progress`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: p.email,
                    module: `Scene: ${sceneData.ui?.title || sceneData.scene || sceneId}`,
                    score: s,
                    completed: cStatus === "completed"
                })
            });
        } catch (e) { console.error("Save progress failed", e); }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchScene = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/scene/${sceneId}`);
            const data = await res.json();
            setSceneData(data);

            const chatRes = await fetch(`${API_BASE_URL}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: "__init_scene__", scene: sceneId, user_id: userId })
            });
            const chatData = await chatRes.json();
            setMessages([{ role: "bot", text: chatData.reply }]);
        } catch (err) {
            console.error(err);
        }
    };

    const sendMessage = async (text = null) => {
        const currentInput = text || inputText;
        if (!currentInput?.trim() && !text) return;

        setIsLoading(true);
        const newMessages = [...messages, { role: "user", text: currentInput }];
        setMessages(newMessages);
        setInputText("");

        try {
            const res = await fetch(`${API_BASE_URL}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: currentInput, scene: sceneId, user_id: userId })
            });
            const data = await res.json();

            setMessages(prev => [...prev, { role: "bot", text: data.reply }]);
            if (data.slots) setCompletedGoals(data.slots);
            if (data.status) setStatus(data.status);
            if (data.feedback) setFeedback(data.feedback);

            saveProgressDB(data.feedback || feedback, data.status || status);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMicClick = async () => {
        if (isRecording) {
            setIsRecording(false);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Detect the best MIME type the device supports
            const mimeType =
                MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" :
                MediaRecorder.isTypeSupported("audio/webm")             ? "audio/webm" :
                MediaRecorder.isTypeSupported("audio/mp4")              ? "audio/mp4"  : "";

            const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
            const audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const ext = (mimeType || "").includes("mp4") ? "mp4" : "webm";
                const audioBlob = new Blob(audioChunks, { type: mimeType || "audio/webm" });
                sendAudio(audioBlob, `recording.${ext}`, mimeType || "audio/webm");
                stream.getTracks().forEach(t => t.stop());
            };

            setIsRecording(true);
            mediaRecorder.start();
            setTimeout(() => {
                if (mediaRecorder.state === "recording") {
                    mediaRecorder.stop();
                    setIsRecording(false);
                }
            }, 4000);

        } catch (err) {
            console.error("Mic error:", err);
            setSttAvailable(false);
        }
    };

    const sendAudio = async (blob, filename = "recording.webm", contentType = "audio/webm") => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("file", blob, filename);
        formData.append("scene", sceneId);
        formData.append("user_id", userId);
        console.log(`🎙️ Scene STT: ${filename} (${blob.size} bytes, ${contentType})`);

        try {
            const res = await fetch(`${API_BASE_URL}/stt`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();

            if (data.text) {
                await sendMessage(data.text);
            } else if (data.error) {
                console.warn("STT warning:", data.error);
                setMessages(prev => [...prev, { role: "bot", text: "माफ़ कीजिए, मैं समझ नहीं पाया। (Could not hear clearly)" }]);
            }
        } catch (err) {
            console.error("Audio upload error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTranslate = async (index, text) => {
        if (translations[index]) {
            setTranslations(prev => {
                const next = { ...prev };
                delete next[index];
                return next;
            });
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/translate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, target: "en" })
            });
            const data = await res.json();
            setTranslations(prev => ({ ...prev, [index]: data.translation }));
        } catch (err) {
            console.error("Translation error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const audioRef = useRef(null);

    const handleSpeak = async (text) => {
        if (isSpeaking) return;
        setIsSpeaking(true);
        // Create Audio IMMEDIATELY to keep user-gesture context alive on mobile
        const audio = new Audio();
        audioRef.current = audio;
        audio.onended = () => setIsSpeaking(false);
        try {
            const res = await fetch(`${API_BASE_URL}/tts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text })
            });
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            audio.src = url;
            await audio.play();
        } catch (err) {
            console.error("TTS error:", err);
            setIsSpeaking(false);
        }
    };

    const handleUndo = async () => {
        if (messages.length < 2) return;

        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/undo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ scene: sceneId, user_id: userId })
            });
            const data = await res.json();

            setMessages(currentMessages => {
                if (currentMessages.length === 0) return currentMessages;
                const lastMsg = currentMessages[currentMessages.length - 1];
                const count = (lastMsg.role === "user") ? 1 : 2;

                setTranslations(prev => {
                    const next = { ...prev };
                    for (let j = 0; j < count; j++) {
                        delete next[currentMessages.length - 1 - j];
                    }
                    return next;
                });

                return currentMessages.slice(0, -count);
            });

            if (data.slots) setCompletedGoals(data.slots);
            if (data.status) setStatus(data.status);
            setFeedback(null);
        } catch (err) {
            console.error("Undo error:", err);
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestart = () => window.location.reload();
    const isCompleted = status === "completed";

    if (!sceneData) return <div className="flex items-center justify-center min-h-screen bg-slate-50"><div className="animate-pulse text-indigo-600 font-bold">Initializing Scene...</div></div>;

    const progress = (Object.values(completedGoals).filter(v => v !== null).length / (sceneData.slots.length)) * 100;

    return (
        <div className="min-h-screen bg-slate-50 px-3 py-4 md:p-6 lg:p-10 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto flex flex-col gap-4 md:gap-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <button onClick={() => navigate('/dashboard/scenes')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition group w-fit">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back
                    </button>
                    <div className="flex items-center gap-4">
                        {isCompleted && (
                            <button onClick={handleRestart} className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-bold text-gray-700 transition">
                                <RotateCcw size={15} /> Restart
                            </button>
                        )}
                    </div>
                </div>

                <div className="w-full bg-indigo-50 h-3 rounded-full overflow-hidden border border-indigo-100 shadow-sm">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
                    <div className="lg:col-span-1 space-y-4 md:space-y-6">
                        <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] shadow-xl border border-gray-100 relative overflow-hidden group">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                                    <Target size={20} />
                                </div>
                                <h2 className="font-black text-xs uppercase tracking-widest text-slate-400">Goals</h2>
                            </div>
                            <div className="space-y-5">
                                {sceneData.slots.map((slot) => (
                                    <div key={slot} className="flex items-center gap-4 group">
                                        <div className={`transition-all duration-500 ${completedGoals[slot] ? 'scale-110' : ''}`}>
                                            {completedGoals[slot] ? (
                                                <div className="bg-green-100 text-green-600 p-1.5 rounded-full ring-4 ring-green-50">
                                                    <CheckCircle2 size={18} />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full border-2 border-slate-100 transition-colors" />
                                            )}
                                        </div>
                                        <span className={`text-[13px] font-bold transition-colors ${completedGoals[slot] ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                                            {sceneData.goal_labels[slot] || slot}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {feedback && (
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2rem] text-white shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-500">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-black text-xs uppercase tracking-widest opacity-80">Feedback</h3>
                                    <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black">{feedback.overall_score !== undefined ? feedback.overall_score : feedback.score}/100</div>
                                </div>
                                <p className="text-sm font-medium leading-relaxed mb-4 italic opacity-90">"{feedback.tip}"</p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {feedback.grammar_score !== undefined && (
                                        <div className="bg-white/10 px-2.5 py-1 rounded-lg text-[10px] font-bold">Grammar: {feedback.grammar_score}</div>
                                    )}
                                    {feedback.relevance_score !== undefined && (
                                        <div className="bg-white/10 px-2.5 py-1 rounded-lg text-[10px] font-bold">Relevance: {feedback.relevance_score}</div>
                                    )}
                                    {feedback.vocabulary_score !== undefined && (
                                        <div className="bg-white/10 px-2.5 py-1 rounded-lg text-[10px] font-bold">Vocab: {feedback.vocabulary_score}</div>
                                    )}
                                </div>

                                <div className="p-4 bg-white/10 rounded-2xl border border-white/5">
                                    <p className="text-[11px] font-bold uppercase tracking-widest opacity-60 mb-2">Try this instead:</p>
                                    <p className="text-sm font-bold text-indigo-100">{feedback.suggestion}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-3 flex flex-col h-[500px] md:h-[650px] bg-white rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden relative">
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-10 space-y-4 md:space-y-8 bg-slate-50/30">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`relative max-w-[75%] p-5 rounded-2xl shadow-sm transition-all duration-300 ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-none'
                                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                                        }`}>
                                        <p className="text-[15px] font-medium leading-relaxed">{msg.text}</p>

                                        {translations[i] && (
                                            <p className={`mt-2 pt-2 border-t text-xs leading-relaxed ${msg.role === "user" ? "text-indigo-100 border-indigo-300/40" : "text-slate-500 border-slate-200"}`}>
                                                {translations[i]}
                                            </p>
                                        )}

                                        <div className={`mt-2 flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                            {msg.role === "user" && (i === messages.length - 1 || i === messages.length - 2) && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleUndo();
                                                    }}
                                                    className={`p-1.5 rounded-lg transition-colors hover:bg-indigo-500 text-indigo-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    title="Retry"
                                                    disabled={isLoading}
                                                >
                                                    <RotateCcw size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleTranslate(i, msg.text)}
                                                className={`p-1.5 rounded-lg transition-colors ${msg.role === "user" ? "hover:bg-indigo-500 text-indigo-200" : "hover:bg-slate-100 text-slate-400"} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title="Translate"
                                                disabled={isLoading}
                                            >
                                                <Languages size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleSpeak(msg.text)}
                                                className={`p-1.5 rounded-lg transition-all ${msg.role === "user" ? "hover:bg-indigo-500 text-indigo-200" : "hover:bg-slate-100 text-slate-400"} ${isSpeaking ? "opacity-50 cursor-wait bg-slate-200" : ""}`}
                                                title="Speak text"
                                                disabled={isSpeaking}
                                            >
                                                <Volume2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start animate-pulse">
                                    <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-2">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 md:p-8 bg-white border-t border-gray-100">
                            <div className={`flex items-center gap-2 md:gap-4 bg-gray-50 p-2 rounded-2xl border-2 border-gray-100 focus-within:border-indigo-500 focus-within:bg-white transition-all ${isCompleted ? 'opacity-50' : ''}`}>
                                <button onClick={handleMicClick} className={`p-3 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-indigo-500'}`} disabled={isCompleted || !sttAvailable} title={sttAvailable ? "Use microphone" : "Voice temporarily unavailable"}><Mic size={24} /></button>

                                <input
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder={isCompleted ? "Scene Finished!" : "Type your message..."}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 font-bold py-3 outline-none"
                                    disabled={isCompleted || isLoading}
                                />
                                <button
                                    onClick={() => sendMessage()}
                                    disabled={isCompleted || !inputText.trim() || isLoading}
                                    className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
                                >
                                    <Send size={24} />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenericScenePage;
