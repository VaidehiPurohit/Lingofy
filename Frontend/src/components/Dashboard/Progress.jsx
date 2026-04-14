import React, { useEffect, useState } from 'react';
import { Target, CheckCircle2, Award, Clock, ArrowRight, Flame, BarChart3, TrendingUp } from "lucide-react";
import { API_BASE_URL } from '../../apiConfig';

const Progress = () => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studySeconds, setStudySeconds] = useState(() => parseInt(localStorage.getItem('lingofy_study_seconds') || '0', 10));

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("lingofy_user"));
        if (user?.email) {
          const res = await fetch(`${API_BASE_URL}/api/get-progress?email=${user.email}`);
          const data = await res.json();
          setProgressData(data);
        }
      } catch (err) {
        console.error("Fetch progress failed:", err);
      } finally {
        setTimeout(() => setLoading(false), 500); // Smooth transition
      }
    };
    fetchProgress();
  }, []);

  useEffect(() => {
    // If empty locally, initialize it from progress history (~5 mins per module)
    const stored = localStorage.getItem('lingofy_study_seconds');
    if (stored === null && progressData.length > 0) {
      const fallback = progressData.length * 5 * 60;
      localStorage.setItem('lingofy_study_seconds', fallback.toString());
      setStudySeconds(fallback);
    } else if (stored !== null) {
      setStudySeconds(parseInt(stored, 10));
    }

    const interval = setInterval(() => {
      const current = localStorage.getItem('lingofy_study_seconds') || '0';
      setStudySeconds(parseInt(current, 10));
    }, 1000);
    return () => clearInterval(interval);
  }, [progressData.length]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );

  const completedData = progressData.filter(p => p.status === 'completed');
  // Use unique modules to prevent double counting
  const uniqueCompletedCount = new Set(completedData.map(p => p.module)).size;

  // Calculate XP accurately: 100 for unique completions + 20 for every practice attempt
  const lessonEntries = progressData.filter(p => !p.module.includes('Quiz'));
  const completionXp = uniqueCompletedCount * 100;
  const practiceXp = lessonEntries.length * 20; 
  
  const quizXp = progressData
    .filter(p => p.module === 'Daily Quiz')
    .reduce((acc, curr) => acc + Math.round((curr.score / 100) * 120), 0);
  
  const totalXp = completionXp + practiceXp + quizXp;
  const streak = (localStorage.getItem('lingofy_streak') || "1") + " day" + (localStorage.getItem('lingofy_streak') === "1" ? "" : "s");
  const studyHours = (studySeconds / 3600).toFixed(2) + " hrs";
  const avgScore = progressData.length ? Math.round(progressData.reduce((acc, curr) => acc + curr.score, 0) / progressData.length) : 0;

  // Compute Weekly Activity from actual progress history
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // Mon=0..Sun=6
  
  const weeklyLessonCounts = [0, 0, 0, 0, 0, 0, 0];
  
  progressData.forEach(p => {
    if (p.status === 'completed' && p.date) {
      const date = new Date(p.date);
      const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
      
      // Only count if it's within the current week (optional, but cleaner)
      // For now, let's just group by day of week regardless of which week it was
      // to populate the chart even if it's old data.
      weeklyLessonCounts[dayIndex]++;
    }
  });

  const weeklyHeights = weeklyLessonCounts.map((count, i) => {
    // Map count (0-8) to height (0-100%). Default to tiny sliver if zero to show the bar still exists.
    return count === 0 ? 3 : Math.min(100, (count / 8) * 100);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-20 animate-in fade-in duration-700">

      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Your Progress</h1>
        <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Track your learning journey and growth</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard icon={<Flame className="text-orange-500" />} label="Current Streak" value={streak} subValue="Keep it up!" />
        <StatCard icon={<Award className="text-emerald-500" />} label="Total XP" value={totalXp} subValue="Beginner" />
        <StatCard icon={<Target className="text-indigo-500" />} label={`Lessons Completed`} value={`${uniqueCompletedCount}/10`} subValue="Active" />
        <StatCard icon={<Clock className="text-purple-500" />} label="Study Time" value={studyHours} subValue="Consistent" />
      </div>

      {/* Charts Section */}
      <div className="flex justify-center">

        {/* Weekly Activity (Figma Style) */}
        <div className="bg-white px-4 md:px-10 py-6 md:py-10 w-full lg:w-3/4 rounded-2xl md:rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-10">
            <TrendingUp className="text-emerald-500" size={22} />
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Weekly Activity</h3>
          </div>

          <div className="relative h-64 flex items-end justify-between gap-4 px-2">
            {/* Background Grid Lines */}
            <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
              {[8, 6, 4, 2, 0].map(val => (
                <div key={val} className="w-full flex items-center gap-4">
                  <span className="text-[11px] font-bold text-slate-300 w-4 text-right">{val}</span>
                  <div className="flex-1 h-px bg-slate-100 border-dashed border-slate-100"></div>
                </div>
              ))}
            </div>

            {/* Bars */}
            <div className="relative z-10 w-full flex items-end justify-between gap-4 h-full pt-4 pb-8">
              {weeklyHeights.map((h, i) => {
                const isToday = i === todayIndex;
                const activityValue = weeklyLessonCounts[i];

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4 group relative h-full justify-end">
                    {/* Hover Card (Figma Style) */}
                    <div className="absolute bottom-[calc(100%-10px)] left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 z-50 pointer-events-none">
                      <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-2xl shadow-indigo-100 min-w-[100px]">
                        <p className="text-[12px] font-black text-slate-900 mb-1">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</p>
                        <p className="text-[11px] font-bold text-emerald-500">lessons : {activityValue}</p>
                      </div>
                      <div className="w-3 h-3 bg-white border-r border-b border-slate-100 rotate-45 mx-auto -mt-1.5 shadow-sm"></div>
                    </div>

                    {/* Today's Background Highlight Bar (Grey) */}
                    {isToday && (
                      <div className="absolute inset-x-0 top-0 bottom-0 bg-slate-100/50 rounded-2xl -z-10 pointer-events-none"></div>
                    )}

                    {/* The Actual Data Bar */}
                    <div
                      className={`w-full max-w-[45px] rounded-xl transition-all duration-500 ${isToday ? 'bg-emerald-500 shadow-lg shadow-emerald-100' : 'bg-emerald-500/80'} group-hover:brightness-105 cursor-pointer`}
                      style={{ height: `${h}%` }}
                    ></div>
                    <span className={`text-[12px] font-bold tracking-tight ${isToday ? 'text-slate-800 font-black' : 'text-slate-400'}`}>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Mastery List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Recent Mastery</h2>
        <div className="grid grid-cols-1 gap-4">
          {progressData.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Start your first lesson to see progress</p>
            </div>
          ) : (
            progressData.map((item, idx) => (
              <div key={idx} className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm transition-all hover:shadow-md flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white shadow-lg ${item.score >= 80 ? 'bg-emerald-500' : 'bg-indigo-500'}`}>
                    {item.score}%
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-800 tracking-tight">{item.module}</h4>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-0.5">Mastered on {item.date ? new Date(item.date).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all cursor-pointer">
                  <ArrowRight size={22} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}

const StatCard = ({ icon, label, value, subValue }) => (
  <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
    <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center mb-3 md:mb-6 text-xl">
      {icon}
    </div>
    <p className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] mb-1 md:mb-2">{label}</p>
    <div className="flex flex-col">
      <span className="text-xl md:text-3xl font-black text-slate-800">{value}</span>
      <span className="text-[11px] font-bold text-slate-400 mt-0.5">{subValue}</span>
    </div>
  </div>
);

export default Progress