import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Award, Send, Mic, RotateCcw, Building, Coffee, GraduationCapIcon, Plane, ShoppingCart, Stethoscope, Bus, MessageSquare } from "lucide-react";

const IconMap = {
    Coffee: Coffee,
    ShoppingCart: ShoppingCart,
    Plane: Plane,
    Stethoscope: Stethoscope,
    Building: Building,
    GraduationCapIcon: GraduationCapIcon,
    Bus: Bus,
    MessageSquare: MessageSquare
};

const GenericScenePage = () => {
    const { sceneId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [sceneGoals, setSceneGoals] = useState([]);
    const [goalLabels, setGoalLabels] = useState({});
    const [completedGoals, setCompletedGoals] = useState({});
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [status, setStatus] = useState("ordering");
    const [isLoading, setIsLoading] = useState(false);

    // UI Metadata state
    const [uiMetadata, setUiMetadata] = useState(location.state || {
        icon: "MessageSquare",
        gradient: "from-indigo-500 to-purple-600",
        title: sceneId.charAt(0).toUpperCase() + sceneId.slice(1)
    });

    const messagesEndRef = useRef(null);
    const isInitializing = useRef(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const initScene = async () => {
            if (isInitializing.current || messages.length > 0) return;
            isInitializing.current = true;

            try {
                // 1. Fetch scene config
                const configRes = await fetch(`http://localhost:5000/scene-data/${sceneId}`);
                const configData = await configRes.json();
                setSceneGoals(configData.slots || []);
                setGoalLabels(configData.goal_labels || {});

                // If we don't have UI metadata (e.g. direct URL access), use what came from backend
                if (!location.state && configData.ui) {
                    setUiMetadata({
                        title: configData.ui.title,
                        icon: configData.ui.icon,
                        gradient: configData.ui.gradient
                    });
                }

                // 2. Reset session
                await fetch("http://localhost:5000/reset-session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ scene: sceneId })
                });

                await new Promise(r => setTimeout(r, 200));

                // 3. Greeting (Actor starts, Audience hasn't spoken yet)
                const chatRes = await fetch("http://localhost:5000/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: "__init_scene__", scene: sceneId })
                });

                const chatData = await chatRes.json();
                setMessages([{ role: "bot", text: chatData.reply }]);
                setCompletedGoals(chatData.slots || {});
                setStatus(chatData.status);
            } catch (err) {
                console.error("Scene init failed:", err);
            } finally {
                isInitializing.current = false;
            }
        };

        initScene();
    }, [sceneId]);

    const isGoalDone = (goal) => !!completedGoals[goal];
    const progressPercent = Math.round((sceneGoals.filter(g => isGoalDone(g)).length / sceneGoals.length) * 100);

    const sendMessage = async () => {
        if (!inputText.trim() || isLoading) return;
        const currentInput = inputText;
        setMessages(prev => [...prev, { role: "user", text: currentInput }]);
        setIsLoading(true);
        setInputText("");

        try {
            const response = await fetch("http://localhost:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: currentInput, scene: sceneId })
            });
            const data = await response.json();
            setMessages(prev => [...prev, { role: "bot", text: data.reply }]);
            setCompletedGoals(data.slots || {});
            setStatus(data.status);
        } catch (err) {
            console.error("Chat error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestart = () => window.location.reload();
    const isCompleted = status === "completed";

    const IconComp = IconMap[uiMetadata.icon] || MessageSquare;

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-4">
            <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <button onClick={() => navigate("/dashboard/scenes")} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold transition-all">
                        <ArrowLeft size={20} /> Back
                    </button>
                    <div className="flex items-center gap-4">
                        <div className={`px-5 py-1.5 rounded-full font-black text-xs uppercase tracking-wider ${isCompleted ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white'}`}>
                            {status}
                        </div>
                        {isCompleted && (
                            <button onClick={handleRestart} className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-bold text-gray-700 transition">
                                <RotateCcw size={15} /> Restart
                            </button>
                        )}
                    </div>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-green-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className={`aspect-video bg-gradient-to-br ${uiMetadata.gradient} rounded-2xl border flex flex-col items-center justify-center shadow-sm text-white`}>
                        <IconComp size={48} className="mb-2" />
                        <span className="text-base font-bold text-white uppercase tracking-tight">{uiMetadata.title}</span>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 pb-2 border-b border-gray-50">
                            <Award className="text-indigo-500" size={22} /> Goals
                        </h3>
                        <div className="space-y-5">
                            {sceneGoals.map(goal => (
                                <div key={goal} className="flex items-start gap-4">
                                    <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-500 ${isGoalDone(goal) ? 'bg-green-500 border-green-500 scale-110 shadow-lg' : 'border-gray-200 bg-gray-50'}`}>
                                        {isGoalDone(goal) && <span className="text-white text-[10px] font-bold">✓</span>}
                                    </div>
                                    <span className={`text-sm font-bold transition-all duration-300 ${isGoalDone(goal) ? 'text-gray-300 line-through' : 'text-gray-700'}`}>
                                        {goalLabels[goal] || goal}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 flex flex-col h-[650px] bg-white rounded-[2rem] border border-gray-200 shadow-2xl overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/30">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`relative max-w-[75%] p-5 rounded-2xl shadow-sm transition-all duration-300 ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                                    }`}>
                                    <p className="text-[15px] font-medium leading-relaxed">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 p-5 rounded-2xl rounded-bl-none animate-pulse">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                                        <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                                        <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {isCompleted && (
                            <div className="flex justify-center p-6">
                                <div className="bg-green-50 text-green-700 px-8 py-3 rounded-full font-bold text-sm border border-green-200 shadow-sm animate-bounce">
                                    🎉 SCENE MASTERED!
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-8 bg-white border-t border-gray-100">
                        <div className={`flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border-2 border-gray-100 focus-within:border-indigo-500 focus-within:bg-white transition-all ${isCompleted ? 'opacity-50' : ''}`}>
                            <button className="p-3 text-gray-400" disabled={isCompleted}><Mic size={24} /></button>
                            <input
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder={isCompleted ? "Scene Finished!" : "Type your message..."}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 font-bold py-3 outline-none"
                                disabled={isCompleted || isLoading}
                            />
                            <button onClick={sendMessage} disabled={isCompleted || isLoading} className="p-4 bg-indigo-600 text-white rounded-xl shadow-xl hover:translate-y-[-2px] active:translate-y-0 transition-all">
                                <Send size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenericScenePage;

