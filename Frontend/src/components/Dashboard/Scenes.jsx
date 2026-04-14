import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building, Coffee, GraduationCapIcon, Plane, ShoppingCart, Stethoscope, Bus, MessageSquare, Lock } from "lucide-react";
import SceneCard from "../Scenes/SceneCard";
import { API_BASE_URL } from "../../apiConfig";

// Map strings in JSON to Lucide components
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

const Scenes = () => {
  const navigate = useNavigate();
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("lingofy_user");
    if (savedUser) setUser(JSON.parse(savedUser));

    const fetchScenesAndProgress = async () => {
      try {
        const [scenesRes, progressRes] = await Promise.all([
          fetch(`${API_BASE_URL}/scenes`),
          fetch(`${API_BASE_URL}/api/get-progress?email=${JSON.parse(savedUser).email}`)
        ]);
        const scenesData = await scenesRes.json();
        const progressData = await progressRes.json();
        setScenes(scenesData);
        setProgressData(progressData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (savedUser) fetchScenesAndProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Completion counts
  const completedBegCount = new Set(progressData.filter(p => p.status === 'completed' && p.module.startsWith('Lessons:') && 
    ["Basic Greetings", "Numbers & Counting", "Family Members", "Colors", "Body Parts", "Food & Drinks", "Days & Time", "Directions & Places", "Emotions", "Weather & Seasons"].includes(p.module.replace("Lessons: ", ""))).map(p => p.module)).size;
  
  const completedIntCount = new Set(progressData.filter(p => p.status === 'completed' && p.module.startsWith('Lessons:') && 
    ["Business & Work", "Travel & Shopping", "Social Events", "Health & Wellness", "Technology"].includes(p.module.replace("Lessons: ", ""))).map(p => p.module)).size;

  const isBegFinished = completedBegCount >= 10;
  const isIntFinished = completedIntCount >= 5;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Conversation Scenes</h1>
        <p className="text-m text-gray-500 mt-1">Practice real-world dialogues in different scenarios</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        {scenes.sort((a,b) => {
            const order = { "Beginner": 1, "Intermediate": 2, "Advanced": 3 };
            return order[a.level] - order[b.level];
        }).map((scene) => {
          const IconComp = IconMap[scene.icon] || IconMap.MessageSquare;
          
          let isLocked = false;
          if (scene.level === "Intermediate" && !isBegFinished && user?.level === "Beginner") isLocked = true;
          if (scene.level === "Advanced" && (!isIntFinished || isLocked) && user?.level !== "Advanced") isLocked = true;

          return (
            <div key={scene.id} className="relative">
                <SceneCard
                title={scene.title}
                description={scene.description}
                level={scene.level}
                turns={scene.turns}
                status={isLocked ? "locked" : "active"}
                gradient={isLocked ? "bg-slate-200" : `bg-gradient-to-r ${scene.gradient}`}
                hoverBorder={isLocked ? "hover:border-slate-300" : scene.gradient.split(' ')[0].replace('from', 'hover:border')}
                icon={isLocked ? <Lock className="w-6 h-6 text-slate-400" /> : <IconComp className="w-6 h-6 text-white" />}
                onClick={() => !isLocked && navigate(`/dashboard/scenes/${scene.id}`)}
                />
                {isLocked && (
                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-sm">
                        <Lock size={14} className="text-slate-600" />
                    </div>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Scenes;

