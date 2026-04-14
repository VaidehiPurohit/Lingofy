import { ArrowRight, Trophy } from "lucide-react";
import StatsGrid from "./StatsGrid";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlacementQuiz from "./PlacementQuiz";
import { API_BASE_URL } from "../../apiConfig";

const Home = () => {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState([]);
  const [showPlacement, setShowPlacement] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("lingofy_user");
    if (!savedUser) return;

    const parsedUser = JSON.parse(savedUser);
    
    // 🔥 DEEP SYNC: Fetch latest profile from DB to sync Level, XP, Study Time across devices
    const syncProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/user-data?email=${parsedUser.email}`);
        if (res.ok) {
          const freshData = await res.json();
          // Merge fresh DB data with local object
          const updatedUser = { ...parsedUser, ...freshData };
          setUser(updatedUser);
          localStorage.setItem("lingofy_user", JSON.stringify(updatedUser));
          
          // Sync EVERYTHING to local storage so the whole app is on the same page
          if (freshData.study_time) localStorage.setItem("lingofy_study_seconds", freshData.study_time.toString());
          if (freshData.streak) localStorage.setItem("lingofy_streak", freshData.streak.toString());
          if (freshData.daily_goal) localStorage.setItem("lingofy_daily_goal", freshData.daily_goal.toString());
          if (freshData.level) localStorage.setItem("lingofy_level", freshData.level);
          if (freshData.avg_accuracy) localStorage.setItem("lingofy_avg_accuracy", freshData.avg_accuracy.toString());

          // Show placement quiz only if truly a beginner with no history
          if (!freshData.level || freshData.level === "Beginner" && !localStorage.getItem("lingofy_quiz_taken")) {
            setShowPlacement(true);
          }
        } else {
            setUser(parsedUser);
        }
      } catch (err) {
        console.error("Sync failed:", err);
        setUser(parsedUser);
      }
    };

    const fetchProgress = () => {
      fetch(`${API_BASE_URL}/api/get-progress?email=${parsedUser.email}`)
        .then(res => res.json())
        .then(data => setProgress(data))
        .catch(err => console.error(err));
    };

    syncProfile();
    fetchProgress();
    window.addEventListener('focus', fetchProgress);
    return () => window.removeEventListener('focus', fetchProgress);
  }, []);

  const navigate = useNavigate();

  if (showPlacement) {
    return (
      <div className="py-12 animate-in fade-in zoom-in duration-500">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight text-center mb-10">
            Welcome to Lingofy
          </h1>
          <PlacementQuiz onComplete={(level) => {
            setShowPlacement(false);
            localStorage.setItem("lingofy_quiz_taken", "true");
            window.location.reload(); // Refresh to update user context
          }} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const quizProgress = progress.find(p => p.module === "Daily Quiz")?.score || 0;

  const ALL_LESSONS = [
    { id: "basic-greetings", name: "Basic Greetings", path: "/dashboard/lessons/basic-greetings/speaking-practice" },
    { id: "numbers-counting", name: "Numbers & Counting", path: "/dashboard/lessons/numbers-counting/speaking-practice" },
    { id: "family-members", name: "Family Relationships", path: "/dashboard/lessons/family-members/speaking-practice" },
    { id: "colors", name: "Colors", path: "/dashboard/lessons/colors" },
    { id: "body-parts", name: "Body Parts", path: "/dashboard/lessons/body-parts" },
    { id: "food-drinks", name: "Food & Drinks", path: "/dashboard/lessons/food-drinks" },
    { id: "days-time", name: "Days & Time", path: "/dashboard/lessons/days-time" },
    { id: "directions", name: "Directions & Places", path: "/dashboard/lessons/directions" },
    { id: "emotions", name: "Emotions", path: "/dashboard/lessons/emotions" },
    { id: "weather", name: "Weather & Seasons", path: "/dashboard/lessons/weather" },
  ];

  // Find the first lesson not yet completed
  const getModuleKey = (id) => {
    const map = { "family-members": "Family Members", "numbers-counting": "Numbers & Counting", "basic-greetings": "Basic Greetings" };
    return map[id] || id.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  const nextLesson = ALL_LESSONS.find(m => {
    const key = getModuleKey(m.id);
    return !progress.some(p => (p.module === `Lessons: ${key}` || p.module === `Lessons: ${m.name}`) && p.status === 'completed');
  }) || { name: "All Done!", path: "#" };

  return (
    <div id="home" className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
          Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}!
        </h1>
        <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">
          Continue your language learning journey
        </p>
      </div>

      <StatsGrid progress={progress} />

      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight mb-4">
          Continue Learning
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Quiz Card */}
          <div className="relative overflow-hidden rounded-2xl md:rounded-[2rem] p-6 md:p-8 text-white bg-gradient-to-br from-indigo-600 to-indigo-700 shadow-xl shadow-indigo-100 group cursor-pointer"
            onClick={() => navigate('/dashboard/quiz')}>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative flex justify-between items-start">
              <div>
                <p className="text-xs font-black uppercase text-white/70 tracking-widest">Ongoing Task</p>
                <h3 className="text-xl md:text-2xl font-black mt-1">Daily Quiz</h3>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
                <ArrowRight size={22} />
              </div>
            </div>

            <div className="mt-8 md:mt-10">
              <div className="flex justify-between text-sm font-black mb-2 uppercase tracking-tight">
                <span>Quiz Mastery</span>
                <span>{quizProgress}%</span>
              </div>
              <div className="h-2.5 w-full bg-black/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000"
                  style={{ width: `${quizProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Next Lesson Card */}
          <div className="relative overflow-hidden rounded-2xl md:rounded-[2rem] p-6 md:p-8 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Next Lesson</p>
                <h3 className="text-xl md:text-2xl font-black text-slate-800 mt-1">{nextLesson.name}</h3>
              </div>
            </div>
            <p className="text-slate-500 mt-3 md:mt-4 font-medium text-sm md:text-base">Master the essentials of Hindi conversation.</p>
            <button
              onClick={() => nextLesson.path !== "#" && navigate(nextLesson.path)}
              className="mt-6 md:mt-8 px-5 md:px-6 py-2.5 md:py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
              disabled={nextLesson.path === "#"}
            >
              {nextLesson.path === "#" ? "Excellent Work! 🎉" : "Start Learning"}
            </button>
          </div>
        </div>
      </div>

      {/* Quick access row */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Scenes", emoji: "🎭", path: "/dashboard/scenes" },
            { label: "Capture & Learn", emoji: "📸", path: "/dashboard/scanner" },
            { label: "Slang", emoji: "💬", path: "/dashboard/slang" },
            { label: "Alphabets", emoji: "🔤", path: "/dashboard/alphabets" },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="bg-white border border-gray-100 rounded-2xl p-4 text-center hover:shadow-md hover:border-indigo-200 transition-all active:scale-95 group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{item.emoji}</div>
              <p className="text-xs font-black text-slate-600 uppercase tracking-wider leading-tight">{item.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
