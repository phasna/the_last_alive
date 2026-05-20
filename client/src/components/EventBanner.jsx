import { motion } from "framer-motion";

export function EventBanner({ event }) {
  if (!event) return null;

  return (
    <motion.div
      className="mb-4 w-full max-w-2xl border border-[#ffaa00] bg-[rgba(255,170,0,0.08)] px-4 py-2 flex items-center gap-3"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.4 }}
    >
      <span className="text-2xl">{event.icon}</span>
      <div>
        <p className="text-[#ffaa00] text-xs font-display tracking-widest">
          ÉVÉNEMENT D&apos;ARÈNE — {event.name}
        </p>
        <p className="text-[10px] text-[#5a6a5a]">{event.description}</p>
      </div>
    </motion.div>
  );
}
