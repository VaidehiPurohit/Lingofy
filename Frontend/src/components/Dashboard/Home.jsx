import { ArrowRight } from "lucide-react";
import StatsGrid from "./StatsGrid";
import Recommend from "./Recommend";

const Home = () => {
  return (
    <div id="home"className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome back!
        </h1>
        <p className="text-gray-500 mt-1">
          Continue your language learning journey
        </p>
      </div>

      <StatsGrid />
       <div>
      <h2 className="text-lg font-semibold mb-4">
        Continue Learning
      </h2>

      <div className="relative rounded-2xl p-6 text-white bg-gradient-to-r from-indigo-500 to-cyan-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm opacity-90">Unit 1</p>
            <h3 className="text-xl font-semibold mt-1">
              Basic Greetings
            </h3>
          </div>

          <ArrowRight size={22} />
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Your Progress</span>
            <span>0%</span>
          </div>

          <div className="h-2 w-full bg-white/30 rounded-full overflow-hidden">
            <div className="h-full w-[0%] bg-white rounded-full" />
          </div>
        </div>
      </div>
    </div>
    <Recommend/>
    </div>
  );
};

export default Home;
