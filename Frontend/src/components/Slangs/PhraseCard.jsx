
const PhraseCard = ({
  title,
  count,
  description,
  preview = [],
  gradient,
  hoverBorder,
  icon: Icon,
   onClick,
}) => {
  return (
    <div
    onClick={onClick}
  className={`
    group rounded-xl overflow-hidden bg-white border border-gray-200
    transition-all duration-200
    hover:-translate-y-1 hover:shadow-md
    ${hoverBorder}
  `}
>

      <div
        className={`p-6 text-white ${gradient}`}
      >
        {Icon && (
          <Icon className="mb-4" size={28} />
        )}

        <h3 className="text-xl font-semibold">
          {title}
        </h3>

        <p className="text-sm opacity-90 mt-1">
          {count} phrases
        </p>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-gray-600">
          {description}
        </p>

        <div> 
          <p className="text-sm text-gray-500 mb-2">
            Preview:
          </p>

          <ul className="space-y-2  text-gray-700 pl-2">
            {preview.map((item, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-gray-400">#</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PhraseCard;
