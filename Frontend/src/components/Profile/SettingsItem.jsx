import { ChevronRight } from "lucide-react";

const SettingsItem = ({ icon: Icon, label }) => {
  return (
    <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
      <div className="flex items-center gap-3 text-gray-700">
        <Icon size={18} />
        <span>{label}</span>
      </div>
      <ChevronRight className="text-gray-400" size={18} />
    </button>
  );
};
export default SettingsItem;