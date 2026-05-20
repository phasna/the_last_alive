import { motion, AnimatePresence } from "framer-motion";

export function GlitchOverlay({ active, intensity = 1 }) {
  if (!active) return null;
  return (
    <AnimatePresence>
      <motion.div
        className="pointer-events-none fixed inset-0 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: intensity * 0.6 }}
        exit={{ opacity: 0 }}
      >
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px bg-[#ff2a2a]"
            style={{
              top: `${(i * 8.3) % 100}%`,
              opacity: 0.3 + Math.random() * 0.5,
              transform: `translateX(${Math.random() * 20 - 10}px)`,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-[rgba(255,42,42,0.05)] mix-blend-screen" />
      </motion.div>
    </AnimatePresence>
  );
}
