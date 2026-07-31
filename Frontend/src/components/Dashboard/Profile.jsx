import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  Key,
  ShieldCheck,
  Settings,
  Bell,
  Globe
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatsGrid from "./StatsGrid"
import SettingsSection from "../Profile/SettingSec";
import SettingsItem from "../Profile/SettingsItem";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "Student", email: "student@lingofy.com" });
  const [editName, setEditName] = useState("Student");
  const [language, setLanguage] = useState("Hindi");
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("lingofy_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === 'object') {
          setUser(parsed);
          if (parsed.name) setEditName(parsed.name);
          
          // Fetch real stats
          fetch(`http://localhost:5000/api/get-progress?email=${parsed.email}`)
            .then(res => res.json())
            .then(data => setProgress(data))
            .catch(err => console.error(err));
        }
      }
    } catch (e) { console.error("Stored user parse error:", e); }
    
    const savedLanguage = localStorage.getItem("lingofy_language");
    if (savedLanguage) setLanguage(savedLanguage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("lingofy_user");
    localStorage.removeItem("lingofy_quiz_taken");
    localStorage.removeItem("lingofy_study_seconds");
    localStorage.removeItem("lingofy_streak");
    localStorage.removeItem("lingofy_level");
    localStorage.removeItem("lingofy_daily_goal");
    localStorage.removeItem("lingofy_avg_accuracy");
    navigate("/");
  };

  const handleSaveProfile = () => {
    const updatedUser = { ...user, name: editName };
    setUser(updatedUser);
    localStorage.setItem("lingofy_user", JSON.stringify(updatedUser));
    alert("Profile saved successfully!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-12 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
            Account Settings
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">
            Manage your personal learning journey and preferences
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-700 p-8 shadow-2xl shadow-indigo-200">
        {/* Background Decorative Circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-28 h-28 rounded-[2rem] bg-white flex items-center justify-center text-4xl font-black text-indigo-600 shadow-xl border-4 border-white/20 transform group-hover:rotate-6 transition-transform duration-300">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-400 border-4 border-indigo-600 rounded-full shadow-lg"></div>
          </div>

          <div className="text-center md:text-left text-white">
            <h2 className="text-3xl font-black tracking-tight drop-shadow-sm">
              {user.name}
            </h2>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2 opacity-90 font-medium">
              <span className="flex items-center gap-1.5 justify-center md:justify-start">
                <Mail size={16} className="opacity-70" />
                {user.email}
              </span>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
              <span className="px-5 py-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/10 text-sm font-bold">
                Language: {language}
              </span>
              <span className="px-5 py-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/10 text-sm font-bold">
                Level: {user.level || localStorage.getItem('lingofy_level') || 'Beginner'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <StatsGrid progress={progress} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SettingsSection title="General">
          <SettingsItem icon={User} label="Personal Information">
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="font-bold text-xs uppercase tracking-wider opacity-60">Display Name</span>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  className="p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium shadow-sm transition-colors" 
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-bold text-xs uppercase tracking-wider opacity-60">Email Address</span>
                <input type="email" defaultValue={user.email} className="p-3 bg-white border border-slate-200 rounded-xl outline-none opacity-50 cursor-not-allowed font-medium shadow-sm" disabled />
              </label>
              <button 
                onClick={handleSaveProfile}
                className="self-end px-5 py-2.5 mt-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md active:scale-95 transition-all"
              >
                Save Changes
              </button>
            </div>
          </SettingsItem>
          <SettingsItem icon={Bell} label="Notification Settings">
             <div className="flex flex-col gap-4">
               <label className="flex items-center justify-between cursor-pointer group">
                 <span className="font-medium group-hover:text-indigo-600 transition-colors">Email Notifications</span>
                 <input type="checkbox" defaultChecked className="w-5 h-5 accent-indigo-600 rounded-lg cursor-pointer" />
               </label>
               <label className="flex items-center justify-between cursor-pointer group">
                 <span className="font-medium group-hover:text-indigo-600 transition-colors">Progress Weekly Reports</span>
                 <input type="checkbox" defaultChecked className="w-5 h-5 accent-indigo-600 rounded-lg cursor-pointer" />
               </label>
             </div>
          </SettingsItem>
          <SettingsItem icon={Globe} label="Region & Language">
             <div className="flex items-center justify-between">
               <span className="font-medium">Learning Language</span>
               <select 
                 className="p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-indigo-700 outline-none focus:border-indigo-500 shadow-sm cursor-pointer" 
                 defaultValue={language}
                 onChange={(e) => {
                   setLanguage(e.target.value);
                   localStorage.setItem("lingofy_language", e.target.value);
                   window.location.reload();
                 }}
               >
                 <option value="Hindi">Hindi</option>
                 <option value="English">English</option>
               </select>
             </div>
          </SettingsItem>
        </SettingsSection>

        <SettingsSection title="Security">
          <SettingsItem icon={Lock} label="Password & Security" />
          <SettingsItem icon={ShieldCheck} label="Account Privacy" />
          <SettingsItem icon={Settings} label="Preference Management" />
        </SettingsSection>
      </div>

      <div className="pt-4">
        <button 
          onClick={handleLogout}
          className="group w-full flex items-center justify-center gap-3 rounded-[1.5rem] border-2 border-rose-100 bg-rose-50/50 py-5 text-rose-600 font-black text-lg hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-[0.98] shadow-sm"
        >
          <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
          Log Out Account
        </button>
        <p className="text-center text-slate-400 text-xs mt-4 font-medium uppercase tracking-widest">
          Lingofy Version 2.1.0 • Stable Build
        </p>
      </div>
    </div>
  );
};

export default Profile;
