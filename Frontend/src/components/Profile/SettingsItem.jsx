import { ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";

const SettingsItem = ({ icon: Icon, label, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="w-full flex flex-col">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-4 text-slate-600">
          <Icon size={20} strokeWidth={1.5} />
          <span className="text-[15px]">{label}</span>
        </div>
        {isOpen && children ? (
          <ChevronDown className="text-slate-600" size={18} strokeWidth={1.5} />
        ) : (
          <ChevronRight className="text-slate-400" size={18} strokeWidth={1.5} />
        )}
      </button>
      {isOpen && children && (
        <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 text-sm text-slate-600 animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
};
export default SettingsItem;