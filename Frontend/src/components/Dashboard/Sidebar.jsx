import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { API_BASE_URL } from '../../apiConfig'
import {
  Home,
  BookOpen,
  MessageSquare,
  Trophy,
  TrendingUp,
  User,
  SpellCheck,
  Hash,
  Sparkles,
  Camera
} from "lucide-react";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const sidebarRef = useRef(null)

  const menuItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Alphabets', href: '/dashboard/alphabets', icon: SpellCheck },
    { name: 'Lessons', href: '/dashboard/lessons', icon: BookOpen },
    { name: 'Scenes', href: '/dashboard/scenes', icon: MessageSquare },
    { name: 'Slang', href: '/dashboard/slang', icon: Hash },
    { name: 'Quiz', href: '/dashboard/quiz', icon: Trophy },
    { name: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
    { name: 'Capture & Learn', href: '/dashboard/scanner', icon: Camera },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
  ]

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsSidebarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setIsSidebarOpen])

  const [goal, setGoal] = useState(() => parseInt(localStorage.getItem('lingofy_daily_goal') || '10'));
  const [completedLessons, setCompletedLessons] = useState(0);

  useEffect(() => {
    // 1. Study Timer
    const interval = setInterval(() => {
        const current = parseInt(localStorage.getItem('lingofy_study_seconds') || '0', 10);
        localStorage.setItem('lingofy_study_seconds', (current + 1).toString());
    }, 1000);

    // 2. Streak Logic
    const lastDate = localStorage.getItem('lingofy_last_study_date');
    const todayStr = new Date().toDateString();
    let currentStreak = parseInt(localStorage.getItem('lingofy_streak') || '0', 10);

    if (lastDate !== todayStr) {
      if (lastDate) {
        const lastDateObj = new Date(lastDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastDateObj.toDateString() === yesterday.toDateString()) {
          // Consecutive day!
          currentStreak += 1;
        } else {
          // Day missed, reset streak to 1 (starting today)
          currentStreak = 1;
        }
      } else {
        // First time ever
        currentStreak = 1;
      }
      localStorage.setItem('lingofy_streak', currentStreak.toString());
      localStorage.setItem('lingofy_last_study_date', todayStr);
    }

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("lingofy_user"));
        if (user?.email) {
          const res = await fetch(`${API_BASE_URL}/api/get-progress?email=${user.email}`);
          const data = await res.json();
          const completedData = data.filter(p => p.status === 'completed');
          const uniqueCount = new Set(completedData.map(p => p.module)).size;
          setCompletedLessons(uniqueCount);
        }
      } catch (err) {}
    };
    fetchProgress();

    window.addEventListener('focus', fetchProgress);
    return () => window.removeEventListener('focus', fetchProgress);
  }, []); // Refreshes on Mount, Focus, and when navigating

  const handleSetGoal = async () => {
    const newGoal = prompt("Set your daily lesson goal:", goal);
    const parsed = parseInt(newGoal);
    if (!isNaN(parsed) && parsed > 0) {
      setGoal(parsed);
      localStorage.setItem('lingofy_daily_goal', parsed.toString());
      
      const user = JSON.parse(localStorage.getItem("lingofy_user"));
      if (user?.email) {
          fetch(`${API_BASE_URL}/api/user-data`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: user.email, daily_goal: parsed })
          }).catch(e => console.error(e));
      }
    }
  };

  const goalProgress = Math.min((completedLessons / goal) * 100, 100);

  return (
    <aside
      ref={sidebarRef}
      className={`w-64 bg-white border-r border-gray-200 flex flex-col absolute inset-y-0 left-0 z-30 h-full
        transition-transform duration-300 md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      {/* Menu */}
      <nav className="px-4 py-4 space-y-1 overflow-y-auto flex-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end
            onClick={() => { if(window.innerWidth < 768) setIsSidebarOpen(false) }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-black transition-all duration-200 tracking-tight
              ${isActive
                ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`
            }
          >
            <item.icon size={18} className="shrink-0" />
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Daily Goal (Premium Indigo) */}
      <div className="mt-auto px-4 pb-8">
        <div className="rounded-[2.5rem] border border-indigo-100 bg-indigo-50/50 p-6 space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-indigo-900 tracking-tight flex items-center justify-between">
              Daily Goal
              <button onClick={handleSetGoal} className="text-[10px] bg-white border border-indigo-100 hover:bg-indigo-100 px-2 py-0.5 rounded-full transition-colors">Edit</button>
            </h4>
            <p className="text-[11px] font-bold text-indigo-600/70 uppercase tracking-widest">{completedLessons} lessons completed</p>
          </div>
          
          <div className="space-y-4">
            <div className="h-2.5 w-full bg-indigo-100/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full shadow-sm shadow-indigo-200 transition-all duration-1000" 
                style={{ width: `${goalProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-black text-indigo-700/50 uppercase tracking-tighter">
              <span>{completedLessons} / {goal} lessons</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar