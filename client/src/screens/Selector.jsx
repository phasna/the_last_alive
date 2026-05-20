import { motion } from "framer-motion";
import { Sidebar } from "../components/layout/Sidebar";
import { TopBar } from "../components/layout/TopBar";

export function Selector({ gameState, selfId }) {
  const me = gameState.players.find((p) => p.id === selfId);
  const meta = gameState.currentMinigame;

  return (
    <div className="h-full flex grid-bg scanlines">
      <Sidebar username={me?.username} activeNav="survivors" />
      <div className="flex-1 flex flex-col">
        <TopBar
          survivors={gameState.survivorsCount}
          lives={me?.lives}
        />
        <main className="flex-1 flex flex-col items-center justify-center p-8">
          <p className="text-[10px] tracking-[0.5em] text-[#5a6a5a] mb-8">
            INITIATING RANDOM SELECTION…
          </p>
          <div className="relative w-72 h-72">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#39ff14] opacity-40"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border border-[#39ff14] opacity-60"
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 border-2 border-[#39ff14] bg-[#0a0a0c] flex flex-col items-center justify-center neon-box">
                <span className="text-3xl">{meta?.icon ?? "🎰"}</span>
                <span className="text-[8px] text-[#5a6a5a] mt-1">SYS_READY</span>
              </div>
            </div>
          </div>
          {meta && (
            <motion.div
              className="mt-10 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <p className="font-display text-xl neon-text tracking-widest">
                {meta.name}
              </p>
              <p className="text-xs text-[#5a6a5a] mt-2 max-w-md">{meta.description}</p>
            </motion.div>
          )}
          <p className="mt-12 text-[10px] text-[#39ff14] tracking-[0.3em] pulse-neon">
            ENGAGE RANDOMIZER…
          </p>
        </main>
      </div>
    </div>
  );
}
