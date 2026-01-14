import {
  User,
  Mail,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  KeyIcon,
} from "lucide-react";
import StatsGrid from "../Dashboard/StatsGrid"
import SettingsSection from "../Profile/SettingSec";
import SettingsItem from "../Profile/SettingsItem";

const Profile = () => {
  return (
    <div className="space-y-8">
      
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Profile & Settings
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your account and preferences
        </p>
      </div>
      <div className="rounded-3xl bg-gradient-to-r from-indigo-500 to-indigo-500 p-6 flex items-center gap-6 text-white">
       
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-3xl font-semibold text-emerald-600">
          U
        </div>

        {/* Info */}
        <div>
          <h2 className="text-2xl font-semibold">
            User Name
          </h2>
          <p className="opacity-90">
            user@example.com
          </p>

          <span className="inline-block mt-3 px-4 py-1 rounded-full bg-white/20 text-sm">
            Learning: Hindi
          </span>
        </div>
      </div>

  
      <StatsGrid/>

      <SettingsSection title="Account">
        <SettingsItem icon={User} label="Edit Profile" />
        <SettingsItem icon={Mail} label="Email Settings" />
      </SettingsSection>

      <SettingsSection title="Privacy & Security">
        <SettingsItem icon={Lock} label="Privacy Settings" />
        <SettingsItem icon={KeyIcon
        } label="Change Password" />
      </SettingsSection>

      <SettingsSection title="Support">
        <SettingsItem icon={HelpCircle} label="Help Center" />
        <SettingsItem icon={HelpCircle} label="Contact Support" />
      </SettingsSection>
      <button className="w-full flex items-center justify-center gap-2 rounded-2xl border border-red-300 bg-red-50 py-4 text-red-600 font-medium hover:bg-red-100 transition">
        <LogOut size={18} />
        Log Out
      </button>
    </div>
  );
};

export default Profile;
