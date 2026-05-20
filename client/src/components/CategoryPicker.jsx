import { motion } from "framer-motion";

export function CategoryPicker({ categories, value, onChange, disabled }) {
  return (
    <div className="mb-4">
      <label className="block text-[10px] tracking-[0.35em] text-[#5a6a5a] mb-2">
        CATÉGORIE DE QUESTIONS
      </label>
      <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
        {categories.map((cat) => {
          const selected = value === cat.id;
          return (
            <motion.button
              key={cat.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(cat.id)}
              className={`text-left p-2.5 border transition-colors ${
                selected
                  ? "border-[#39ff14] bg-[rgba(57,255,20,0.08)]"
                  : "border-[#1a2a1a] hover:border-[#39ff14]/40"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              whileTap={disabled ? {} : { scale: 0.98 }}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg leading-none">{cat.icon}</span>
                <span className="flex-1 min-w-0">
                  <span
                    className={`block text-[10px] tracking-widest truncate ${
                      selected ? "text-[#39ff14]" : "text-[#c8e6c8]"
                    }`}
                  >
                    {cat.label}
                  </span>
                  {cat.count != null && (
                    <span className="text-[9px] text-[#5a6a5a]">
                      {cat.count} questions
                    </span>
                  )}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
