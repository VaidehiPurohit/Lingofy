import React from 'react'
import { useNavigate } from "react-router-dom";
import LessonCard from '../LessonCard'
import { Lock } from 'lucide-react';

const AdvLessons = ({ progressData = [], isLocked = false }) => {
    const navigate = useNavigate();

    const getProgressForModule = (moduleName) => {
        const moduleProgress = progressData.filter(p => p.module === `Lessons: ${moduleName}`);
        if (!moduleProgress.length) return 0;
        return Math.max(...moduleProgress.map(p => p.score || 0));
    };

    const lessons = [
        { title: "Literature & Poetry", description: "Classic literary terms and poetic beauty", words: 5, path: "/dashboard/lessons/advanced/literature" },
        { title: "Politics & Governance", description: "Political theories and governance terms", words: 5, path: "/dashboard/lessons/advanced/politics" },
        { title: "Science & Environment", description: "Advanced scientific concepts", words: 5, path: "/dashboard/lessons/advanced/science" },
        { title: "Philosophy & Ethics", description: "Deep philosophical discussions", words: 5, path: "/dashboard/lessons/advanced/philosophy" },
        { title: "Economy & Business", description: "Macroeconomic terms and global markets", words: 5, path: "/dashboard/lessons/advanced/economy" },
    ];

    return (
        <div className={`w-full flex flex-col gap-5 ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-800">Advanced</h2>
                {isLocked && <Lock size={18} className="text-gray-400" />}
            </div>

            {lessons.map((lesson) => {
                const prog = getProgressForModule(lesson.title);
                return (
                    <LessonCard
                        key={lesson.title}
                        title={lesson.title}
                        description={lesson.description}
                        level="Advanced"
                        words={lesson.words}
                        progress={prog}
                        completed={prog >= 80}
                        onClick={() => !isLocked && navigate(lesson.path)}
                    />
                );
            })}
        </div>
    );
}

export default AdvLessons;
