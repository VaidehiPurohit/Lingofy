const SettingsSection = ({ title, children }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-slate-600 text-lg font-medium">
        {title}
      </h3>

      <div className="rounded-[1rem] border border-slate-800 bg-white divide-y divide-slate-800 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default SettingsSection;
