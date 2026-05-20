import { motion } from "framer-motion";
import { Sidebar } from "../components/layout/Sidebar";
import { StatCard } from "../components/ui/StatCard";
import { NeonButton } from "../components/ui/NeonButton";
import { PlayerAvatar } from "../components/PlayerAvatar";

function formatTime(ms) {
  if (!ms || ms < 1000) return "0:00";
  const sec = Math.floor(ms / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function computeRank(players, selfId) {
  const sorted = [...players].sort(
    (a, b) =>
      (b.points ?? 0) - (a.points ?? 0) ||
      (b.kills ?? 0) - (a.kills ?? 0) ||
      (b.lives ?? 0) - (a.lives ?? 0)
  );
  const idx = sorted.findIndex((p) => p.id === selfId);
  return idx >= 0 ? idx + 1 : players.length;
}

export function Winner({ gameState, selfId, onReturn }) {
  const winner = gameState.winner;
  const me = gameState.players.find((p) => p.id === selfId);
  const isWinner = winner?.id === selfId;
  const myRank = computeRank(gameState.players, selfId);
  const totalPlayers = gameState.players.length;

  const leaderboard = [...gameState.players].sort(
    (a, b) =>
      (b.id === winner?.id ? 1 : 0) - (a.id === winner?.id ? 1 : 0) ||
      (b.points ?? 0) - (a.points ?? 0) ||
      (b.kills ?? 0) - (a.kills ?? 0)
  );

  return (
    <div className="h-dvh max-h-dvh flex overflow-hidden grid-bg scanlines ambient-bg vignette">
      <Sidebar
        username={me?.username}
        avatarId={me?.avatar}
        eliminated={me?.eliminated}
        activeNav="profile"
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="shrink-0 relative border-b border-[#1a2a1a] px-4 py-6 sm:py-8 text-center overflow-hidden">
          <div className="absolute inset-0 topbar-accent opacity-50" />
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isWinner ? (
              <span className="status-pill status-pill--ok mx-auto mb-3">
                <span className="status-dot" />
                VICTOIRE
              </span>
            ) : (
              <span className="status-pill mx-auto mb-3 border-[#5a6a5a]/50 text-[#5a6a5a]">
                DÉFAITE
              </span>
            )}
            <h1
              className={`font-display text-3xl sm:text-4xl lg:text-5xl tracking-[0.1em] ${
                isWinner ? "neon-text title-flicker" : "text-[#c8e6c8]"
              }`}
            >
              {isWinner ? "LAST SURVIVOR" : "MATCH TERMINÉ"}
            </h1>
            <p className="text-[#5a6a5a] text-xs sm:text-sm mt-2 tracking-widest">
              {isWinner
                ? "Tu as survécu à l'arène — seul debout"
                : `Gagnant : ${winner?.username ?? "—"}`}
            </p>
          </motion.div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[220px_1fr_240px] gap-4 lg:gap-6 items-start">
            {/* Tes stats */}
            <section className="space-y-2">
              <p className="text-[9px] tracking-[0.35em] text-[#5a6a5a] mb-2 px-1">
                TON RAPPORT
              </p>
              <StatCard label="SCORE" value={me?.points ?? 0} />
              <StatCard label="KILLS" value={me?.kills ?? 0} />
              <StatCard
                label="STREAK"
                value={`x${me?.streak ?? 0}`}
              />
              <StatCard
                label="TIME ALIVE"
                value={formatTime(me?.survivedMs ?? 0)}
              />
              <StatCard
                label="CLASSEMENT"
                value={`#${myRank}`}
                sub={`sur ${totalPlayers} opérateurs`}
              />
            </section>

            {/* Podium */}
            <section className="flex flex-col items-center">
              <motion.div
                className={`relative w-full max-w-sm aspect-[3/4] flex flex-col items-center justify-end pb-6 border-2 ${
                  isWinner
                    ? "border-[#39ff14] neon-box"
                    : "border-[#1a2a1a] panel"
                }`}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <div className="absolute inset-0 grid-bg opacity-30" />
                {isWinner && (
                  <motion.div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-4xl"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    👑
                  </motion.div>
                )}
                <div className="relative z-10 mb-4">
                  <PlayerAvatar
                    avatarId={winner?.avatar}
                    size="hero"
                    highlight={isWinner}
                  />
                </div>
                <p className="font-display text-lg neon-text tracking-widest relative z-10">
                  {winner?.username ?? "—"}
                </p>
                <p className="text-[10px] text-[#5a6a5a] tracking-widest mt-1 relative z-10">
                  {isWinner ? "DERNIER SURVIVANT" : "CHAMPION DE LA MANCHE"}
                </p>
                {winner && (
                  <div className="flex gap-4 mt-4 relative z-10 text-[10px] tracking-widest">
                    <span className="text-[#39ff14]">
                      {winner.points ?? 0} PTS
                    </span>
                    <span className="text-[#5a6a5a]">
                      {winner.kills ?? 0} KILLS
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Classement */}
              <div className="w-full max-w-sm mt-4 panel p-3">
                <p className="text-[9px] tracking-[0.35em] text-[#5a6a5a] mb-3">
                  CLASSEMENT FINAL
                </p>
                <ul className="space-y-1.5 max-h-40 overflow-y-auto">
                  {leaderboard.map((p, i) => (
                    <li
                      key={p.id}
                      className={`flex items-center justify-between text-xs py-1.5 px-2 border-l-2 ${
                        p.eliminated && p.id !== winner?.id
                          ? "border-[#ff2a2a] bg-[rgba(255,42,42,0.1)] text-[#ff2a2a]"
                          : p.id === selfId
                            ? "border-[#39ff14] bg-[rgba(57,255,20,0.06)]"
                            : "border-transparent"
                      } ${p.id === winner?.id ? "text-[#39ff14]" : p.eliminated ? "" : "text-[#c8e6c8]"}`}
                    >
                      <span className="flex items-center gap-2 truncate min-w-0">
                        <PlayerAvatar
                          avatarId={p.avatar}
                          size="xs"
                          eliminated={p.eliminated && p.id !== winner?.id}
                        />
                        <span className="text-[#5a6a5a] w-4 shrink-0">
                          {i === 0 ? "👑" : `#${i + 1}`}
                        </span>
                        <span className="truncate">{p.username}</span>
                        {p.id === selfId && (
                          <span className="text-[8px] text-[#39ff14]">(toi)</span>
                        )}
                      </span>
                      <span
                        className={`tabular-nums shrink-0 ml-2 ${
                          p.eliminated && p.id !== winner?.id
                            ? "text-[#ff2a2a]"
                            : "text-[#5a6a5a]"
                        }`}
                      >
                        {p.eliminated && p.id !== winner?.id
                          ? "ÉLIMINÉ"
                          : `${p.points ?? 0} pts`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Récompenses */}
            <section className="space-y-3">
              <p className="text-[9px] tracking-[0.35em] text-[#5a6a5a] mb-2 px-1">
                RÉCOMPENSES
              </p>
              {isWinner ? (
                <>
                  <div className="panel border-[#39ff14]/40 p-4 flex gap-3 items-center corner-brackets">
                    <span className="text-3xl">🏆</span>
                    <div>
                      <p className="text-sm neon-text font-display tracking-wider">
                        GRAND WINNER
                      </p>
                      <p className="text-[10px] text-[#5a6a5a] mt-1">+15,000 XP</p>
                    </div>
                  </div>
                  <div className="panel p-4 flex gap-3 items-center">
                    <span className="text-3xl">⭐</span>
                    <div>
                      <p className="text-sm tracking-wider">ELITE_ALPHA</p>
                      <p className="text-[10px] text-[#39ff14] mt-1">
                        BADGE DÉBLOQUÉ
                      </p>
                    </div>
                  </div>
                  <div className="panel p-4 flex gap-3 items-center">
                    <span className="text-3xl">💀</span>
                    <div>
                      <p className="text-sm tracking-wider">LEGEND ENTRY</p>
                      <p className="text-[10px] text-[#5a6a5a] mt-1">Hall of fame</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="panel p-4 text-center">
                  <p className="text-[10px] text-[#5a6a5a] tracking-widest leading-relaxed">
                    Récompenses réservées au survivant. Retente ta chance.
                  </p>
                  <p className="text-[#39ff14] text-xs mt-3 font-display">
                    +{Math.max(50, (me?.points ?? 0) * 2)} XP participation
                  </p>
                </div>
              )}
              <div className="panel p-4">
                <div className="flex justify-between text-[10px] tracking-widest mb-2">
                  <span className="text-[#5a6a5a]">BATTLE PASS</span>
                  <span className="text-[#39ff14]">
                    {isWinner ? "75%" : "40%"}
                  </span>
                </div>
                <div className="progress-bar h-2">
                  <div
                    className="progress-bar__fill h-full"
                    style={{ width: isWinner ? "75%" : "40%" }}
                  />
                </div>
                {isWinner && (
                  <p className="text-[9px] text-[#39ff14] mt-2 tracking-widest text-center">
                    LEVEL UP DISPONIBLE
                  </p>
                )}
              </div>
            </section>
          </div>
        </main>

        <footer className="shrink-0 p-4 border-t border-[#1a2a1a] flex justify-center bg-[rgba(8,8,10,0.9)]">
          <NeonButton onClick={onReturn} className="w-full max-w-md py-4 text-sm">
            RETOUR AU MENU
          </NeonButton>
        </footer>
      </div>
    </div>
  );
}
