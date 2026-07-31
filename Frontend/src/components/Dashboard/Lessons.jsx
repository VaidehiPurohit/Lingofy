import React from "react";
import BegLessons from "../Lessons/Begineer/BegLessons";
import IntLessons from "../Lessons/Intermediate/IntLessons";
import AdvLessons from "../Lessons/Advanced/AdvLessons";

const Lessons = () => {
  const [progressData, setProgressData] = React.useState([]);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const savedUser = localStorage.getItem("lingofy_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      const fetchProgress = () => {
        fetch(`http://localhost:5000/api/get-progress?email=${parsedUser.email}`)
          .then(res => res.json())
          .then(data => setProgressData(data))
          .catch(err => console.error(err));
      };

      fetchProgress();
      window.addEventListener('focus', fetchProgress);
      return () => window.removeEventListener('focus', fetchProgress);
    }
  }, []);

  const completedData = progressData.filter(p => p.status === 'completed');
  const completedLessons = new Set(completedData.filter(p => p.module.startsWith('Lessons:')).map(p => p.module)).size;
  const totalLessons = 20; // 10 Beg + 5 Int + 5 Adv
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  // Locking Logic
  const begModuleCount = 10;
  const intModuleCount = 5;
  
  const completedBegCount = new Set(completedData.filter(p => p.module.startsWith('Lessons:') && 
    ["Basic Greetings", "Numbers & Counting", "Family Members", "Colors", "Body Parts", "Food & Drinks", "Days & Time", "Directions & Places", "Emotions", "Weather & Seasons"].includes(p.module.replace("Lessons: ", ""))).map(p => p.module)).size;
  
  const completedIntCount = new Set(completedData.filter(p => p.module.startsWith('Lessons:') && 
    ["Business & Work", "Travel & Shopping", "Social Events", "Health & Wellness", "Technology"].includes(p.module.replace("Lessons: ", ""))).map(p => p.module)).size;

  const isIntermediateLocked = completedBegCount < begModuleCount && user?.level === "Beginner";
  const isAdvancedLocked = (completedIntCount < intModuleCount || isIntermediateLocked) && user?.level !== "Advanced";

  return (
    <div id="lessons" className="space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Lessons</h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">Structured learning path to master the language</p>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
            <span className="text-xs font-bold text-indigo-400 uppercase">Current Level</span>
            <p className="text-indigo-700 font-bold">{user?.level || "Beginner"}</p>
        </div>
      </div>

      <div className="rounded-2xl p-5 md:p-6 text-white bg-gradient-to-r from-indigo-500 to-cyan-500 shadow-lg border border-indigo-400/20">
        <p className="text-sm opacity-90 font-medium">Your Overall Journey</p>
        <h2 className="text-3xl md:text-4xl font-black mt-2 tracking-tight">{completedLessons} / {totalLessons} <span className="text-base md:text-lg font-medium opacity-80">Lessons</span></h2>
        
        <div className="mt-6 h-3 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
          <div className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{ width: `${Math.max(2, progressPercent)}%` }} />
        </div>
        <p className="text-sm mt-4 font-medium opacity-90 italic">
            {progressPercent === 100 ? "Amazing! You have mastered all levels!" : "Keep going! You’re doing great!"}
        </p>
      </div>

      <div className="space-y-12">
        <BegLessons progressData={progressData} />
        
        <IntLessons 
            progressData={progressData} 
            isLocked={isIntermediateLocked} 
        />
        
        <AdvLessons 
            progressData={progressData} 
            isLocked={isAdvancedLocked} 
        />
      </div>
    </div>
  );
};

export default Lessons;