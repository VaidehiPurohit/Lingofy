import {
  Flame,
  Award,
  BookOpen,
  TrendingUp,
} from "lucide-react";

const StatsGrid = () => {
  const stats = [
    {
      icon: Flame,
      label: "Day Streak",
      value: "0",
      bg: "bg-orange-100",
      text: "text-orange-600",
    },
    {
      icon: Award,
      label: "Total XP",
      value: "0",
      bg: "bg-emerald-100",
      text: "text-emerald-600",
    },
    {
      icon: BookOpen,
      label: "Lessons Done",
      value: "0",
      bg: "bg-blue-100",
      text: "text-blue-600",
    },
    {
      icon: TrendingUp,
      label: "Accuracy",
      value: "0%",
      bg: "bg-purple-100",
      text: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <div
            key={index}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}
            >
              <Icon className={`${stat.text}`} size={22} />
            </div>

            <h3 className="text-2xl font-semibold mt-4">
              {stat.value}
            </h3>

            <p className="text-sm text-gray-500">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
};
export default StatsGrid;
