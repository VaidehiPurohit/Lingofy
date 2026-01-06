import {
  Zap,
  LayoutDashboard,
  BookOpen,
  MessageCircle,
  Hash,
  Trophy,
  Film,
} from "lucide-react";
import React from "react";

const Features = () => {
  return (
    <div id="features" className="flex flex-col items-center -mt-2">
      {/* Badge */}
      <div className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-400/10 rounded-full px-8 py-2">
        <Zap width={14} />
        <span>How It Works</span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-semibold text-center mx-auto mt-4">
        Key Features
      </h1>
      <p className="text-sm text-slate-500 text-center mt-2 max-w-lg mx-auto">
        Tools and features designed to help you learn and practice a language naturally.
      </p>

      {/* Features Grid */}
      <div className="relative max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14 px-8 md:px-0 pt-16">
        <div className="size-[520px] -top-80 left-1/2 -translate-x-1/2 rounded-full absolute blur-[300px] -z-10 bg-[#FBFFE1]" />

        {/* Dashboard */}
        <div>
          <div className="size-11 p-2 bg-indigo-50 border border-indigo-200 rounded flex items-center justify-center">
            <LayoutDashboard className="size-6 text-indigo-600" />
          </div>
          <div className="mt-5 space-y-2">
            <h3 className="text-base font-medium text-slate-700">Dashboard</h3>
            <p className="text-sm text-slate-500">
              View your progress, daily goals, and quick shortcuts in one place.
            </p>
          </div>
        </div>

        {/* Lessons */}
        <div>
          <div className="size-11 p-2 bg-indigo-50 border border-indigo-200 rounded flex items-center justify-center">
            <BookOpen className="size-6 text-indigo-600" />
          </div>
          <div className="mt-5 space-y-2">
            <h3 className="text-base font-medium text-slate-700">Lessons</h3>
            <p className="text-sm text-slate-500">
              Learn step by step with guided lessons and pronunciation practice.
            </p>
          </div>
        </div>

        {/* Scenes */}
        <div>
          <div className="size-11 p-2 bg-indigo-50 border border-indigo-200 rounded flex items-center justify-center">
            <MessageCircle className="size-6 text-indigo-600" />
          </div>
          <div className="mt-5 space-y-2">
            <h3 className="text-base font-medium text-slate-700">Scenes</h3>
            <p className="text-sm text-slate-500">
              Practice real-life conversations from everyday situations.
            </p>
          </div>
        </div>

        {/* Slang */}
        <div>
          <div className="size-11 p-2 bg-indigo-50 border border-indigo-200 rounded flex items-center justify-center">
            <Hash className="size-6 text-indigo-600" />
          </div>
          <div className="mt-5 space-y-2">
            <h3 className="text-base font-medium text-slate-700">Slang</h3>
            <p className="text-sm text-slate-500">
              Understand slang, expressions, and how people really speak.
            </p>
          </div>
        </div>

        {/* Quiz */}
        <div>
          <div className="size-11 p-2 bg-indigo-50 border border-indigo-200 rounded flex items-center justify-center">
            <Trophy className="size-6 text-indigo-600" />
          </div>
          <div className="mt-5 space-y-2">
            <h3 className="text-base font-medium text-slate-700">Quiz</h3>
            <p className="text-sm text-slate-500">
              Test your knowledge with short quizzes and track improvement.
            </p>
          </div>
        </div>

        {/* Movies & Books */}
        <div>
          <div className="size-11 p-2 bg-indigo-50 border border-indigo-200 rounded flex items-center justify-center">
            <Film className="size-6 text-indigo-600" />
          </div>
          <div className="mt-5 space-y-2">
            <h3 className="text-base font-medium text-slate-700">
              Movie & Book Picks
            </h3>
            <p className="text-sm text-slate-500">
              Discover movies and books that help you learn naturally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
