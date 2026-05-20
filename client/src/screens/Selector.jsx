import { motion } from "framer-motion";
import { Sidebar } from "../components/layout/Sidebar";
import { TopBar } from "../components/layout/TopBar";
import { EventBanner } from "../components/EventBanner";
import { RoundRecap } from "../components/RoundRecap";

export function Selector({ gameState, selfId }) {
  const me = gameState.players.find((p) => p.id === selfId);
  const meta = gameState.currentMinigame;
  const isRecap = gameState.phase === "round_end";

  return (
    <div className="h-full min-h-dvh flex grid-bg scanlines ambient-bg">
      <Sidebar username={me?.username} activeNav="survivors" />
      <div className="flex-1 flex flex-col">
        <TopBar survivors={gameState.survivorsCount} lives={me?.lives} />
        <main className="flex-1 flex flex-col items-center justify-center p-8">
          {isRecap ? (
            <>
              <motion.p
                className="font-display text-2xl text-[#ff2a2a] tracking-widest"
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                MANCHE TERMINÉE
              </motion.p>
              <RoundRecap
                recap={gameState.lastRoundRecap}
                roundNumber={gameState.roundNumber}
              />
            </>
          ) : (
            <>
              <p className="text-[10px] tracking-[0.5em] text-[#5a6a5a] mb-6">
                INITIATING RANDOM SELECTION
              </p>
              {gameState.activeEvent && (
                <div className="mb-8 w-full max-w-md">
                  <EventBanner event={gameState.activeEvent} />
                </div>
              )}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[#39ff14]/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-6 rounded-full border border-[#39ff14]/50"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-28 h-28 border-2 border-[#39ff14] bg-[#0a140a] flex flex-col items-center justify-center neon-box"
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(57,255,20,0.2)",
                        "0 0 45px rgba(57,255,20,0.5)",
                        "0 0 20px rgba(57,255,20,0.2)",
                      ],
                    }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    <span className="text-4xl">{meta?.icon ?? "🎰"}</span>
                    <span className="text-[8px] text-[#5a6a5a] mt-2">SYS_READY</span>
                  </motion.div>
                </div>
              </div>
              {meta && (
                <motion.div
                  className="mt-10 text-center max-w-md"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className="font-display text-2xl neon-text tracking-widest">
                    {meta.name}
                  </p>
                  <p className="text-xs text-[#7a8a7a] mt-3">{meta.description}</p>
                </motion.div>
              )}
              <p className="mt-12 text-[10px] text-[#39ff14] tracking-[0.35em] pulse-neon">
                ENGAGE RANDOMIZER…
              </p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
