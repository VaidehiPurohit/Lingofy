import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building, Coffee, GraduationCapIcon, Plane, ShoppingCart, Stethoscope, Bus, MessageSquare } from "lucide-react";
import SceneCard from "../Scenes/SceneCard";

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

  useEffect(() => {
    const fetchScenes = async () => {
      try {
        const response = await fetch("http://localhost:5000/scenes");
        const data = await response.json();
        setScenes(data);
      } catch (err) {
        console.error("Failed to fetch scenes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchScenes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Conversation Scenes</h1>
        <p className="text-m text-gray-500 mt-1">Practice real-world dialogues in different scenarios</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        {scenes.map((scene) => {
          const IconComp = IconMap[scene.icon] || IconMap.MessageSquare;
          return (
            <SceneCard
              key={scene.id}
              title={scene.title}
              description={scene.description}
              level={scene.level}
              turns={scene.turns}
              status="active"
              gradient={`bg-gradient-to-r ${scene.gradient}`}
              hoverBorder={scene.gradient.split(' ')[0].replace('from', 'hover:border')}
              icon={<IconComp className="w-6 h-6 text-white" />}
              onClick={() => navigate(`/dashboard/scenes/${scene.id}`)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Scenes;

