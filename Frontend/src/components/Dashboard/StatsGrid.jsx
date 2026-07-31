import {
  Flame,
  Award,
  BookOpen,
  TrendingUp,
} from "lucide-react";

const StatsGrid = ({ progress = [] }) => {
  const completedData = progress.filter(p => p.status === 'completed');
  // Use unique completed lesson count — never resets because it's based on DB records
  const uniqueCompletedCount = new Set(completedData.map(p => p.module)).size;
  
  // XP Formula: 100 per unique lesson + 20 per practice attempt + quiz scores
  const lessonEntries = progress.filter(p => !p.module.includes('Quiz'));
  const completionXp = uniqueCompletedCount * 100;
  const practiceXp = lessonEntries.length * 20; 
  
  const quizXp = progress
    .filter(p => p.module === 'Daily Quiz')
    .reduce((acc, curr) => acc + Math.round((curr.score / 100) * 120), 0);
  
  const totalXp = completionXp + practiceXp + quizXp;
  
  // Accuracy: always show, based on all progress entries with a score
  const scoredEntries = progress.filter(p => p.score != null && p.score > 0);
  const avgAccuracy = scoredEntries.length 
    ? Math.round(scoredEntries.reduce((acc, curr) => acc + (curr.score || 0), 0) / scoredEntries.length) 
    : 0;

  const stats = [
    {
      icon: Flame,
      label: "Day Streak",
      value: localStorage.getItem('lingofy_streak') || (progress.length > 0 ? "1" : "0"),
      unit: "days",
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-100",
    },
    {
      icon: Award,
      label: "Total XP",
      value: totalXp,
      unit: "points",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
    },
    {
      icon: BookOpen,
      label: "Lessons Done",
      value: `${uniqueCompletedCount}/10`,
      unit: "completed",
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-100",
    },
    {
      icon: TrendingUp,
      label: "Accuracy",
      value: `${avgAccuracy}%`,
      unit: avgAccuracy >= 80 ? "Excellent!" : avgAccuracy >= 60 ? "Good job" : "Keep going",
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <div
            key={index}
            className={`bg-white rounded-2xl border ${stat.border} p-4 md:p-6 transition-all hover:shadow-md`}
          >
            <div
              className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${stat.bg}`}
            >
              <Icon className={`${stat.text}`} size={20} />
            </div>

            <h3 className="text-xl md:text-2xl font-semibold mt-3 md:mt-4 tracking-tight">
              {stat.value}
            </h3>

            <p className="text-xs md:text-sm text-gray-500 mt-0.5">{stat.label}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${stat.text} opacity-70`}>{stat.unit}</p>
          </div>
        );
      })}
    </div>
  );
};
export default StatsGrid;
