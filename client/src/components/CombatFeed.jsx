import { motion, AnimatePresence } from "framer-motion";

export function CombatFeed({ feed = [] }) {
  if (!feed.length) return null;

  return (
    <div className="absolute top-16 right-4 w-48 z-20 space-y-1 pointer-events-none">
      <AnimatePresence initial={false}>
        {feed.slice(0, 6).map((entry, i) => (
          <motion.div
            key={entry.at ?? i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className={`text-[9px] tracking-wider px-2 py-1 border ${
              entry.type === "elimination"
                ? "border-[#ff2a2a] text-[#ff2a2a] bg-[rgba(255,42,42,0.1)]"
                : entry.type === "victory"
                  ? "border-[#39ff14] text-[#39ff14] bg-[rgba(57,255,20,0.1)]"
                  : "border-[#1a2a1a] text-[#5a6a5a] bg-[#08080a]"
            }`}
          >
            {entry.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
