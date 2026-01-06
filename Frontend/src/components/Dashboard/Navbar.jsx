import React from "react";
import { Bell, Settings, Globe } from "lucide-react";
import Logo from '../../assets/Logo.svg';

const Navbar = () => {
  return (
    <nav className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      
      {/* Left: Logo + Name */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center">
          <Globe size={18} color="white" />
        </div>
       <img src={Logo} alt="logo" className='h-11 w-auto ' />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        
        {/* Learning Language */}
        <div className="px-4 py-1.5 rounded-full border border-indigo-300 bg-indigo-50 text-indigo-700 text-sm font-medium">
          Learning: Hindi
        </div>

        {/* Notification */}
        <div className="relative cursor-pointer">
          <Bell size={20} className="text-gray-600" />
          
        </div>

        {/* Settings */}
        <Settings size={20} className="text-gray-600 cursor-pointer" />

        {/* User Avatar */}
        <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-medium cursor-pointer">
          L
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
