const SettingsSection = ({ title, children }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-gray-700 font-medium">
        {title}
      </h3>

      <div className="rounded-2xl border bg-white divide-y overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default SettingsSection;
