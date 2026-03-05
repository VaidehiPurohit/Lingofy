import React from 'react'
import { useNavigate } from "react-router-dom";
import LessonCard from '../LessonCard'

const BegLessons = () => {
    const navigate = useNavigate();
    return (
    <div className="w-full flex flex-col gap-5">

      <h2 className="text-xl font-semibold text-gray-800">
        Beginner
      </h2>

      <LessonCard
        title="Basic Greetings"
        description="Learn common greetings and introductions"
        level="Beginner"
        words={25}
        progress={0}
        completed={false}
        onClick={() => navigate("/dashboard/lessons/basic-greetings")}
      />

      <LessonCard
        title="Numbers & Counting"
        description="Master numbers from 1 to 100"
        level="Beginner"
        words={20}
        progress={0}
        completed={false}
        onClick={() => navigate("/dashboard/lessons/numbers-counting")}
      />

      <LessonCard
        title="Family Relationships"
        description="Vocabulary for family members"
        level="Beginner"
        words={20}
        progress={0}
        completed={false}
        onClick={() => navigate("/dashboard/lessons/family-members")}
      />

    </div>
  );
}

export default BegLessons