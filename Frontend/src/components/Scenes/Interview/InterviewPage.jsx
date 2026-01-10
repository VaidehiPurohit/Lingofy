import React from 'react'
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, HelpCircle, Award } from "lucide-react";


const InterviewPage = () => {
    const navigate = useNavigate();
  return (
    <div className="space-y-8">
    <button
        onClick={() => navigate("/dashboard/scenes")}
        className="flex items-center gap-2 text-m font-medium text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        Back to Scenes
      </button>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
           Job Interview
          </h1>
          <p className="text-gray-500 mt-1">
            Practice professional communication and interview responses
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white">
            <Star className="text-amber-500" size={18} />
            <span className="font-medium">10%</span>
          </div>

          <div className="px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-medium">
            Turn 1/12
          </div>
        </div>
      </div>

      <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500"
          style={{ width: "10%" }}
        />
      </div>

      <div className="rounded-2xl border border-sky-300 bg-sky-50 p-6 flex justify-between items-start">
        <div className="flex gap-3">
          <Award className="text-sky-600 mt-1" size={20} />
          <div>
            <p className="font-medium text-sky-900">
              Your task:
            </p>
            <p className="text-sky-800 mt-1">
                Introduce yourself and explain why you are a good fit for the role.
            </p>
          </div>
        </div>

        <button className="w-10 h-10 rounded-xl bg-sky-200 flex items-center justify-center text-sky-700 hover:bg-sky-300 transition">
          <HelpCircle size={18} />
        </button>
      </div>
    </div>
  );
};

export default InterviewPage