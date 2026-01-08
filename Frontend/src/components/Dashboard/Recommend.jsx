import {
  BookOpen,
  MessageSquare,
  Hash,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const Recommend = () => {
  const items = [
    {
      icon: BookOpen,
      title: "Family Relationships",
      subtitle: "Learn family terms",
      href: "/dashboard/lessons",
    },
    {
      icon: MessageSquare,
      title: "At the Restaurant",
      subtitle: "Practice ordering food",
      href: "/dashboard/scenes",
    },
    {
      icon: Hash,
      title: "Casual Greetings",
      subtitle: "Common informal phrases",
      href: "/dashboard/slang",
    },
    {
      icon: Trophy,
      title: "Daily Quiz",
      subtitle: "Test your knowledge",
      href: "/dashboard/quiz",
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          Recommended for You
        </h2>

        <button className="text-indigo-600 text-sm font-medium flex items-center gap-1">
          View All <ArrowRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={index}
              to={item.href}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl p-5 transition
                         cursor-pointer hover:shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Icon className="text-indigo-600" size={20} />
                </div>

                <div>
                  <h3 className="font-medium">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <ArrowRight className="text-gray-400" />
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default Recommend;
