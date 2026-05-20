import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function TrapAnnouncer({ trap, onSound }) {
  useEffect(() => {
    onSound?.("eliminate");
  }, [onSound]);

  if (!trap) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 scanlines"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="text-center px-8 py-10 border-2 border-[#ff2a2a] danger-box max-w-lg glitch-active"
          initial={{ scale: 0.5, rotate: -2 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <p className="text-[10px] tracking-[0.5em] text-[#ff2a2a] mb-4">
            ⚠ FAKE ANSWER DETECTED
          </p>
          <h2 className="font-display text-3xl sm:text-4xl text-[#ff2a2a] tracking-widest leading-tight">
            VOUS ÊTES FAIT AVOIR
          </h2>
          <p className="font-display text-5xl sm:text-6xl text-[#ff2a2a] mt-4 tracking-[0.2em] title-flicker">
            BYE BYE
          </p>
          <p className="text-xs text-[#5a6a5a] mt-8 tracking-widest">
            Piège tendu par{" "}
            <span className="text-[#ffaa00]">{trap.byUsername}</span>
          </p>
          {trap.eliminated && (
            <p className="text-[#ff2a2a] text-sm mt-4 tracking-widest pulse-neon">
              ÉLIMINATION CONFIRMÉE
            </p>
          )}
          {!trap.eliminated && (
            <p className="text-[#39ff14] text-xs mt-4 tracking-widest">
              -1 VIE — SURVIE PARTIELLE
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
