import { motion } from "framer-motion";
import { Sidebar } from "../components/layout/Sidebar";
import { StatCard } from "../components/ui/StatCard";
import { NeonButton } from "../components/ui/NeonButton";

function formatTime(ms) {
  const sec = Math.floor(ms / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function Winner({ gameState, selfId, onReturn }) {
  const winner = gameState.winner;
  const me = gameState.players.find((p) => p.id === selfId);
  const isWinner = winner?.id === selfId;

  return (
    <div className="h-full min-h-dvh flex grid-bg scanlines ambient-bg">
      <Sidebar username={me?.username} activeNav="profile" />
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="p-8 sm:p-12 text-center border-b border-[#1a2a1a] relative overflow-hidden">
          <div className="absolute inset-0 topbar-accent opacity-40" />
          <motion.h1
            className={`font-display text-4xl sm:text-5xl tracking-[0.12em] relative ${
              isWinner ? "neon-text title-flicker" : "text-[#c8e6c8]"
            }`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {isWinner ? "LAST SURVIVOR" : "MATCH TERMINÉ"}
          </motion.h1>
          <p className="text-[#5a6a5a] text-xs mt-3 tracking-widest relative">
            {isWinner
              ? "Tu as survécu à l'arène"
              : `Gagnant : ${winner?.username ?? "—"}`}
          </p>
        </header>

        <div className="flex-1 flex flex-wrap gap-6 p-6 sm:p-8 justify-center items-start">
          <div className="w-48 flex flex-col gap-3">
            <StatCard label="KILLS" value={winner?.kills ?? me?.kills ?? 0} />
            <StatCard
              label="BEST STREAK"
              value={`x${Math.max(winner?.streak ?? 0, me?.streak ?? 0, 1)}`}
            />
            <StatCard label="TIME ALIVE" value={formatTime(winner?.survivedMs ?? 0)} />
            <StatCard
              label="RANK"
              value={isWinner ? "#1 GLOBAL" : `#${gameState.players.length}`}
            />
          </div>

          <motion.div
            className="w-56 h-72 border-2 border-[#39ff14] bg-[#0a140a] flex items-center justify-center relative neon-box"
            animate={{
              boxShadow: [
                "0 0 20px rgba(57,255,20,0.25)",
                "0 0 50px rgba(57,255,20,0.45)",
                "0 0 20px rgba(57,255,20,0.25)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-8xl">☠</span>
            <p className="absolute bottom-4 font-display text-sm neon-text tracking-widest">
              {winner?.username}
            </p>
          </motion.div>

          <div className="w-52 flex flex-col gap-3">
            <p className="text-[10px] tracking-widest text-[#5a6a5a]">REWARDS</p>
            {isWinner && (
              <>
                <div className="panel border-[#39ff14]/40 p-3 flex gap-3 items-center">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="text-xs neon-text tracking-wider">GRAND WINNER</p>
                    <p className="text-[10px] text-[#5a6a5a]">+15,000 XP</p>
                  </div>
                </div>
                <div className="panel p-3 flex gap-3 items-center">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className="text-xs tracking-wider">ELITE_ALPHA</p>
                    <p className="text-[10px] text-[#5a6a5a]">BADGE UNLOCKED</p>
                  </div>
                </div>
              </>
            )}
            <div className="panel p-3">
              <p className="text-[10px] text-[#5a6a5a] tracking-widest">BATTLE PASS</p>
              <div className="progress-bar mt-3">
                <div className="progress-bar__fill w-3/4" />
              </div>
              <p className="text-[9px] text-[#39ff14] mt-2 tracking-widest">LVL UP</p>
            </div>
          </div>
        </div>

        <footer className="p-6 flex justify-center border-t border-[#1a2a1a]">
          <NeonButton onClick={onReturn} className="py-4 px-10">
            RETOUR AU MENU
          </NeonButton>
        </footer>
      </div>
    </div>
  );
}
