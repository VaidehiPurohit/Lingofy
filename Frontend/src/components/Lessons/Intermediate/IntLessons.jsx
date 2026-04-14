import React from 'react'
import { useNavigate } from "react-router-dom";
import LessonCard from '../LessonCard'
import { Lock } from 'lucide-react';

const IntLessons = ({ progressData = [], isLocked = false }) => {
    const navigate = useNavigate();

    const getProgressForModule = (moduleName) => {
        const moduleProgress = progressData.filter(p => p.module === `Lessons: ${moduleName}`);
        if (!moduleProgress.length) return 0;
        return Math.max(...moduleProgress.map(p => p.score || 0));
    };

    const lessons = [
        { title: "Business & Work", description: "Professional vocabulary and work ethics", words: 5, path: "/dashboard/lessons/intermediate/business" },
        { title: "Travel & Shopping", description: "Advanced travel scenarios and negotiation", words: 5, path: "/dashboard/lessons/intermediate/travel" },
        { title: "Social Events", description: "Participate in social gatherings and traditions", words: 5, path: "/dashboard/lessons/intermediate/social" },
        { title: "Health & Wellness", description: "Medical terms and healthy lifestyle", words: 5, path: "/dashboard/lessons/intermediate/health" },
        { title: "Technology", description: "Modern tech and digital terms", words: 5, path: "/dashboard/lessons/intermediate/tech" },
    ];

    return (
        <div className={`w-full flex flex-col gap-5 ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-800">Intermediate</h2>
                {isLocked && <Lock size={18} className="text-gray-400" />}
            </div>

            {lessons.map((lesson) => {
                const prog = getProgressForModule(lesson.title);
                return (
                    <LessonCard
                        key={lesson.title}
                        title={lesson.title}
                        description={lesson.description}
                        level="Intermediate"
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

export default IntLessons;
