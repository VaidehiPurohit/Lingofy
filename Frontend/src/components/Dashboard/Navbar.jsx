import React, { useEffect, useState, useRef } from "react";
import { Bell, Settings, Globe, ChevronDown, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from '../../assets/Logo.svg';

const Navbar = ({ setIsSidebarOpen }) => {
  const [user, setUser] = useState({ name: "User" });
  const [language, setLanguage] = useState("Hindi");
  const [showLanguageFilter, setShowLanguageFilter] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("lingofy_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === 'object') setUser(parsed);
      }
    } catch (e) { console.error("Stored user parse error:", e); }

    const savedLanguage = localStorage.getItem("lingofy_language");
    if (savedLanguage) setLanguage(savedLanguage);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLanguageFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("lingofy_language", lang);
    setShowLanguageFilter(false);
  };

  return (
    <nav className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 relative z-30">
      
      {/* Left: Logo + Name */}
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => setIsSidebarOpen(prev => !prev)} 
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <Menu size={22} />
        </button>
        <Link to="/" className="flex items-center gap-2 md:gap-4 group cursor-pointer">
          <div className="hidden md:flex w-9 h-9 rounded-full bg-indigo-500 items-center justify-center group-hover:scale-110 transition-transform">
            <Globe size={18} color="white" />
          </div>
          <img src={Logo} alt="logo" className="h-9 md:h-11 w-auto" />
        </Link>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* Learning Language Toggle */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowLanguageFilter(!showLanguageFilter)}
            className="flex items-center gap-1.5 px-2.5 md:px-4 py-1.5 rounded-full border border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors text-sm font-medium cursor-pointer"
          >
            <span className="hidden sm:inline">Learning: </span>{language}
            <ChevronDown size={14} className={`transition-transform duration-300 ${showLanguageFilter ? "rotate-180" : ""}`} />
          </button>

          {showLanguageFilter && (
            <div className="absolute top-full mt-2 right-0 w-36 bg-white border border-indigo-100 rounded-xl shadow-lg overflow-hidden z-50 animate-in slide-in-from-top-2">
              {["Hindi", "English"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-indigo-50 ${language === lang ? "text-indigo-700 font-bold bg-indigo-50/50" : "text-gray-600"}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification */}
        <div className="relative cursor-pointer">
          <Bell size={20} className="text-gray-600" />
        </div>

        {/* Settings */}
        <Link to="/dashboard/profile">
          <Settings size={20} className="text-gray-600 cursor-pointer hover:rotate-45 transition-transform" />
        </Link>

        {/* User Avatar */}
        <Link to="/dashboard/profile">
          <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-medium cursor-pointer uppercase shadow-md hover:scale-110 active:scale-95 transition-all overflow-hidden border-2 border-white ring-1 ring-indigo-200">
            {user.name ? user.name.charAt(0) : "U"}
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
