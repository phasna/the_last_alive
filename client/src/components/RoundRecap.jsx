import { motion } from "framer-motion";

export function RoundRecap({ recap = [], roundNumber }) {
  if (!recap?.length) {
    return (
      <p className="text-[#39ff14] text-sm tracking-widest mt-6">
        MANCHE {roundNumber} — AUCUN DÉGÂT
      </p>
    );
  }

  return (
    <motion.div
      className="mt-8 w-full max-w-md"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-[10px] text-[#5a6a5a] tracking-[0.4em] mb-3 text-center">
        RAPPORT DE MANCHE {roundNumber}
      </p>
      <div className="space-y-2">
        {recap.map((r, i) => (
          <div
            key={i}
            className={`flex justify-between items-center px-3 py-2 border text-xs ${
              r.eliminated
                ? "border-[#ff2a2a] text-[#ff2a2a]"
                : "border-[#1a2a1a] text-[#c8e6c8]"
            }`}
          >
            <span>{r.username}</span>
            <span className="text-[10px] text-[#5a6a5a]">
              {r.eliminated ? "ÉLIMINÉ" : `-${r.damage} ❤`} · {r.reason}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
