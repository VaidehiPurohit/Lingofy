import React from 'react'
import { useNavigate } from "react-router-dom";
import LessonCard from '../LessonCard'

const BegLessons = ({ progressData = [] }) => {
    const navigate = useNavigate();

    const getProgressForModule = (moduleName) => {
        const moduleProgress = progressData.filter(p => p.module === `Lessons: ${moduleName}`);
        if (!moduleProgress.length) return 0;
        return Math.max(...moduleProgress.map(p => p.score || 0));
    };

    const lessons = [
        {
            title: "Basic Greetings",
            description: "Learn common greetings and introductions",
            words: 25,
            path: "/dashboard/lessons/basic-greetings",
        },
        {
            title: "Numbers & Counting",
            description: "Master numbers from 1 to 100",
            words: 20,
            path: "/dashboard/lessons/numbers-counting",
        },
        {
            title: "Family Relationships",
            description: "Vocabulary for family members",
            words: 20,
            path: "/dashboard/lessons/family-members",
            module: "Family Members",
        },
        {
            title: "Colors",
            description: "Learn all major colors in Hindi",
            words: 10,
            path: "/dashboard/lessons/colors",
        },
        {
            title: "Body Parts",
            description: "Name the parts of the human body",
            words: 10,
            path: "/dashboard/lessons/body-parts",
        },
        {
            title: "Food & Drinks",
            description: "Essential Hindi vocabulary for food",
            words: 10,
            path: "/dashboard/lessons/food-drinks",
        },
        {
            title: "Days & Time",
            description: "Days of the week and time expressions",
            words: 10,
            path: "/dashboard/lessons/days-time",
        },
        {
            title: "Directions & Places",
            description: "Navigate your way around in Hindi",
            words: 10,
            path: "/dashboard/lessons/directions",
        },
        {
            title: "Emotions",
            description: "Express feelings and emotions in Hindi",
            words: 10,
            path: "/dashboard/lessons/emotions",
        },
        {
            title: "Weather & Seasons",
            description: "Talk about weather and seasons",
            words: 10,
            path: "/dashboard/lessons/weather",
        },
    ];

    return (
    <div className="w-full flex flex-col gap-5">
      <h2 className="text-xl font-semibold text-gray-800">Beginner</h2>

      {lessons.map((lesson) => {
        const moduleKey = lesson.module || lesson.title;
        const prog = getProgressForModule(moduleKey);
        return (
          <LessonCard
            key={lesson.title}
            title={lesson.title}
            description={lesson.description}
            level="Beginner"
            words={lesson.words}
            progress={prog}
            completed={prog >= 80}
            onClick={() => navigate(lesson.path)}
          />
        );
      })}
    </div>
  );
}

export default BegLessons