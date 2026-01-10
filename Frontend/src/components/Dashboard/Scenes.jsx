import { useNavigate } from "react-router-dom";
import { Building, Coffee, GraduationCapIcon, Plane, ShoppingCart, Stethoscope } from "lucide-react";
import SceneCard from "../Scenes/SceneCard";

const Scenes = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">
          Conversation Scenes
        </h1>
        <p className="text-m text-gray-500 mt-1">
          Practice real-world dialogues in different scenarios
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SceneCard
          title="At the Restaurant"
          description="Order food and interact with waiters"
          level="Beginner"
          turns={8}
          status="completed"
          gradient="bg-gradient-to-r from-indigo-500 to-cyan-500"
          hoverBorder="hover:border-indigo-400"
          icon={<Coffee className="w-6 h-6 text-white" />}
          onClick={() => navigate("/dashboard/scenes/restaurant")}
        />

        <SceneCard
          title="Shopping Mall"
          description="Buy clothes and ask for prices"
          level="Beginner"
          turns={10}
          status="active"
          gradient="bg-gradient-to-r from-indigo-500 to-cyan-500"
          hoverBorder="hover:border-indigo-400"
          icon={<ShoppingCart className="w-6 h-6 text-white" />}
          onClick={() => navigate("/dashboard/scenes/shopping")}
        />

        <SceneCard
          title="At the Airport"
          description="Check-in and navigate the airport"
          level="Intermediate"
          turns={12}
          status="active"
          gradient="bg-gradient-to-r from-indigo-500 to-cyan-500"
          hoverBorder="hover:border-indigo-400"
          icon={<Plane className="w-6 h-6 text-white" />}
          onClick={() => navigate("/dashboard/scenes/airport")}
        />
        <SceneCard
          title="University Campus"
          description="Academic Discussions and queries"
          level="Intermediate"
          turns={10}
          status="active"
          gradient="bg-gradient-to-r from-indigo-500 to-cyan-500"
          hoverBorder="hover:border-indigo-400"
          icon={<Building className="w-6 h-6 text-white" />}
          onClick={() => navigate("/dashboard/scenes/university")}
        />

        <SceneCard
          title="Job Interview"
          description="Professional conversation practice"
          level="Advanced"
          turns={15}
          status="active"
          gradient="bg-gradient-to-r from-indigo-500 to-cyan-500"
          hoverBorder="hover:border-indigo-400"
          icon={<GraduationCapIcon className="w-6 h-6 text-white" />}
          onClick={() => navigate("/dashboard/scenes/interview")}
        />
        <SceneCard
          title="Doctor Appointment"
          description="Practice discussing symptoms and medical concerns"
          level="Advanced"
          turns={15}
          status="active"
          gradient="bg-gradient-to-r from-indigo-500 to-cyan-500"
          hoverBorder="hover:border-indigo-400"
          icon={<Stethoscope className="w-6 h-6 text-white" />}
          onClick={() => navigate("/dashboard/scenes/doctor-appointment")}
        />
      </div>
    </div>
  );
};

export default Scenes;
